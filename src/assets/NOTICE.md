# src/assets/world-110m.json

Country boundary TopoJSON, 110m resolution, at country-level detail (sufficient
for tapping individual countries on a schematic Europe map).

- **Source data:** [Natural Earth](https://www.naturalearthdata.com/) — public domain.
- **Packaged/distributed via:** [world-atlas](https://github.com/topojson/world-atlas)
  (`countries-110m.json`, unmodified), Copyright 2013-2019 Michael Bostock, ISC-style
  license (see below).
- **Vendored** here so the map loads fully offline (required for the Capacitor
  build) — no runtime fetch from a CDN.

```
Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

# src/assets/fonts/

Spectral (300, 400, 400 italic) and Golos Text (variable 400–500), WOFF2, latin /
latin-ext / cyrillic / cyrillic-ext subsets, as served by Google Fonts.

- **Spectral** — Copyright 2017 The Spectral Project Authors (Production Type).
- **Golos Text** — Copyright 2020 The Golos Text Project Authors (Paratype).
- Both licensed under the **SIL Open Font License 1.1** (https://openfontlicense.org).
- **Vendored** so the UI fonts load offline in the Capacitor build. `fonts.css` maps each
  subset by `unicode-range`, so the browser only downloads the subsets a page needs.

# src/assets/medals/

Medal artwork (96 SVGs: 24 medals × light/dark × earned/locked, 100×150 viewBox) from the
«Глава государства» medals design handoffs — `design_handoff_medals` (medals 1–8) and
`design_handoff_medals_new` (9–24) — vendored unchanged. `ui/components/MedalArt.tsx` maps the
first handoff's artwork ids to ours; the second handoff already uses our ids.

# public/ icons and resources/logo/

Game logo («1a Печать», a wordless state seal) from the «Глава государства» logo design handoff
(`design_handoff_logo`), vendored unchanged. `public/` holds the web set referenced by
`index.html` and `public/manifest.webmanifest` (SVG favicon + 16/32/48 PNG fallbacks,
apple-touch-icon 180, manifest icons 192/512, og:image 1200×630). `resources/logo/` holds the
masters for the native build (Capacitor, stage 4): `symbol.svg`/`symbol-1024.png` (transparent
mark, min 48 px — use the favicon below that), `app-icon-1024.*` (full-bleed square; don't
pre-round), `android-foreground-432.svg` (adaptive-icon foreground; background `#1B2C4D`,
drop the filter shadow if it doesn't convert to a vector drawable).
