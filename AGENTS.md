<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Reference dashboard definitions live in a shared browser-safe catalog; menu links resolve through that catalog so every reference page has a stable URL.
- Interactive demo records live in a root React provider, preserving edits across navigation without representing them as saved or connected production data.
- Section routes resolve reference dashboards before generic menu sections; the shared menu and homepage both use the dashboard catalog so identity-only pages remain reachable.
- Compact custom controls use the Button plain variant to preserve the reference styling without duplicating control primitives.
