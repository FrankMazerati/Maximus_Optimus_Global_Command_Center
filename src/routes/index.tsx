import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Menu, Bell, Mail, MessageSquare, ChevronDown, ChevronRight, Camera, Image as ImageIcon, User, Phone, MapPin,
  CloudSun, Globe, Search, Mic, Settings, HelpCircle, Building2, TrendingUp, TrendingDown, Send, X, FileText, PenLine,
  CreditCard, Linkedin, LogOut, Users, Clock, Newspaper, BarChart3, Zap, Hexagon, Home, IdCard,
} from "lucide-react";
import portraitAsset from "@/assets/frank-mazerati.jpg.asset.json";
import shieldAsset from "@/assets/intellistack-shield.jpg.asset.json";
import commandBg from "@/assets/command-center.jpg";
import buddy from "@/assets/help-buddy.png";
import { ConfigModule } from "@/components/command/ConfigModule";
import { menu } from "@/lib/menu";
import { dashboardPages, resolveMenuItem } from "@/lib/dashboard-pages";
import { Button } from "@/components/ui/button";
import {
  clockCatalog, newsCatalog, marketCatalog, tickerCatalog, quickPickCatalog, workSections, helpBuddySections,
  greetingMessages, dayPart,
} from "@/lib/home-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maximus Optimus — Global Command Center" },
      { name: "description", content: "IntelliStack Systems Global Administrator command center." },
      { property: "og:title", content: "Maximus Optimus — Global Command Center" },
      { property: "og:description", content: "IntelliStack Systems Global Administrator command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const managers = [
  { name: "Angela Brooks", title: "Direct Manager • VP Operations", email: "angela.brooks@intellistacksystems.com", phone: "773-555-0182" },
  { name: "Marcus Hill", title: "Skip-Level • SVP Technology", email: "marcus.hill@intellistacksystems.com", phone: "312-555-0119" },
  { name: "Renee Alvarez", title: "HR Business Partner", email: "renee.alvarez@intellistacksystems.com", phone: "773-555-0164" },
];
const profileActions = [
  [FileText, "Resume"], [FileText, "Cover Letter"], [PenLine, "Create Bio"], [CreditCard, "Add Payment Method"], [Linkedin, "Connect LinkedIn"], [Settings, "Account Settings"], [LogOut, "Sign Out"],
] as const;
const statuses = ["Available", "Busy", "In a Meeting", "On a Call", "Helping a User", "At Lunch", "On Break", "Away"];
const CHI = "America/Chicago";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(i); }, []);
  return now;
}
const fmt = (d: Date | null, tz: string, o: Intl.DateTimeFormatOptions) => (d ? d.toLocaleString("en-US", { timeZone: tz, ...o }) : "--");

function Change({ c }: { c?: string }) {
  const up = !c?.startsWith("-");
  return <span className={`flex items-center gap-0.5 text-[9px] ${up ? "text-success" : "text-destructive"}`}>{up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}{c}</span>;
}

function Index() {
  const now = useNow();
  const [status, setStatus] = useState("Available");
  const [statusOpen, setStatusOpen] = useState(false);
  const [mgrOpen, setMgrOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [photo, setPhoto] = useState<string>(portraitAsset.url);
  const [bg, setBg] = useState<string>(commandBg);
  const [openWork, setOpenWork] = useState<string | null>(workSections[0]?.title ?? null);
  const [stage, setStage] = useState<"Today" | "Recent Days" | "Upcoming">("Today");
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const photoIn = useRef<HTMLInputElement>(null);
  const bgIn = useRef<HTMLInputElement>(null);
  const pick = (set: (u: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) set(URL.createObjectURL(f)); };

  const hour = now ? Number(fmt(now, CHI, { hour: "numeric", hour12: false })) % 24 : 9;
  const greet = greetingMessages[dayPart(hour)];
  const filteredMenu = menu.filter((m) => JSON.stringify(m).toLowerCase().includes(menuQuery.toLowerCase()));

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <img src={bg} alt="" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />

      <div className="relative mx-auto max-w-[1600px] p-3">
        {/* PRIMARY BAR */}
        <header className="relative z-40 flex items-center gap-3 rounded-lg border border-border bg-header/80 px-3 py-1.5 backdrop-blur">
          <Button variant="plain" size="plain" onClick={() => setDrawer(!drawer)} className="glass-btn !h-8 !w-8" aria-label="Menu" aria-expanded={drawer}>{drawer ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</Button>
          <div className="flex items-center gap-2">
            <img src={shieldAsset.url} alt="IntelliStack Systems shield" className="h-10 w-10 object-contain" />
            <div className="hidden leading-tight sm:block"><div className="text-[11px] font-semibold">IntelliStack Systems</div><div className="text-[8px] tracking-[0.2em] text-muted-foreground">SECURED • TRUSTED • COMPLIANT</div></div>
          </div>
          <div className="flex-1 text-center leading-tight">
            <div className="font-display text-lg font-bold text-glow sm:text-xl">MAXIMUS OPTIMUS</div>
            <div className="text-[8px] tracking-[0.35em] text-primary">GLOBAL COMMAND CENTER</div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="plain" size="plain" className="glass-btn relative !h-8 !w-8" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" /></Button>
            <Button variant="plain" size="plain" className="glass-btn hidden !h-8 !w-8 sm:inline-flex" aria-label="Email"><Mail className="h-4 w-4" /></Button>
            <Button variant="plain" size="plain" className="glass-btn hidden !h-8 !w-8 sm:inline-flex" aria-label="Chat"><MessageSquare className="h-4 w-4" /></Button>
            <div className="relative ml-1">
              <Button variant="plain" size="plain" onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-1.5 text-xs" aria-label="Profile menu"><img src={photo} alt="" className="h-8 w-8 rounded-full border border-primary object-cover" /><span className="hidden md:inline">Frank Mazerati</span><ChevronDown className="h-3 w-3" /></Button>
              {profileOpen && (
                <ul className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-primary/60 bg-popover/95 py-1 text-[11px] shadow-[var(--glow)] backdrop-blur">
                  <li><Button variant="plain" size="plain" onClick={() => photoIn.current?.click()} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><Camera className="h-3.5 w-3.5 text-primary" />Change Profile Picture</Button></li>
                  <li><Button variant="plain" size="plain" onClick={() => bgIn.current?.click()} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><ImageIcon className="h-3.5 w-3.5 text-primary" />Change Background Image</Button></li>
                  <li className="my-1 border-t border-border" />
                  {profileActions.map(([I, l]) => <li key={l}><Button variant="plain" size="plain" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><I className="h-3.5 w-3.5 text-primary" />{l}</Button></li>)}
                </ul>
              )}
              <input ref={photoIn} type="file" accept="image/*" hidden onChange={pick(setPhoto)} />
              <input ref={bgIn} type="file" accept="image/*" hidden onChange={pick(setBg)} />
            </div>
          </div>

          {/* HAMBURGER — drops down from the top bar */}
          {drawer && (
            <nav aria-label="Command menu" className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg border border-primary/50 bg-popover/95 p-3 shadow-[var(--glow)] backdrop-blur">
              <div className="mb-2 flex items-center gap-2">
                <Link to="/" onClick={() => setDrawer(false)} className="mini-btn !h-7 !w-7" aria-label="Home"><Home className="h-3.5 w-3.5" /></Link>
                <div className="flex flex-1 items-center gap-2 rounded border border-border px-2"><Search className="h-3.5 w-3.5 text-primary" /><input value={menuQuery} onChange={(e) => setMenuQuery(e.target.value)} placeholder="Search command menu…" className="h-7 flex-1 bg-transparent text-xs outline-none" /></div>
              </div>
              <div className="scroll-blue grid max-h-[60vh] gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardPages.filter(p=>p.title.toLowerCase().includes(menuQuery.toLowerCase())).map(p=><Link key={p.slug} to="/section/$slug" params={{slug:p.slug}} onClick={()=>setDrawer(false)} className="flex items-center gap-2 rounded border border-primary/50 bg-secondary/40 px-2 py-2 text-xs"><ChevronRight className="h-3 w-3 text-primary"/>{p.title}</Link>)}
                {filteredMenu.map((m, i) => (
                  <details key={m.slug} className="rounded border border-border/40 px-2 py-1.5 text-xs">
                    <summary className="cursor-pointer py-1">{i + 1}. {m.title}</summary>
                    <Link to="/section/$slug" params={{slug:m.slug}} onClick={()=>setDrawer(false)} className="block py-1 text-primary">{m.title}</Link>
                    {m.groups.map(g=><div key={g.name} className="py-1"><div className="text-[10px] text-muted-foreground">{g.name}</div>{g.items.map(item=><Link key={item} to="/section/$slug" params={{slug:resolveMenuItem(item,m.slug)}} onClick={()=>setDrawer(false)} className="block py-1 pl-2 hover:text-primary">{item}</Link>)}</div>)}
                  </details>
                ))}
              </div>
            </nav>
          )}
        </header>

        {/* SECOND BAR — slogan */}
        <div className="mt-1 rounded-md border border-border/50 bg-header/50 px-3 py-1.5 text-center backdrop-blur">
          <p className="font-display text-[11px] font-bold tracking-[0.12em] sm:text-sm ">See everything locally. Connect everything globally. Powered by Intelligence.</p>
        </div>

        {/* PROFILE + STATUS */}
        <section className="relative z-30 border-b border-border mt-2 grid gap-4 p-3 md:grid-cols-[170px_minmax(0,1fr)_auto]">
          <div className="profile-compact flex flex-col items-center gap-1 md:items-start">
            <div className="hex-glow"><div className="hex-clip bg-primary p-[2px]"><img src={photo} alt="Frank Mazerati" className="hex-clip h-[150px] w-[150px] object-cover" /></div></div>
            <div className="relative w-[135px]">
              <Button variant="plain" size="plain" onClick={() => setStatusOpen(!statusOpen)} aria-label="Availability" className="flex w-full items-center justify-between rounded border border-border bg-popover/70 px-2 py-0.5 text-[9px]">
                <span className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${status === "Available" ? "bg-success" : status === "Away" ? "bg-muted-foreground" : "bg-warning"}`} />{status}</span><ChevronDown className="h-2.5 w-2.5" />
              </Button>
              {statusOpen && (
                <ul className="absolute inset-x-0 z-40 mt-1 rounded border border-primary/50 bg-popover py-1 text-[9px] shadow-[var(--glow)]">
                  {statuses.map((s) => <li key={s}><Button variant="plain" size="plain" onClick={() => { setStatus(s); setStatusOpen(false); }} className={`w-full px-2 py-0.5 text-left ${s === status ? "bg-accent/40" : "hover:bg-secondary"}`}>{s}</Button></li>)}
                </ul>
              )}
            </div>
            <div className="relative w-[135px]">
              <Button variant="plain" size="plain" onClick={() => setMgrOpen(!mgrOpen)} aria-label="Manager's Quick Access" className="flex w-full items-center justify-between rounded border border-border bg-popover/70 px-2 py-0.5 text-[9px]"><span className="flex items-center gap-1"><Users className="h-2.5 w-2.5 text-primary" />Manager's Quick Access</span><ChevronDown className="h-2.5 w-2.5" /></Button>
              {mgrOpen && (
                <ul className="absolute left-0 z-40 mt-1 w-[230px] space-y-1 rounded border border-primary/50 bg-popover p-1.5 text-[9px] shadow-[var(--glow)]">
                  {managers.map((m) => <li key={m.name} className="rounded border border-border/60 bg-secondary/30 p-1.5"><div className="font-semibold">{m.name}</div><div className="text-[9px] text-primary">{m.title}</div><a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-2.5 w-2.5" />{m.email}</a><a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-2.5 w-2.5" />{m.phone}</a></li>)}
                </ul>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-light sm:text-2xl">{greet.title}, Frank Mazerati.</h1>
            <p className="mb-3 text-[11px] text-primary">{greet.message}</p>
            <ul className="grid gap-1.5 text-[11px]">
              <li className="flex items-center gap-2"><User className="h-3 w-3 shrink-0 text-primary" />Founder &amp; Chief Global Architect</li>
              <li className="flex items-center gap-2"><IdCard className="h-3 w-3 text-primary" />Global User ID: IntelliStackID-144674</li>
              <li className="flex items-center gap-2"><Building2 className="h-3 w-3 text-primary" />Company ID: IntelliStackSystems-144674</li>
              <li className="flex items-center gap-2"><Mail className="h-3 w-3 shrink-0 text-primary" /><span className="inline-contact">Email: <a href="mailto:Frank.Mazerati@IntellistackSystems.com">Frank.Mazerati@IntellistackSystems.com</a></span></li>
              <li className="flex items-center gap-2"><Phone className="h-3 w-3 shrink-0 text-primary" /><span>Phone: <a href="tel:7738240056">773-824-0056</a></span></li>
              <li className="flex items-center gap-2"><MapPin className="h-3 w-3 shrink-0 text-primary" /><span>Work Location: Chicago Corporate Business Center</span></li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 md:flex-col">
            <div className="glass-module min-w-[150px] px-3 py-1.5"><div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Current Time</div><div className="font-display text-xl tabular-nums">{fmt(now, CHI, { hour: "numeric", minute: "2-digit" })} <span className="text-[9px] text-primary">CST</span></div></div>
            <div className="glass-module min-w-[150px] px-3 py-1"><div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Current Date</div><div className="font-display text-xs">{fmt(now, CHI, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div></div>
            <div className="glass-module flex min-w-[150px] items-center gap-2 px-3 py-1"><CloudSun className="h-4 w-4 text-primary" /><div><div className="font-display text-xs">72°F</div><div className="text-[8px] text-muted-foreground">Chicago • Partly Cloudy</div></div></div>
          </div>
        </section>

        {/* STANDARDIZED MODULES */}
        <div className="mt-2 space-y-2">
          <ConfigModule title="Global Clock" icon={<Clock className="h-3 w-3" />} catalog={clockCatalog} initial={5} render={(c) => (
            <div><div className="text-[8px] uppercase tracking-wider text-muted-foreground">{c.label}</div><div className="font-display text-sm tabular-nums">{fmt(now, c.tz, { hour: "numeric", minute: "2-digit" })}</div><div className="text-[8px] text-muted-foreground">{fmt(now, c.tz, { month: "short", day: "numeric" })}</div></div>
          )} />
          <ConfigModule title="Global News" icon={<Newspaper className="h-3 w-3" />} catalog={newsCatalog} initial={5} render={(n) => (
            <div><div className="text-[8px] uppercase tracking-wider text-primary">{n.label}</div><div className="truncate text-[10px]">{n.detail}</div></div>
          )} />
          <ConfigModule title="Stock Market" icon={<BarChart3 className="h-3 w-3" />} catalog={marketCatalog} initial={5} render={(s) => (
            <div><div className="text-[8px] uppercase tracking-wider text-muted-foreground">{s.label}</div><div className="flex items-center justify-between gap-1"><span className="font-display text-xs">{s.detail}</span><Change c={s.change} /></div></div>
          )} />
          <ConfigModule title="Stock Ticker" icon={<TrendingUp className="h-3 w-3" />} catalog={tickerCatalog} initial={5} render={(s) => (
            <div className="flex items-center justify-between gap-1"><span className="font-display text-xs">{s.label}</span><span className="text-[10px] tabular-nums">{s.detail}</span><Change c={s.change} /></div>
          )} />
          <ConfigModule title="Quick Picks" icon={<Zap className="h-3 w-3" />} catalog={quickPickCatalog} initial={5} render={(q) => (
            <Link to="/section/$slug" params={{ slug: q.slug }} className="block hover:text-primary"><div className="text-[10px] font-semibold">{q.label}</div><div className="text-[8px] text-muted-foreground">{q.detail}</div></Link>
          )} />
        </div>

        {/* SEARCH */}
        <div className="mx-auto mt-3 flex max-w-xl items-center gap-2 rounded-xl border border-primary/60 bg-secondary/40 px-4 py-2 shadow-[var(--glow)] backdrop-blur">
          <Search className="h-4 w-4 text-primary" />
          <input placeholder="Search knowledge, teams, workflows, entities, globally..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          <Mic className="h-4 w-4 text-primary" />
        </div>

        {/* WORK AREA */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <section className="flex h-[420px] flex-col p-2" aria-label="Bring the Work to You">
            <div className="mb-2 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-primary"><Hexagon className="h-3 w-3" />Bring the Work to You<span className="ml-auto text-muted-foreground">{workSections.length} modules</span></div>
            <div className="scroll-blue grid flex-1 content-start gap-1.5 sm:grid-cols-2">
              {workSections.map((w) => (
                <div key={w.title} className="rounded-md border border-border/60 bg-secondary/25">
                  <Button variant="plain" size="plain" onClick={() => setOpenWork(openWork === w.title ? null : w.title)} className="flex w-full items-center justify-between px-2 py-1.5 text-[11px]">
                    <span>{w.title}</span><span className="flex items-center gap-1"><span className="rounded bg-accent/30 px-1 text-[9px]">{w.items.length}</span><ChevronDown className={`h-3 w-3 transition ${openWork === w.title ? "rotate-180" : ""}`} /></span>
                  </Button>
                  {openWork === w.title && <ul className="space-y-0.5 border-t border-border/40 px-2 py-1 text-[10px] text-muted-foreground">{w.items.map((i) => <li key={i}>• {i}</li>)}</ul>}
                </div>
              ))}
            </div>
          </section>

          <section className="flex h-[420px] flex-col p-2" aria-label="Help Buddy">
            <div className="mb-2 flex items-center gap-2">
              <img src={buddy} alt="Help Buddy robot" className="h-10 w-10 object-contain" />
              <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-primary"><HelpCircle className="h-3 w-3" />Help Buddy</div>
              <div className="ml-auto flex gap-1">
                {(["Today", "Recent Days", "Upcoming"] as const).map((s) => <Button variant="plain" size="plain" key={s} onClick={() => setStage(s)} className={`rounded border px-2 py-0.5 text-[9px] ${stage === s ? "border-primary bg-accent/40" : "border-border/60"}`}>{s}</Button>)}
              </div>
            </div>
            <div className="scroll-blue flex-1 space-y-1.5">
              {helpBuddySections.filter((h) => h.stage === stage).map((h) => (
                <div key={h.title} className="rounded-md border border-border/60 bg-secondary/25">
                  <Button variant="plain" size="plain" onClick={() => setOpenHelp(openHelp === h.title ? null : h.title)} className="flex w-full items-center justify-between px-2 py-1.5 text-[11px]"><span>{h.title}</span><ChevronDown className={`h-3 w-3 transition ${openHelp === h.title ? "rotate-180" : ""}`} /></Button>
                  {openHelp === h.title && <ul className="space-y-0.5 border-t border-border/40 px-2 py-1 text-[10px] text-muted-foreground">{h.items.map((i) => <li key={i}>• {i}</li>)}</ul>}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center rounded border border-border bg-secondary/30 px-2 py-1.5 text-[10px]">
              <input placeholder="How can I help you today?" className="min-w-0 flex-1 bg-transparent outline-none" /><Send className="h-3 w-3 text-primary" />
            </div>
          </section>
        </div>

        <footer className="mt-3 flex flex-wrap justify-between gap-2 px-2 text-[8px] text-muted-foreground">
          <span className="flex items-center gap-1"><Globe className="h-3 w-3" />All Systems Online | Platform v2.0.0 | © 2026 IntelliStack Systems</span>
          <span className="flex gap-3">{["Privacy Policy", "Terms of Use", "Security", "Compliance", "Help Desk"].map((l) => <a key={l} href="#">{l}</a>)}</span>
        </footer>
      </div>
    </div>
  );
}
