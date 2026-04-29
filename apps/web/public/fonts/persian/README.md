Legacy Persian font files live here:

- `nazanin-regular.ttf`
- `nazanin-bold.ttf`
- `lotus-regular.ttf`
- `lotus-bold.ttf`

They are no longer part of the active UI font stack.

The production UI uses `Vazirmatn` from `@fontsource/vazirmatn` and `Inter` from `@fontsource/inter`, imported in `apps/web/app/layout.tsx`.
Fonts are bundled and served by the app build, with no external runtime font CDN.
