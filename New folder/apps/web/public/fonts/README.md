This folder now contains self-hosted Persian fonts copied from fonts already installed on this local Windows machine.

Current setup:

- Active UI stack is defined in `apps/web/app/globals.css`.
- `Nazanin Local` is the primary UI font.
- `Lotus Local` is bundled as a secondary available Persian font.
- Dana is still not bundled in this repository.

Notes:

- The copied files are TrueType (`.ttf`) assets from the local Windows font directory.
- `font-display: swap` is enabled for the active `@font-face` rules.
- Fallbacks remain in place for environments where these files are removed later.
