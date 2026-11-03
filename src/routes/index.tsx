import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu, Bell, Mail, MessageSquare, ChevronDown, ChevronRight,
  Camera, Image as ImageIcon, User, Phone, MapPin, Moon, Sun, CloudSun, Globe, Search, Mic,
  LayoutGrid, Radar, SlidersHorizontal, Shield, MessagesSquare, Database, Workflow, BarChart3,
  Settings, HelpCircle, RefreshCw, Hexagon, Lock, Building2, TrendingUp, Network, Send,
} from "lucide-react";
import portraitAsset from "@/assets/frank-mazerati.jpg.asset.json";
import shieldAsset from "@/assets/intellistack-shield.jpg.asset.json";
import { useRef } from "react";
import { X, FileText, PenLine, CreditCard, Linkedin, LogOut, Users, Plus } from "lucide-react";
import commandBg from "@/assets/command-center.jpg";
import buddy from "@/assets/help-buddy.png";
import holo from "@/assets/network-holo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maximus Optimus — Global Command Center" },
      { name: "description", content: "IntelliStack Systems Global Command Center dashboard." },
      { property: "og:title", content: "Maximus Optimus — Global Command Center" },
      { property: "og:description", content: "IntelliStack Systems global command center dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const greetings = ["Good Morning", "Good Afternoon", "Good Evening", "Good Night"];
// Demo manager data — edit freely
const managers = [
  { name: "Angela Brooks", title: "Direct Manager • VP Operations", email: "angela.brooks@intellistacksystems.com", phone: "773-555-0182", office: "Chicago Corporate Business Center, Fl 42" },
  { name: "Marcus Hill", title: "Skip-Level • SVP Technology", email: "marcus.hill@intellistacksystems.com", phone: "312-555-0119", office: "Chicago Corporate Business Center, Fl 45" },
  { name: "Renee Alvarez", title: "HR Business Partner", email: "renee.alvarez@intellistacksystems.com", phone: "773-555-0164", office: "Chicago Corporate Business Center, Fl 12" },
];
const profileActions = [
  [FileText, "Resume"], [FileText, "Cover Letter"], [PenLine, "Create Bio"], [CreditCard, "Add Payment Method"], [Linkedin, "Connect LinkedIn"], [Settings, "Account Settings"], [LogOut, "Sign Out"],
] as const;
const menuSections = ["Dashboard", "Intel Center", "Ops Control", "Threat Intel", "Comms Hub", "Data Lake", "Workflows", "Analytics", "Projects", "Teams", "Calendar", "Documents", "Finance", "HR Center", "Learning", "Marketplace", "Reports", "Integrations", "Security Center", "Compliance", "Help Desk", "Settings"];
const workTiles = ["Intel", "Ops", "Secure", "Global", "Insights", "Tasks", "Approvals", "Meetings", "Tickets", "Files", "Messages", "Reports"];
const statuses = ["Away", "Available", "At Lunch", "On Break", "In a Meeting", "On a Call", "Helping a User", "Busy"];
const clocks = [
  { city: "New York", t: "07:22", ap: "PM", d: "Nov 2, 2025 • UTC-05:00", night: true },
  { city: "London", t: "12:23", ap: "AM", d: "Nov 3, 2025 • UTC+00:00", night: true },
  { city: "Dubai", t: "03:23", ap: "AM", d: "Nov 3, 2025 • UTC+04:00", night: true },
  { city: "Singapore", t: "07:23", ap: "AM", d: "Nov 3, 2025 • UTC+08:00", night: false },
  { city: "Sydney", t: "09:23", ap: "AM", d: "Nov 3, 2025 • UTC+11:00", night: false },
];
const kews = [
  { tag: "New York News", h: "Self-Service Portal Adoption Hits 87%", m: "Help Desk • 30m ago" },
  { tag: "Network Security", h: "Zero-Day Patch Deployed Across Global Edge", m: "SecOps • 25m ago" },
  { tag: "Singapore", h: "Global Markets Rally on Tech Innovation", m: "World News • 1h ago" },
  { tag: "Product Updates", h: "Data Center Achieves 32% Renewable Milestone", m: "Product • 38m ago" },
  { tag: "Compliance", h: "New Compliance Models Streamline Review", m: "Compliance • 1h ago" },
];
const news = [
  { tag: "AI News", h: "AI-Driven Insights Accelerate Global Edge", m: "Frank Mazerati • Nov 3, 2025" },
  { tag: "Network News", h: "Quantum Network Achieves 99.9% Uptime", m: "Network Ops • Nov 3, 2025" },
  { tag: "Singapore", h: "AR/VR Collaboration Boosts Global Edge", m: "AR/VR Labs • Nov 2, 2025" },
  { tag: "BioTech", h: "BioTech Breakthrough in Tech Innovation", m: "AR/VR Labs • Nov 2, 2025" },
  { tag: "Renewable", h: "Renewable Energy Hits Milestone in Asia", m: "Systems • Nov 2, 2025" },
];
const ticker = [
  ["NDAQ", "18,412.75", "+0.87%"], ["AAPL", "214.42", "+1.24%"], ["MSFT", "415.23", "+0.76%"],
  ["BTC", "67,841.19", "+2.15%"], ["ETH", "3,412.95", "+1.84%"], ["GOLD", "2,354.30", "+0.45%"],
];
const nav = [
  [LayoutGrid, "Dashboard"], [Radar, "Intel Center"], [SlidersHorizontal, "Ops Control"], [Shield, "Threat Intel"],
  [MessagesSquare, "Comms Hub"], [Database, "Data Lake"], [Workflow, "Workflows"], [BarChart3, "Analytics"], [Settings, "Settings"],
] as const;

function Spark({ i }: { i: number }) {
  const pts = Array.from({ length: 30 }, (_, k) => `${k * 4},${20 - (Math.sin(k * 0.7 + i) * 5 + k * 0.4 + ((k * 7 + i) % 5))}`).join(" ");
  return <svg viewBox="0 0 120 24" className="h-5 w-full text-success"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1" /></svg>;
}

function Arrow() {
  return <button className="glass-btn shrink-0" aria-label="Expand"><ChevronRight className="h-4 w-4" /></button>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-primary">{children}</div>;
}

function Index() {
  const [status, setStatus] = useState("Available");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [greeting, setGreeting] = useState("Good Morning");
  const [drawer, setDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mgrOpen, setMgrOpen] = useState(false);
  const [photo, setPhoto] = useState<string>(portraitAsset.url);
  const [bg, setBg] = useState<string>(commandBg);
  const [tiles, setTiles] = useState(workTiles);
  const photoIn = useRef<HTMLInputElement>(null);
  const bgIn = useRef<HTMLInputElement>(null);
  const pick = (set: (u: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) set(URL.createObjectURL(f)); };

  return (
    <div className="min-h-screen overflow-x-auto bg-background text-foreground">
      <div className="mx-auto min-w-[1100px] max-w-[1600px] p-3">
        {/* HEADER */}
        <header className="flex items-center gap-4 border-b border-primary bg-header px-3 py-1 shadow-[var(--glow)]">
          <button onClick={() => setDrawer(true)} className="glass-btn !w-7 !h-7" aria-label="Menu"><Menu className="h-4 w-4" /></button>
          <div className="flex items-center gap-2">
            <img src={shieldAsset.url} alt="IntelliStack Systems shield" className="h-10 w-10 object-contain" />
            <div className="leading-tight"><div className="text-sm font-semibold">IntelliStack</div><div className="text-sm font-semibold">Systems</div></div>
          </div>
          <div className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-muted-foreground"><img src={shieldAsset.url} alt="" className="h-6 w-6 object-contain" />SECURED • TRUSTED • COMPLIANT</div>
          <div className="flex-1 text-center leading-tight">
            <div className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">IntelliStack Systems Presents</div>
            <div className="font-display text-base font-bold tracking-widest text-glow">MAXIMUS OPTIMUS</div>
            <div className="text-[9px] tracking-[0.3em] text-primary">GLOBAL COMMAND CENTER</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="glass-btn relative" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" /></button>
            <button className="glass-btn" aria-label="Email"><Mail className="h-4 w-4" /></button>
            <button className="glass-btn" aria-label="Chat"><MessageSquare className="h-4 w-4" /></button>
            <div className="relative ml-2">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 text-xs"><img src={photo} alt="Frank Mazerati" className="h-8 w-8 rounded-full border border-primary object-cover" />Frank Mazerati<ChevronDown className="h-3 w-3" /></button>
              {profileOpen && (
                <ul className="absolute right-0 z-50 mt-2 w-56 rounded border border-primary bg-popover py-1 text-[11px] shadow-[var(--glow)]">
                  <li><button onClick={() => photoIn.current?.click()} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><Camera className="h-3.5 w-3.5 text-primary" />Change Profile Picture</button></li>
                  <li><button onClick={() => bgIn.current?.click()} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><ImageIcon className="h-3.5 w-3.5 text-primary" />Change Background Image</button></li>
                  <li className="my-1 border-t border-border" />
                  {profileActions.map(([I, l]) => <li key={l}><button onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-secondary"><I className="h-3.5 w-3.5 text-primary" />{l}</button></li>)}
                </ul>
              )}
              <input ref={photoIn} type="file" accept="image/*" hidden onChange={pick(setPhoto)} />
              <input ref={bgIn} type="file" accept="image/*" hidden onChange={pick(setBg)} />
            </div>
          </div>
        </header>
        <div className="px-16 py-1 text-[9px] text-muted-foreground">Our Intelligent Network, Control Everything Centrally, Oversee Everything Globally, Powered by Intelligence</div>

        {/* HERO */}
        <section className="panel relative z-30 mt-1">
          <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="relative grid grid-cols-[220px_1fr_200px_1fr_200px] items-start gap-4 p-4">
            <div className="pl-2">
              <div className="hex-glow"><div className="hex-clip bg-primary p-[3px]"><div className="hex-clip bg-background p-2"><img src={photo} alt="Frank Mazerati" className="hex-clip h-[180px] w-[180px] object-cover" /></div></div></div>
              <div className="relative z-20 mt-2 w-[186px]">
              <div className="mb-1 text-[10px]">Availability</div>
              <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded border border-primary bg-popover px-2 py-1 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />{status}</span><ChevronDown className="h-3 w-3" />
              </button>
              {open && (
                <ul className="absolute inset-x-0 mt-1 rounded border border-primary bg-popover py-1 text-[10px] shadow-[var(--glow)]">
                  {statuses.map((s) => (
                    <li key={s}><button onClick={() => { setStatus(s); setOpen(false); }} className={`flex w-full items-center gap-1 px-2 py-0.5 text-left ${s === status ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}><span className="h-1 w-1 rounded-full bg-primary" />{s}</button></li>
                  ))}
                </ul>
              )}
              </div>
            </div>
            <div className="pt-6">
              <h1 className="text-2xl font-light">{greeting}, Frank Mazerati</h1>
              <div className="mb-1 flex gap-1">{greetings.map((g) => <button key={g} onClick={() => setGreeting(g)} className={`rounded border px-2 py-0.5 text-[9px] ${g === greeting ? "border-primary bg-accent/60" : "border-border bg-secondary/40"}`}>{g.replace("Good ", "")}</button>)}</div>
              <p className="mb-3 text-[11px] text-muted-foreground">Systems optimal. Your command center is ready.</p>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2"><User className="h-3 w-3 text-primary" />Name: Frank Mazerati</li>
                <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-primary" />Global User ID: IntelliStackID-144674 <Lock className="h-3 w-3 text-warning" /></li>
                <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-primary" />User ID: frank.mazerati <Lock className="h-3 w-3 text-warning" /></li>
                <li className="flex items-center gap-2"><Building2 className="h-3 w-3 text-primary" />Company ID: IntelliStackSystems-144674</li>
                <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-primary" />Email: Frank.Mazerati@IntellistackSystems.com</li>
                <li className="flex items-center gap-2"><Phone className="h-3 w-3 text-primary" />Phone: 773-824-0056</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3 text-primary" />Work Location: Chicago Corporate Business Center</li>
              </ul>
            </div>
            <div className="relative z-20 pt-16">
              <div className="mb-1 text-[10px]">My Managers</div>
              <button onClick={() => setMgrOpen(!mgrOpen)} className="flex w-full items-center justify-between rounded border border-primary bg-popover px-2 py-1 text-[10px]"><span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" />Quick Access</span><ChevronDown className="h-3 w-3" /></button>
              {mgrOpen && (
                <ul className="absolute inset-x-0 mt-1 w-[260px] space-y-1 rounded border border-primary bg-popover p-2 text-[10px] shadow-[var(--glow)]">
                  {managers.map((m) => <li key={m.name} className="rounded border border-border bg-secondary/40 p-1.5"><div className="font-semibold">{m.name}</div><div className="text-[9px] text-primary">{m.title}</div><div className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{m.email}</div><div className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{m.phone}</div><div className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{m.office}</div></li>)}
                </ul>
              )}
            </div>
            <div />
            <div className="space-y-2">
              <div className="panel px-3 py-2"><div className="text-[8px] uppercase text-muted-foreground">Current Date</div><div className="text-lg">NOV 2, 2025</div></div>
              <div className="panel px-3 py-2"><div className="text-[8px] uppercase text-muted-foreground">Current Time</div><div className="text-lg">07:23 PM <span className="text-[10px]">CST</span></div></div>
              <div className="panel flex items-center gap-2 px-3 py-2"><CloudSun className="h-6 w-6 text-primary" /><div><div className="text-lg">72°F</div><div className="text-[8px] text-muted-foreground">Chicago, IL • Partly Cloudy</div></div></div>
            </div>
          </div>
        </section>

        {/* GLOBAL CLOCK */}
        <section className="panel mt-2 px-3 py-2">
          <Label>Global Clock</Label>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-5 gap-2">
              {clocks.map((c) => (
                <div key={c.city} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-1.5">
                  {c.night ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-warning" />}
                  <div><div className="text-[8px] uppercase text-muted-foreground">{c.city}</div><div className="text-lg leading-none">{c.t} <span className="text-[10px]">{c.ap}</span></div><div className="text-[8px] text-muted-foreground">{c.d}</div></div>
                </div>
              ))}
            </div>
            <Arrow />
          </div>
        </section>

        {/* GLOBAL KEWS */}
        <section className="panel mt-2 px-3 py-2">
          <Label>Global Kews</Label>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-5 gap-2">
              {kews.map((n, i) => (
                <div key={n.h} className="flex gap-2 rounded-lg border border-border bg-secondary/40 p-1.5">
                  <img src={i % 2 ? holo : commandBg} alt="" className="h-10 w-16 rounded object-cover" style={{ objectPosition: `${i * 25}% 50%` }} />
                  <div><div className="text-[7px] uppercase text-primary">{n.tag}</div><div className="text-[9px] leading-tight">{n.h}</div><div className="text-[7px] text-muted-foreground">{n.m}</div></div>
                </div>
              ))}
            </div>
            <Arrow />
          </div>
        </section>

        {/* GLOBAL NEWS */}
        <section className="panel mt-2 px-3 py-2">
          <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-primary"><Globe className="h-3 w-3" />Global News</div>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-5 gap-2">
              {news.map((n, i) => (
                <div key={n.h} className="flex gap-2 rounded-lg border border-border bg-secondary/40 p-1.5">
                  <img src={i % 2 ? commandBg : holo} alt="" className="h-20 w-20 rounded object-cover" style={{ objectPosition: `${i * 25}% 50%` }} />
                  <div className="flex flex-col"><div className="text-[7px] uppercase text-primary">{n.tag}</div><div className="text-xs leading-tight">{n.h}</div><div className="mt-auto text-[7px] text-muted-foreground">{n.m}</div></div>
                </div>
              ))}
            </div>
            <Arrow />
          </div>
        </section>

        {/* TICKER */}
        <section className="panel mt-2 grid grid-cols-6 divide-x divide-border px-3 py-2">
          {ticker.map(([s, p, c], i) => (
            <div key={s} className="px-4">
              <div className="text-sm">{s}</div>
              <div className="flex items-center gap-3 text-xs">{p}<span className="flex items-center text-[10px] text-success"><TrendingUp className="mr-0.5 h-3 w-3" />{c}</span></div>
              <Spark i={i} />
            </div>
          ))}
        </section>

        {/* SEARCH */}
        <div className="mx-auto mt-3 flex max-w-xl items-center gap-2 rounded-xl border border-primary bg-secondary/50 px-4 py-2 shadow-[var(--glow)]">
          <Search className="h-4 w-4 text-primary" />
          <input placeholder="Search knowledge, teams, workflows, entities, globally..." className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          <Mic className="h-4 w-4 text-primary" />
        </div>

        {/* WORKSPACE */}
        <div className="mt-3 grid grid-cols-[30fr_40fr_30fr] gap-3">
          <section className="panel flex h-[300px] gap-2 p-2">
            <div className="scroll-blue w-1/2 overflow-y-auto">
              <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-primary"><Globe className="h-3 w-3" />Navigation</div>
              <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs"><Menu className="h-3 w-3" />Command Center</div>
              {nav.map(([Icon, l]) => (
                <button key={l} onClick={() => setActive(l)} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs ${active === l ? "border border-primary bg-accent/60 shadow-[var(--glow)]" : "hover:bg-secondary"}`}><Icon className="h-3.5 w-3.5" />{l}</button>
              ))}
            </div>
            <div className="flex-1 space-y-2 rounded border border-border bg-secondary/30 p-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-[30%] overflow-hidden rounded border border-border"><img src={holo} alt="" className="h-full w-full object-cover opacity-70" style={{ objectPosition: `${i * 50}% ${i * 40}%` }} /></div>)}
            </div>
          </section>

          <section className="panel scroll-blue h-[300px] overflow-y-auto p-2">
            <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-primary"><span className="flex items-center gap-1"><Hexagon className="h-3 w-3" />Bring Work To You</span><RefreshCw className="h-3 w-3" /></div>
            <div className="flex h-[190px] gap-2">
              <div className="flex flex-col gap-2">
                {[[Globe, "Intel"], [Hexagon, "Ops"], [Lock, "Global"]].map(([I, l]) => { const C = I as typeof Globe; return <div key={l as string} className="grid h-14 w-12 place-items-center rounded border border-border bg-secondary/40 text-[8px]"><C className="h-5 w-5 text-primary" />{l as string}</div>; })}
              </div>
              <img src={holo} alt="Network visualization" className="flex-1 rounded object-cover" />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {tiles.map((l) => <button key={l} className="grid place-items-center rounded border border-border bg-secondary/40 py-1.5 text-[10px] hover:border-primary"><Hexagon className="h-5 w-5 text-primary" />{l}</button>)}
              <button onClick={() => setTiles([...tiles, `Feature ${tiles.length + 1}`])} className="grid place-items-center rounded border border-dashed border-primary py-1.5 text-[10px] text-primary"><Plus className="h-5 w-5" />Add Feature</button>
            </div>
          </section>

          <section className="panel scroll-blue relative h-[300px] overflow-y-auto p-2">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-primary"><HelpCircle className="h-3 w-3" />Help Buddy</div>
            <img src={buddy} alt="Help Buddy robot" className="absolute right-4 top-2 h-32 w-32 object-contain" />
            <div className="mt-28 space-y-1 text-[10px]">
              {["Ask Anything", "Knowledge Base", "Support Tickets", "Live Chat", "IT Requests", "Password Reset", "Device Support", "Training Videos", "Policies & FAQs"].map((t) => <div key={t} className="w-3/5 border-b border-border py-1.5">{t}</div>)}
              <div className="w-3/5 py-1.5">System Health <span className="text-success">99.9%</span></div>
            </div>
            <div className="absolute right-6 top-36 grid h-14 w-14 place-items-center rounded-full border-4 border-primary text-[10px]">99.9%</div>
            <div className="sticky bottom-0 mt-3 flex items-center rounded border border-border bg-secondary/40 px-2 py-1.5 text-[9px] text-muted-foreground">
              <input placeholder="How can I help you today?" className="flex-1 bg-transparent outline-none" /><Send className="h-3 w-3" />
            </div>
          </section>
        </div>

        {drawer && (
          <div className="fixed inset-0 z-50 flex">
            <aside className="scroll-blue flex h-full w-72 flex-col overflow-y-auto border-r border-primary bg-popover p-3 shadow-[var(--glow)]">
              <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><img src={shieldAsset.url} alt="" className="h-8 w-8" /><span className="text-sm font-semibold">Command Menu</span></div><button onClick={() => setDrawer(false)} className="glass-btn !h-7 !w-7" aria-label="Close menu"><X className="h-4 w-4" /></button></div>
              {menuSections.map((l) => <button key={l} onClick={() => { setActive(l); setDrawer(false); }} className={`flex w-full items-center gap-2 rounded px-2 py-2 text-xs ${active === l ? "border border-primary bg-accent/60" : "hover:bg-secondary"}`}><ChevronRight className="h-3 w-3 text-primary" />{l}</button>)}
            </aside>
            <button className="flex-1 bg-background/60" aria-label="Close menu" onClick={() => setDrawer(false)} />
          </div>
        )}

        <footer className="mt-2 flex justify-between px-2 text-[8px] text-muted-foreground">
          <span>All Systems Online | Platform v4.0.2 | © 2025 IntelliStack Systems</span>
          <span className="flex gap-3">{["Privacy Policy", "Terms of Use", "Security", "Compliance", "Help Desk", "Support"].map((l) => <a key={l} href="#">{l}</a>)}</span>
          <span />
        </footer>
      </div>
    </div>
  );
}
