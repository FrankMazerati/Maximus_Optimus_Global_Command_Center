import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.119.0";

type Actor = {
  id: string;
  organizationId: string;
  tenantId: string | null;
  roles: string[];
};
type Body = Record<string, unknown>;

const adminRoles = new Set(["super_admin", "global_admin", "organization_admin"]);
const dispatchRoles = new Set([
  "super_admin", "global_admin", "organization_admin", "service_desk_manager",
  "help_desk_supervisor", "it_manager", "help_desk_l1", "help_desk_l2", "help_desk_l3",
]);
function cors(request: Request): HeadersInit {
  const origin = request.headers.get("origin") ?? "*";
  const configured = Deno.env.get("APP_ALLOWED_ORIGINS");
  const allowed = configured?.split(",").map((v) => v.trim()).filter(Boolean);
  return {
    "Access-Control-Allow-Origin": !allowed || allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function reply(request: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(request), "Content-Type": "application/json" },
  });
}
function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function isAdmin(actor: Actor): boolean {
  return actor.roles.some((role) => adminRoles.has(role));
}
function canDispatch(actor: Actor): boolean {
  return actor.roles.some((role) => dispatchRoles.has(role));
}
async function requireActor(request: Request): Promise<{ actor: Actor; service: SupabaseClient }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Sign in is required.");
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) throw new Error("Supabase runtime configuration is incomplete.");

  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(authorization.slice(7));
  if (authError || !authData.user) throw new Error("Your sign-in session is invalid or expired.");

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await service.from("profiles")
    .select("id,organization_id,tenant_id,member_status")
    .eq("id", authData.user.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile || profile.member_status !== "active" || !profile.organization_id) {
    throw new Error("An active IntelliStack organization profile is required.");
  }

  const { data: assignments, error: roleError } = await service.from("profile_roles")
    .select("role_id,starts_at,expires_at,is_active")
    .eq("profile_id", profile.id).eq("is_active", true);
  if (roleError) throw roleError;
  const now = Date.now();
  const ids = (assignments ?? []).filter((row) => {
    const starts = row.starts_at ? Date.parse(row.starts_at) : 0;
    const expires = row.expires_at ? Date.parse(row.expires_at) : Number.POSITIVE_INFINITY;
    return starts <= now && expires > now;
  }).map((row) => row.role_id);
  let roles: string[] = [];
  if (ids.length) {
    const { data, error } = await service.from("roles").select("id,role_key").in("id", ids);
    if (error) throw error;
    roles = (data ?? []).map((row) => row.role_key);
  }
  return {
    service,
    actor: {
      id: profile.id,
      organizationId: profile.organization_id,
      tenantId: profile.tenant_id,
      roles,
    },
  };
}

async function handle(request: Request, service: SupabaseClient, actor: Actor, body: Body): Promise<Response> {
  const action = String(body.action ?? "");

  if (action === "dispatch") {
    if (!canDispatch(actor)) return reply(request, 403, { error: "Your role cannot dispatch help desk work." });
    if (!isUuid(body.ticket_id)) return reply(request, 400, { error: "A valid ticket_id is required." });
    const { data, error } = await service.rpc("dispatch_offer_ticket", {
      p_ticket_id: body.ticket_id,
      p_actor_profile_id: actor.id,
    });
    if (error) throw error;
    return reply(request, 200, data);
  }

  if (action === "respond") {
    if (!isUuid(body.offer_id)) return reply(request, 400, { error: "A valid offer_id is required." });
    const response = String(body.response ?? "");
    if (!["accept", "decline", "request_info"].includes(response)) {
      return reply(request, 400, { error: "response must be accept, decline, or request_info." });
    }
    const note = typeof body.note === "string" ? body.note.trim() : null;
    const { data, error } = await service.rpc("dispatch_respond_to_offer", {
      p_offer_id: body.offer_id,
      p_actor_profile_id: actor.id,
      p_response: response,
      p_note: note,
    });
    if (error) throw error;
    return reply(request, 200, data);
  }

  if (action === "presence") {
    const availability = String(body.availability_status ?? "");
    if (!["available", "busy", "in_meeting", "away", "offline"].includes(availability)) {
      return reply(request, 400, { error: "Unsupported availability_status." });
    }
    const switches = Number(body.context_switches_30m ?? 0);
    if (!Number.isInteger(switches) || switches < 0 || switches > 100) {
      return reply(request, 400, { error: "context_switches_30m must be an integer from 0 to 100." });
    }
    const { error } = await service.rpc("dispatch_upsert_presence", {
      p_profile_id: actor.id,
      p_organization_id: actor.organizationId,
      p_tenant_id: actor.tenantId,
      p_availability_status: availability,
      p_availability_mode: body.availability_mode === "manual" ? "manual" : "automatic",
      p_current_activity: typeof body.current_activity === "string" ? body.current_activity.slice(0, 160) : null,
      p_current_context_key: typeof body.current_context_key === "string" ? body.current_context_key.slice(0, 120) : null,
      p_context_switches_30m: switches,
      p_estimated_remaining_minutes: Number.isInteger(body.estimated_remaining_minutes) ? Math.max(0, Number(body.estimated_remaining_minutes)) : null,
    });
    if (error) throw error;
    return reply(request, 200, { success: true, availability_status: availability });
  }

  if (action === "link_workforce_profile") {
    if (!isAdmin(actor)) return reply(request, 403, { error: "An authorized administrator is required to link workforce identities." });
    if (!isUuid(body.profile_id) || !isUuid(body.workforce_person_id)) {
      return reply(request, 400, { error: "profile_id and workforce_person_id must be UUIDs." });
    }
    const [{ data: profile, error: profileError }, { data: person, error: personError }] = await Promise.all([
      service.from("profiles").select("id,organization_id,tenant_id").eq("id", body.profile_id).maybeSingle(),
      service.from("workforce_people").select("id,organization_id,tenant_id").eq("id", body.workforce_person_id).maybeSingle(),
    ]);
    if (profileError) throw profileError;
    if (personError) throw personError;
    if (!profile || !person || profile.organization_id !== actor.organizationId ||
      person.organization_id !== actor.organizationId || profile.organization_id !== person.organization_id ||
      profile.tenant_id !== person.tenant_id || (actor.tenantId && profile.tenant_id !== actor.tenantId)) {
      return reply(request, 404, { error: "The profile and workforce record must belong to the same authorized organization and tenant." });
    }
    const { error } = await service.rpc("dispatch_link_workforce_profile", {
      p_profile_id: profile.id,
      p_workforce_person_id: person.id,
      p_organization_id: profile.organization_id,
      p_tenant_id: profile.tenant_id,
      p_experience_months: Math.max(0, Math.min(720, Number(body.experience_months ?? 0) || 0)),
      p_dispatch_level: ["L1", "L2", "L3", "lead", "manager"].includes(String(body.dispatch_level)) ? String(body.dispatch_level) : "L1",
      p_linked_by: actor.id,
    });
    if (error) throw error;
    return reply(request, 200, { success: true, profile_id: profile.id, workforce_person_id: person.id });
  }

  if (action === "set_profile_skills") {
    if (!isAdmin(actor)) return reply(request, 403, { error: "An authorized administrator is required to manage verified dispatch skills." });
    if (!isUuid(body.profile_id) || !Array.isArray(body.skill_keys) ||
      body.skill_keys.length > 50 || body.skill_keys.some((key) => typeof key !== "string")) {
      return reply(request, 400, { error: "A profile_id and an array of at most 50 skill_keys are required." });
    }
    const { data: profile, error: profileError } = await service.from("profiles")
      .select("id,organization_id,tenant_id").eq("id", body.profile_id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.organization_id !== actor.organizationId ||
      (actor.tenantId && profile.tenant_id !== actor.tenantId)) {
      return reply(request, 404, { error: "Profile not found in your authorized scope." });
    }
    const keys = [...new Set((body.skill_keys as string[]).map((key) => key.trim()).filter(Boolean))];
    const { data: skills, error: skillError } = await service.from("skills")
      .select("id,skill_key").in("skill_key", keys);
    if (skillError) throw skillError;
    if ((skills ?? []).length !== keys.length) return reply(request, 400, { error: "One or more skill keys do not exist in the catalog." });
    const { data, error } = await service.rpc("dispatch_set_profile_skills", {
      p_profile_id: profile.id,
      p_organization_id: profile.organization_id,
      p_tenant_id: profile.tenant_id,
      p_skill_keys: keys,
      p_proficiency: Math.max(1, Math.min(5, Number(body.proficiency ?? 3) || 3)),
    });
    if (error) throw error;
    return reply(request, 200, data);
  }

  if (action === "set_ticket_requirements") {
    if (!canDispatch(actor)) return reply(request, 403, { error: "Your role cannot configure ticket skill requirements." });
    if (!isUuid(body.ticket_id) || !Array.isArray(body.required_skill_keys) ||
      body.required_skill_keys.length > 20 || body.required_skill_keys.some((key) => typeof key !== "string")) {
      return reply(request, 400, { error: "A ticket_id and at most 20 required_skill_keys are required." });
    }
    const { data: ticket, error: ticketError } = await service.from("tickets")
      .select("id,organization_id,tenant_id").eq("id", body.ticket_id)
      .eq("organization_id", actor.organizationId)
      .maybeSingle();
    if (ticketError) throw ticketError;
    if (!ticket || (actor.tenantId && ticket.tenant_id && ticket.tenant_id !== actor.tenantId)) {
      return reply(request, 404, { error: "Ticket not found in your authorized scope." });
    }
    const keys = [...new Set((body.required_skill_keys as string[]).map((key) => key.trim()).filter(Boolean))];
    if (keys.length) {
      const { data: skills, error } = await service.from("skills").select("skill_key").in("skill_key", keys);
      if (error) throw error;
      if ((skills ?? []).length !== keys.length) return reply(request, 400, { error: "One or more required skill keys are not in the skills catalog." });
    }
    const { error } = await service.rpc("dispatch_set_ticket_requirements", {
      p_ticket_id: ticket.id,
      p_organization_id: ticket.organization_id,
      p_tenant_id: ticket.tenant_id ?? actor.tenantId,
      p_required_skill_keys: keys,
      p_complexity: Math.max(1, Math.min(5, Number(body.complexity ?? 2) || 2)),
      p_updated_by: actor.id,
    });
    if (error) throw error;
    return reply(request, 200, { success: true, required_skill_keys: keys });
  }

  if (action === "queue") {
    const { data, error } = await service.from("ticket_offers")
      .select("id,ticket_id,offer_status,offered_at,responded_at,response_note,tickets!inner(id,ticket_number,title,description,priority,status,requester_profile_id,assigned_profile_id,opened_at,response_due_at,resolution_due_at)")
      .eq("offered_to_profile_id", actor.id)
      .order("offered_at", { ascending: false }).limit(100);
    if (error) throw error;
    return reply(request, 200, { offers: data ?? [] });
  }

  if (action === "health") {
    return reply(request, 200, {
      service: "Maximus Adaptive Workforce Intelligence",
      status: "authenticated",
      intellisync: "event emitter connected through database RPC",
      actor_profile_id: actor.id,
    });
  }

  return reply(request, 400, { error: "Unsupported adaptive-dispatch action." });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return reply(request, 405, { error: "Method not allowed." });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return reply(request, 400, { error: "A JSON object request body is required." });
    }
    const { actor, service } = await requireActor(request);
    return await handle(request, service, actor, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected dispatch service error.";
    const status = message.includes("Sign in") || message.includes("session") ? 401
      : message.includes("role") || message.includes("authorized") || message.includes("profile") ? 403
      : 500;
    return reply(request, status, { error: message });
  }
});
