# AI Design Studio asset map

This feature uses the exact artwork supplied by the user in the HelpBuddy expression sheet and the AI-team studio reference. Do not replace missing artwork with generic or generated characters.

## Intended asset layout

- `helpbuddy/expressions/`: happy, thinking, listening, excited, speaking, helpful, focused, alert, friendly, encouraging, supportive, celebrating.
- `helpbuddy/avatars/`, `helpbuddy/outfits/`: crops from the supplied reference only.
- `backgrounds/`, `headers/`: individual background and banner crops from the first reference.
- `maximus/`: crops from the second reference; blue robot identity is locked.
- `optimus/`: crops from the second reference; white robot identity is locked.
- `trinity/`: supplied Trinity artwork and outfit crops.

The design studio's navigation item is "AI Design Studio". HelpBuddy's status copy is intended to reflect real system activity and must not claim success until verified.

## Important asset limitation

The current reference files are photos of a display, not original source artwork files. Individual crops need to be reviewed for panel edges and perspective before they are treated as production assets. The UI intentionally indicates missing artwork rather than silently using generic character art.
