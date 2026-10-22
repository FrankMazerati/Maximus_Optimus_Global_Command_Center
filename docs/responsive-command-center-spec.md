# Responsive Command Center Specification

## Canonical layout
The Command Center is one application across landscape and portrait tablet orientations. Orientation changes spatial arrangement only; it does not remove functionality or create a separate application.

### Header
The header contains only Command Center identity, user profile, welcome message, manager/escalation access, and environment/status controls. No hamburger belongs in the header.

### Independent workspace regions
1. **Command Navigation** — full Command Center navigation, independently scrollable and reorderable by drag/hold; moving one item moves the remaining items accordingly and persists the chosen order.
2. **Middle Workspace** — independently scrollable. Order: Personal Command Center; Section 1 Global Information (Global Time + News Feed); Section 2 Quick Picks; News Feed categories (Security, Network, Global News) with 5+5 selectable items; Bring the Work to You; remaining dashboard sections.
3. **HelpBuddy** — persistent right-side workspace in landscape and an equivalent persistent/contextual region in portrait; it must not scroll away with the middle workspace.

## Tablet behavior
Landscape uses the three-region model: Command Navigation | Middle Workspace | HelpBuddy.
Portrait reflows the same regions vertically while preserving access to the same controls and workflows. Command Navigation becomes a touch-accessible independent navigation surface; Middle Workspace remains independently scrollable; HelpBuddy remains independently accessible and persistent.

## Touch requirements
All controls must have tablet-appropriate touch targets. Navigation reordering must support touch hold/drag. Quick Picks remain selectable in a 5+5 arrangement when space permits and reflow without losing entries when space is constrained.

## Functional invariants
- No duplicate hamburger.
- No orientation-specific feature removal.
- No hard-coded weather/time values.
- Status remains an interactive selector.
- Global ID and Company ID remain immutable.
- Profile/settings gear remains available for editable profile fields.
