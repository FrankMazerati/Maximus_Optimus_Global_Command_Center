import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/command/AppShell";
import { WidgetCard } from "@/components/command/widgets";
import { menu } from "@/lib/menu";

const extra = { title: "User & Role Administration", slug: "user-role-administration", description: "Identity governance and access control command.", groups: [{ name: "Access", items: ["Users Overview", "Roles", "Permissions Matrix", "Access Reviews", "Role Assignments", "Audit & Compliance"] }] };

export const Route = createFileRoute("/section/$slug")({
  loader: ({ params }) => {
    const s = [...menu, extra].find((m) => m.slug === params.slug);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.title} — Global Command Center` : "Section — Global Command Center";
    const d = loaderData?.description || "IntelliStack Systems Global Command Center section.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: SectionPage,
});

function SectionPage() {
  const s = Route.useLoaderData();
  return (
    <AppShell active={s.slug}>
      <div className="panel mb-4 p-5">
        <h1 className="font-display text-3xl font-bold text-glow">{s.title}</h1>
        <p className="mt-1 text-muted-foreground">{s.description}</p>
      </div>
      <WidgetCard w={{ kind: "groups", title: "Sections", groups: s.groups }} />
    </AppShell>
  );
}
