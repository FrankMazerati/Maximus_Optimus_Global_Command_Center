import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu, X, Bell, ChevronDown, ChevronRight, Home, Info, Headphones, LayoutGrid, Users, Plug, RefreshCw, Code2, Lock,
  MessageSquare, CalendarDays, Cloud, Search, Briefcase, UserCog, CheckCircle2, Server, Clock, MessagesSquare, ChevronUp,
} from "lucide-react";
import shieldAsset from "@/assets/intellistack-shield.jpg.asset.json";
import portraitAsset from "@/assets/frank-mazerati.jpg.asset.json";
import bg from "@/assets/command-center-bg.jpg";
import { menu } from "@/lib/menu";

type SideItem = { label: string; icon: typeof Home; slug?: string; home?: boolean };
const side: SideItem[] = [
  { label: "Home", icon: Home, home: true },
  { label: "About Us", icon: Info },
  { label: "Contact Us", icon: Headphones },
  { label: "New Active Directory", icon: LayoutGrid, slug: "new-active-directory" },
  { label: "People & Workforce", icon: Users, slug: "people-workforce" },
  { label: "IntelliDesk", icon: Headphones, slug: "intellidesk" },
  { label: "User & Role Administration", icon: UserCog, slug: "user-role-administration" },
  { label: "IntelliConnect", icon: Plug, slug: "integrations-connectors" },
  { label: "IntelliSync", icon: RefreshCw, slug: "automation-intelligence" },
  { label: "Connect & Build", icon: Code2, slug: "intellisphere-business-products" },
  { label: "IntelliAccess", icon: Lock, slug: "security-operations" },
  { label: "IntelliChat", icon: MessageSquare, slug: "communications-collaboration" },
  { label: "IntelliCalendar", icon: CalendarDays, slug: "business-productivity" },
  { label: "IntelliDrive", icon: Cloud, slug: "assets-resources" },
  { label: "IntelliSearch", icon: Search, slug: "intellimarketplace" },
  { label: "Business Center", icon: Briefcase, slug: "my-business-center" },
  { label: "Workspace & Productivity", icon: Users, slug: "business-productivity" },
];

export function AppShell({ active, children }: { active?: string; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [open, setOpen] = useState<string | null>(active ?? null);
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const t = () => setNow(new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" }) + " (CST)");
    t(); const i = setInterval(t, 30000); return () => clearInterval(i);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <img src={bg} alt="" width={1920} height={1088} className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />

      <header className="relative z-20 flex h-20 items-center gap-4 border-b border-border bg-header/80 px-4 backdrop-blur">
        <button onClick={() => setDrawer(true)} className="glass-btn !h-11 !w-11" aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <Link to="/" className="flex items-center gap-2">
          <img src={shieldAsset.url} alt="IntelliStack shield" className="h-14 w-14 object-contain hex-glow" />
          <div className="font-display text-lg font-bold leading-tight">IntelliStack<br />Systems</div>
        </Link>
        <div className="hidden h-10 w-px bg-primary lg:block" />
        <p className="hidden flex-1 gap-4 text-sm lg:flex">
          <span>One Intelligent Network.</span><span>Control Everything Centrally.</span><span>Connect Everything Globally.</span><span>Powered by Intelligence.</span>
        </p>
        <div className="ml-auto flex items-center gap-4">
          <button className="relative" aria-label="Notifications"><Bell className="h-6 w-6 text-primary" /><span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px]">3</span></button>
          <div className="flex items-center gap-2"><img src={portraitAsset.url} alt="" className="h-10 w-10 rounded-full border border-primary object-cover" /><span className="hidden text-sm sm:inline">Diamond Carter</span><ChevronDown className="h-4 w-4" /></div>
        </div>
      </header>

      <div className="relative z-10 flex">
        <aside className="scroll-blue hidden h-[calc(100vh-8rem)] w-60 shrink-0 border-r border-border bg-sidebar/70 py-3 backdrop-blur md:block">
          {side.map((s) => {
            const isActive = s.slug && s.slug === active;
            const cls = `mx-2 my-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? "border border-primary bg-accent/50 shadow-[var(--glow)]" : "hover:bg-secondary/60"}`;
            const inner = <><s.icon className="h-5 w-5 shrink-0 text-primary" /><span>{s.label}</span></>;
            if (s.home) return <Link key={s.label} to="/" className={cls}>{inner}</Link>;
            if (s.slug) return <Link key={s.label} to="/section/$slug" params={{ slug: s.slug }} className={cls}>{inner}</Link>;
            return <button key={s.label} className={`${cls} w-[calc(100%-1rem)] text-left`}>{inner}</button>;
          })}
        </aside>
        <main className="scroll-blue h-[calc(100vh-8rem)] flex-1 p-4">{children}</main>
      </div>

      <footer className="relative z-20 flex h-12 items-center gap-4 border-t border-border bg-header/80 px-4 text-sm backdrop-blur">
        <span className="flex items-center gap-1.5 text-success"><CheckCircle2 className="h-4 w-4" />All Systems Online</span>
        <span className="hidden items-center gap-1.5 sm:flex"><Server className="h-4 w-4 text-primary" />Platform v2.0.0</span>
        <span className="hidden items-center gap-1.5 md:flex"><Clock className="h-4 w-4 text-primary" />{now}</span>
        <button className="ml-auto flex items-center gap-2 rounded-t-lg border border-primary bg-accent/40 px-5 py-2 font-display shadow-[var(--glow)]"><MessagesSquare className="h-5 w-5" />Vibe Chat<ChevronUp className="h-4 w-4" /></button>
      </footer>

      {drawer && (
        <div className="fixed inset-0 z-50 flex">
          <aside className="scroll-blue flex h-full w-80 flex-col border-r border-primary bg-popover p-3 shadow-[var(--glow)]">
            <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><img src={shieldAsset.url} alt="" className="h-8 w-8" /><span className="font-display text-sm">Global Command Center</span></div><button onClick={() => setDrawer(false)} className="glass-btn !h-7 !w-7" aria-label="Close menu"><X className="h-4 w-4" /></button></div>
            <Link to="/" onClick={() => setDrawer(false)} className="mb-1 flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-secondary"><Home className="h-4 w-4 text-primary" />Home</Link>
            {menu.map((m, i) => (
              <div key={m.slug} className="border-b border-border/50">
                <div className="flex items-center">
                  <Link to="/section/$slug" params={{ slug: m.slug }} onClick={() => setDrawer(false)} className={`flex-1 rounded px-2 py-2 text-sm ${active === m.slug ? "text-primary" : ""} hover:bg-secondary`}>{i + 1}. {m.title}</Link>
                  <button onClick={() => setOpen(open === m.slug ? null : m.slug)} aria-label={`Show ${m.title} sections`} className="p-2">{open === m.slug ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}</button>
                </div>
                {open === m.slug && (
                  <div className="pb-2 pl-4">
                    {m.slug === "administration-settings-support" && <Link to="/section/$slug" params={{ slug: "user-role-administration" }} onClick={() => setDrawer(false)} className="block rounded px-2 py-1 text-xs text-primary hover:bg-secondary">User & Role Administration</Link>}
                    {m.groups.map((g) => (
                      <div key={g.name} className="mt-1"><div className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground">{g.name}</div>
                        {g.items.map((it) => <Link key={it} to="/section/$slug" params={{ slug: m.slug }} onClick={() => setDrawer(false)} className="block rounded px-2 py-0.5 text-xs hover:bg-secondary">{it}</Link>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>
          <button className="flex-1 bg-background/60" aria-label="Close menu" onClick={() => setDrawer(false)} />
        </div>
      )}
    </div>
  );
}
