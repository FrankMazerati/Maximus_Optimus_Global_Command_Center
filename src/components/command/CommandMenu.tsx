import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ChevronDown, ChevronRight, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menu } from "@/lib/menu";
import { dashboardPages, resolveMenuItem } from "@/lib/dashboard-pages";
export function CommandMenu({ active, onClose }: { active?: string; onClose: () => void }) {
  const [expanded, setExpanded] = useState(active ?? "");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex">
      <nav
        aria-label="Command menu"
        className="scroll-blue h-full w-80 max-w-[90vw] shrink-0 border-r border-primary bg-popover p-3 shadow-[var(--glow)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <strong>Command Menu</strong>
          <Button size="icon" variant="ghost" aria-label="Close menu" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded border border-border px-2">
          <Search className="h-4 w-4 text-primary" />
          <input
            aria-label="Search menu"
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button asChild variant="ghost" className="mb-2 w-full justify-start">
          <Link to="/" onClick={onClose}>
            <Home />
            Home
          </Link>
        </Button>
        <div className="mb-2 text-xs uppercase text-primary">Command Pages</div>
        {dashboardPages
          .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
          .map((p) => (
            <Button
              asChild
              key={p.slug}
              variant="ghost"
              className={`mb-1 h-auto min-h-9 w-full justify-start whitespace-normal text-left text-xs ${active === p.slug ? "bg-accent/40 text-primary" : ""}`}
            >
              <Link to="/section/$slug" params={{ slug: p.slug }} onClick={onClose}>
                <ChevronRight />
                {p.title}
              </Link>
            </Button>
          ))}
        <div className="my-3 border-t border-border pt-3 text-xs uppercase text-muted-foreground">
          All Applications
        </div>
        {menu
          .filter((m) => !query || JSON.stringify(m).toLowerCase().includes(query.toLowerCase()))
          .map((m) => (
            <div key={m.slug} className="border-b border-border/50">
              <div className="flex items-center">
                <Button
                  asChild
                  variant="ghost"
                  className="h-auto min-h-9 flex-1 justify-start whitespace-normal text-left text-xs"
                >
                  <Link to="/section/$slug" params={{ slug: m.slug }} onClick={onClose}>
                    {m.title}
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Show ${m.title} sections`}
                  aria-expanded={expanded === m.slug}
                  onClick={() => setExpanded(expanded === m.slug ? "" : m.slug)}
                >
                  {expanded === m.slug ? <ChevronDown /> : <ChevronRight />}
                </Button>
              </div>
              {(expanded === m.slug || query) &&
                m.groups.map((g) => (
                  <div key={g.name} className="pl-3">
                    <div className="my-2 text-[10px] uppercase text-muted-foreground">{g.name}</div>
                    {g.items
                      .filter((it) => !query || it.toLowerCase().includes(query.toLowerCase()))
                      .map((it) => (
                        <Button
                          key={it}
                          asChild
                          variant="ghost"
                          className="h-auto min-h-7 w-full justify-start whitespace-normal text-left text-[11px]"
                        >
                          <Link
                            to="/section/$slug"
                            params={{ slug: resolveMenuItem(it, m.slug) }}
                            onClick={onClose}
                          >
                            {it}
                          </Link>
                        </Button>
                      ))}
                  </div>
                ))}
            </div>
          ))}
      </nav>
      <Button
        variant="ghost"
        className="h-full flex-1 rounded-none bg-background/60"
        aria-label="Dismiss menu"
        onClick={onClose}
      />
    </div>
  );
}
