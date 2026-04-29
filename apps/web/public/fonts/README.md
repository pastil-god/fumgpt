The active UI font setup is package-based and self-hosted through the app build.

Current active stack:

- Persian / Arabic / RTL UI: `Vazirmatn`
- English / Latin fallback: `Inter`
- CSS stack: `"Vazirmatn", "Inter", system-ui, sans-serif`

Source:

- `@fontsource/vazirmatn`
- `@fontsource/inter`

Only weights 400, 500, 600, and 700 are imported in `apps/web/app/layout.tsx`.
No Google Fonts CDN or external runtime font CDN is used.

Legacy note:

- The old Lotus, Nazanin, and Dana folders are not required for the active UI.
- The old local `.ttf` files remain in this folder for now, but they are no longer referenced by `globals.css`.
