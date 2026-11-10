# Zru Studios

The supplied SublevelStudioLandingPage design, adapted to Zru Studios with the original Three.js lobby, arcade cabinet, basketball interaction, CRT terminal, particle transitions and footer terrain effect.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static host. Vite builds the Three.js dependency locally; there is no React or private ThreeUI package requirement. Google Fonts is the only external visual dependency; system fallbacks are provided.

## Source layout

- `index.html`: accessible page content, navigation, portfolio, capabilities and studio index.
- `src/styles.css`: the supplied responsive design and small branding additions.
- `src/main.js`: scene loading and WebGL failure fallback.
- `src/lobby.js`: original scene, physics, games and canvas textures; Three.js is pinned to 0.160.0 to match the supplied design.
- `public/runtime/`: supplied CRT, button, GSAP, particle and terrain runtimes, plus page interactions. Keep their script order in `index.html`.
- `public/design-assets/`: local illustrations, project sample imagery and character GLBs from the supplied bundle.

## Content

Zru Studios, its service names and the four portfolio titles come from the previous repository source. Rudraksh Sharma is the repository author. The public GitHub profile is the only contact destination. No unspecified email, address, social profile, founding date, legal company status, client list or hiring claim is published.

Portfolio images and the lobby screen animations are illustrative supplied design assets, not evidence of client work. The brief form copies text locally to the clipboard; it does not submit data or claim a newsletter subscription. On clipboard failure it offers manual copying.

The supplied design is integrated directly as HTML/CSS/JavaScript because its complete visual implementation was an HTML document. Its library wrapper referenced unrelated, unprovided components; reproducing that wrapper would add missing dependencies without changing this page.

## Verification

`npm run check` verifies source syntax, local asset references, fragment links, core Zru content, absence of template contact details and GLB integrity. The production build was verified. Browser visual and interaction QA could not be completed in the current desktop automation session; the original responsive CSS and interaction code are retained.
