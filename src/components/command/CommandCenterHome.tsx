import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu, X, ShieldCheck, Bell, Mail, MessageSquare, ChevronDown, ChevronRight,
  Home, Search, Globe2, Newspaper, TrendingUp, Megaphone, BriefcaseBusiness,
  BrainCircuit, Plug, CirclePlus, UserRound, Camera, Image as ImageIcon, Settings,
  LogOut, Clock3, ArrowUpRight, Send,
} from "lucide-react";
import portraitAsset from "@/assets/frank-mazerati.jpg.asset.json";
import shieldAsset from "@/assets/intellistack-shield.jpg.asset.json";
import commandBg from "@/assets/command-center.jpg";
import buddy from "@/assets/help-buddy.png";
import { menu } from "@/lib/menu";
import { dashboardPages, resolveMenuItem } from "@/lib/dashboard-pages";
import { workSections, helpBuddySections, clockCatalog, newsCatalog, tickerCatalog, quickPickCatalog, dayPart, greetingMessages } from "@/lib/home-config";

const timeLabel = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);

const profileDetails = [
  ["USER ID", "001"],
  ["COMPANY ID", "001"],
  ["EMAIL", "Work email"],
  ["PHONE", "Work phone"],
  ["WORKPLACE", "Downtown Chicago"],
  ["LOCATION", "Global Center"],
];

const footerGroups = [
  { title: "COMPANY", links: ["Home", "About Us", "Contact Us", "Partner With Us", "Careers"] },
  { title: "CONNECT", links: ["Customer Support", "Business Inquiries", "Partnerships", "Integrations", "Community"] },
  { title: "PLATFORM", links: ["Maximus Optimus", "Global Command Center", "IntelliDesk", "Help Buddy", "Marketplace"] },
  { title: "PRIVACY & LEGAL", links: ["Privacy Policy", "Cookie Policy", "How We Handle Your Data", "Terms of Service", "Accessibility"] },
  { title: "RESOURCES", links: ["User Guide", "Knowledge Base", "Announcements", "FAQs", "Support Resources"] },
];

const connectors = ["GitHub", "Supabase", "Vercel", "Microsoft 365", "Email", "Calendar"];
const newsTopics = newsCatalog.slice(0, 5);
const watchlist = tickerCatalog.slice(0, 5);

export function CommandCenterHome() {
  const [now, setNow] = useState(() => new Date());
  const [drawer, setDrawer] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [openWork, setOpenWork] = useState<string | null>(workSections[0]?.title ?? null);
  const [openHelp, setOpenHelp] = useState<string | null>(helpBuddySections[0]?.title ?? null);
  const [photo, setPhoto] = useState(portraitAsset.url);
  const [background, setBackground] = useState(commandBg);
  const [availability, setAvailability] = useState("Available");
  const [managerOpen, setManagerOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [helpNotice, setHelpNotice] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false }).format(now)) % 24;
  const greeting = greetingMessages[dayPart(hour)];
  const visibleMenu = useMemo(() => menu.filter((item) => JSON.stringify(item).toLowerCase().includes(menuQuery.toLowerCase())), [menuQuery]);

  const chooseImage = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  return (
    <div className="command-home" style={{ backgroundImage: `linear-gradient(115deg,rgba(245,250,255,.91),rgba(239,246,255,.83)),url(${background})` }}>
      <header className="command-header">
        <div className="command-brand">
          <button className="command-icon-button" onClick={() => setDrawer((value) => !value)} aria-label={drawer ? "Close navigation" : "Open navigation"} aria-expanded={drawer}>
            {drawer ? <X /> : <Menu />}
          </button>
          <div className="command-shield">
            <img src={shieldAsset.url} alt="IntelliStack Systems shield" />
            <span>SECURE</span><span>TRUSTED</span><span>COMPLIANT</span>
          </div>
        </div>

        <div className="command-title">
          <div className="command-presented">INTELLISTACK SYSTEMS PRESENTS <span>•••</span></div>
          <div className="command-product">MAXIMUS OPTIMUS</div>
          <div className="command-subtitle">GLOBAL COMMAND CENTER</div>
        </div>

        <div className="command-header-actions">
          <button className="command-icon-button" aria-label="Notifications"><Bell /></button>
          <button className="command-icon-button" aria-label="Email"><Mail /></button>
          <button className="command-icon-button" aria-label="Messages"><MessageSquare /></button>
          <div className="command-profile-menu">
            <button className="command-icon-button" onClick={() => setProfileMenu((value) => !value)} aria-label="Profile options" aria-expanded={profileMenu}><UserRound /></button>
            {profileMenu && <div className="command-popover">
              <label><Camera size={14}/> Change profile photo<input type="file" accept="image/*" onChange={chooseImage(setPhoto)} /></label>
              <label><ImageIcon size={14}/> Change background photo<input type="file" accept="image/*" onChange={chooseImage(setBackground)} /></label>
              <button onClick={() => setProfileMenu(false)}><Settings size={14}/> Profile settings</button>
              <button onClick={() => setProfileMenu(false)}><LogOut size={14}/> Sign out</button>
            </div>}
          </div>
        </div>
      </header>

      <section className="command-welcome">
        <div className="command-welcome-main">
          <img className="command-avatar" src={photo} alt="Frank Mazerati profile" />
          <div className="command-welcome-copy">
            <div className="command-welcome-eyebrow">WELCOME TO YOUR COMMAND CENTER</div>
            <h1>{greeting.title}, Frank Mazerati!</h1>
            <p>Today is another opportunity to learn, grow and accomplish more. You've got a lot of work ahead of you, but you've got this.</p>
            <strong>Chief Principal Architect <i /> Founder</strong>
          </div>
        </div>
        <div className="command-profile-details">
          {profileDetails.map(([label, value], index) => <div className="command-detail" key={label}>
            <span>{label}</span><strong>{value}</strong>
            {index !== profileDetails.length - 1 && <i aria-hidden="true" />}
          </div>)}
        </div>
        <div className="command-profile-controls">
          <label className="command-select">● {availability}<ChevronDown size={12}/><select aria-label="Availability" value={availability} onChange={(event) => setAvailability(event.target.value)}>{["Available","Busy","In a Meeting","Away","On Break"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <div className="command-manager-wrap">
            <button className="command-select" onClick={() => setManagerOpen((value) => !value)}>Manager <ChevronDown size={12}/></button>
            {managerOpen && <div className="command-popover command-manager-popover"><strong>Manager directory</strong><span>Manager details are provided by your organization.</span></div>}
          </div>
        </div>
      </section>

      <section className="command-info-strip" aria-label="Global information">
        <div className="command-clock-row">
          <div className="command-strip-label"><Globe2 size={13}/> GLOBAL CLOCKS</div>
          {clockCatalog.slice(0, 5).map((clock) => <div className="command-clock" key={clock.id}><span>{clock.label}</span><strong>{timeLabel(now, clock.tz)}</strong></div>)}
          <span className="command-more">WORLD CLOCK +</span>
        </div>
        <div className="command-feed-row">
          <div className="command-feed-block command-news"><span className="command-strip-label"><Newspaper size={13}/> NEWS</span>{newsTopics.map((item) => <span className="command-feed-item" key={item.id}>{item.label}</span>)}<small>PREVIEW FEED</small></div>
          <div className="command-feed-block command-market"><span className="command-strip-label"><TrendingUp size={13}/> STOCK WATCHER</span>{watchlist.map((item) => <span className="command-market-item" key={item.id}>{item.label}</span>)}<small>WATCHLIST PREVIEW</small></div>
          <div className="command-announcement"><Megaphone size={13}/> ANNOUNCEMENTS <span>View updates <ArrowUpRight size={11}/></span></div>
        </div>
        <div className="command-utility-row">
          <div className="command-search"><Search size={14}/><input aria-label="Global search" placeholder="Search people, work, systems and knowledge..." /></div>
          <div className="command-quick-picks"><strong>MY QUICK PICKS</strong>{quickPickCatalog.slice(0, 5).map((item) => <Link key={item.id} to="/section/$slug" params={{slug:item.slug}}>{item.label}</Link>)}</div>
        </div>
      </section>

      <div className={`command-workspace ${drawer ? "has-navigation" : ""}`}>
        {drawer && <aside className="command-navigation" aria-label="Main navigation">
          <div className="command-navigation-heading"><strong>COMMAND MENU</strong><button onClick={() => setDrawer(false)} aria-label="Close menu"><X size={15}/></button></div>
          <div className="command-navigation-search"><Search size={13}/><input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} placeholder="Find a module..." /></div>
          <Link className="command-nav-link" to="/" onClick={() => setDrawer(false)}><Home size={14}/> Home</Link>
          <div className="command-nav-section">COMMAND PAGES</div>
          {dashboardPages.filter((page) => page.title.toLowerCase().includes(menuQuery.toLowerCase())).map((page) => <Link className="command-nav-link" key={page.slug} to="/section/$slug" params={{slug:page.slug}} onClick={() => setDrawer(false)}><ChevronRight size={13}/>{page.title}</Link>)}
          <div className="command-nav-section">APPLICATIONS & SERVICES</div>
          {visibleMenu.map((item, index) => <details className="command-nav-group" key={item.slug}>
            <summary>{index + 1}. {item.title}<ChevronDown size={12}/></summary>
            {item.groups.map((group) => <div key={group.name}><span>{group.name}</span>{group.items.map((child) => <Link key={child} to="/section/$slug" params={{slug:resolveMenuItem(child,item.slug)}} onClick={() => setDrawer(false)}>{child}</Link>)}</div>)}
          </details>)}
          <div className="command-navigation-bottom"><Link to="/section/$slug" params={{slug:"administration-settings-support"}}>Settings & Administration</Link><button onClick={() => setDrawer(false)}>Sign out</button></div>
        </aside>}

        <section className="command-work-column" aria-label="Bring the Work to You">
          <div className="command-column-heading"><div><BriefcaseBusiness size={16}/><h2>Bring the Work to You</h2></div><span>{workSections.length} workstreams</span></div>
          <div className="command-work-scroll">
            <div className="command-work-summary"><span>YOUR WORKSPACE</span><strong>Today's work, priorities and commitments</strong></div>
            {workSections.map((section) => <div className="command-work-card" key={section.title}>
              <button onClick={() => setOpenWork(openWork === section.title ? null : section.title)} aria-expanded={openWork === section.title}>
                <span>{section.title}</span><span className="command-count">{section.items.length}</span><ChevronDown size={13} className={openWork === section.title ? "is-open" : ""}/>
              </button>
              {openWork === section.title && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </div>)}
          </div>
        </section>

        <aside className="command-assistant-column" aria-label="Help Buddy and connectors">
          <section className="command-help-card">
            <div className="command-column-heading"><div><img src={buddy} alt="" /><h2>Help Buddy</h2></div><span>INTELLIGENT ASSISTANT</span></div>
            <div className="command-help-intro">Your role-aware assistant and workflow companion.</div>
            <div className="command-help-scroll">
              {helpBuddySections.filter((item) => item.stage === "Today").map((item) => <div className="command-work-card" key={item.title}>
                <button onClick={() => setOpenHelp(openHelp === item.title ? null : item.title)} aria-expanded={openHelp === item.title}><span>{item.title}</span><ChevronDown size={13} className={openHelp === item.title ? "is-open" : ""}/></button>
                {openHelp === item.title && <ul>{item.items.map((line) => <li key={line}>{line}</li>)}</ul>}
              </div>)}
            </div>
            <form className="command-help-input" onSubmit={(event) => {event.preventDefault(); if (helpMessage.trim()) setHelpNotice("Help Buddy AI service will be connected during the integration phase.");}}>
              <input value={helpMessage} onChange={(event) => setHelpMessage(event.target.value)} placeholder="Ask Help Buddy..." aria-label="Ask Help Buddy" />
              <button type="submit" aria-label="Send message" disabled={!helpMessage.trim()}><Send size={14}/></button>
            </form>
            {helpNotice && <div className="command-help-notice" role="status">{helpNotice}</div>}
            <div className="command-workflow-label"><BrainCircuit size={13}/> WORKFLOW COMPANION</div>
          </section>

          <section className="command-connectors-card">
            <div className="command-column-heading"><div><Plug size={15}/><h2>Connectors</h2></div><Link to="/section/$slug" params={{slug:"integrations-connectors"}}>Manage <ArrowUpRight size={11}/></Link></div>
            <div className="command-connectors-grid">{connectors.map((name) => <Link to="/section/$slug" params={{slug:"integrations-connectors"}} key={name}><span>{name}</span><CirclePlus size={13}/></Link>)}</div>
          </section>
        </aside>
      </div>

      <footer className="command-footer">
        <div className="command-footer-columns">{footerGroups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.links.map((label) => label === "Home" ? <Link key={label} to="/">{label}</Link> : <Link key={label} to="/section/$slug" params={{slug: label === "IntelliDesk" ? "intellidesk" : label === "Marketplace" ? "intellimarketplace" : "administration-settings-support"}}>{label}</Link>)}</section>)}</div>
        <div className="command-footer-legal"><strong>IntelliStack Systems™</strong><strong>Maximus Optimus Global Command Center™</strong><span>© 2026 IntelliStack Systems. All rights reserved.</span></div>
      </footer>
    </div>
  );
}
