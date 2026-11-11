import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, FolderOpen, Layers, Link2, FileText } from "lucide-react";
import { AppShell } from "../AppShell";
import { Button } from "@/components/ui/button";
import { findDestination, findWorkspace, WORKSPACE_ROUTES } from "@/lib/menu-spec";

export function WorkspaceStructure({ slug }: { slug: string }) {
  const destination = findDestination(slug);
  const workspace = findWorkspace(slug) ?? findWorkspace(destination?.sectionId ?? "");
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const groups = useMemo(() => workspace?.groups.filter((group) => groupFilter === "all" || group.id === groupFilter).map((group) => ({
    ...group,
    destinations: group.destinations.filter((item) => `${item.label} ${group.name}`.toLowerCase().includes(query.trim().toLowerCase())),
  })).filter((group) => group.destinations.length > 0) ?? [], [workspace, query, groupFilter]);
  if (!workspace) return null;
  const pageCount = workspace.groups.reduce((total, group) => total + group.destinations.length, 0);
  const liveRoute = WORKSPACE_ROUTES[workspace.id];
  return (
    <AppShell active={workspace.id}>
      <div className="space-y-5">
        <header className="border-b border-border pb-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link to="/">Command Center</Link><ArrowRight className="h-3 w-3" />
            <Link to="/section/$slug" params={{ slug: workspace.id }}>{workspace.title}</Link>
            {destination && <><ArrowRight className="h-3 w-3" /><span>{destination.groupName}</span></>}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold text-primary">{workspace.number > 0 ? `WORKSPACE ${String(workspace.number).padStart(2, "0")}` : "ACCOUNT & SUPPORT"}</p>
              <h1 className="break-words font-display text-2xl font-bold">{destination?.label ?? workspace.title}</h1>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{workspace.description}</p>
            </div>
            {liveRoute && <Button asChild variant="outline"><Link to={liveRoute}>Open existing workspace<ArrowRight className="h-4 w-4" /></Link></Button>}
          </div>
        </header>
        <div className="grid grid-cols-2 gap-4 border-b border-border pb-5 lg:grid-cols-4">
          {[{ icon: Layers, value: workspace.groups.length, label: "Subcategories" }, { icon: FileText, value: pageCount, label: "Page destinations" }, { icon: FolderOpen, value: "Structure", label: "Current stage" }, { icon: Link2, value: "Not connected", label: "Production services" }].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex min-w-0 items-center gap-3"><Icon className="h-5 w-5 shrink-0 text-primary" /><div><strong className="block break-words text-sm">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></div></div>
          ))}
        </div>
        {destination && <section className="border-b border-border pb-5">
          <h2 className="mb-3 text-sm font-semibold text-primary">{destination.label} overview</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div><h3 className="mb-2 text-sm font-medium">Records</h3><p className="text-xs text-muted-foreground">No connected records. This page is prepared for {destination.label.toLowerCase()}.</p></div>
            <div><h3 className="mb-2 text-sm font-medium">Activity history</h3><p className="text-xs text-muted-foreground">No activity recorded for this page.</p></div>
          </div>
        </section>}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{destination ? "Related pages" : "Workspace pages"}</h2>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3 py-2"><Search className="h-4 w-4 shrink-0 text-primary" /><input aria-label="Search workspace pages" placeholder="Search pages…" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full min-w-0 bg-transparent text-xs outline-none" /></label>
              <select aria-label="Filter subcategory" value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className="max-w-full rounded-md border border-input bg-popover px-3 py-2 text-xs text-popover-foreground"><option value="all">All subcategories</option>{workspace.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => <article key={group.id} className="min-w-0 rounded-md border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><FolderOpen className="h-4 w-4 shrink-0" />{group.name}</h3>
              <div className="space-y-1">{group.destinations.map((item) => <Button key={item.slug} variant="ghost" asChild className="h-auto min-h-9 w-full justify-between whitespace-normal text-left text-xs"><Link to="/section/$slug" params={{ slug: item.slug }}><span>{item.label}</span><ArrowRight className="h-3 w-3 shrink-0" /></Link></Button>)}</div>
            </article>)}
          </div>
          {groups.length === 0 && <p role="status" className="py-8 text-center text-sm text-muted-foreground">No pages match your search.</p>}
        </section>
        <section className="border-t border-border pt-5">
          <h2 className="mb-2 text-sm font-semibold">Planned operations</h2>
          <p className="mb-3 text-xs text-muted-foreground">Unavailable until the required services are connected.</p>
          <div className="flex flex-wrap gap-2">{workspace.actions?.map((action) => <Button key={action} variant="outline" size="sm" disabled>{action}</Button>)}</div>
        </section>
      </div>
    </AppShell>
  );
}