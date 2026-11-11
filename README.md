# Zru Studios

An interactive agency landing page for **Zru Studios**, combining a real-time 3D lobby with a portfolio, service overview and project brief tool.

Built with vanilla JavaScript, Three.js and Vite. The visual experience adapts the supplied `SublevelStudioLandingPage` design to the studio’s branding and existing project content.

[Repository](https://github.com/Rudraksh2996/zru-studios-landing) · [Rudraksh Sharma on GitHub](https://github.com/Rudraksh2996)

## Features

- **Interactive 3D lobby:** a detailed environment with animated lighting, reactive props and canvas-based screen artwork.
- **Playable experiences:** an arcade cabinet, basketball shooting and browsable CRT project screens, with visible touch and keyboard controls.
- **Adaptive graphics:** portrait camera framing, a bounded render resolution, reduced effects on touch devices, and a lighter view for devices that cannot comfortably run the scene.
- **Studio portfolio:** Luminary Dashboard, Apex Brand Identity, Orbit SaaS Platform and Prism Design System.
- **Service overview:** UI/UX design, web design, graphic design, template design and website development.
- **Motion effects:** particle transitions, a CRT studio index, animated buttons and a terrain effect behind the footer.
- **Local project briefs:** visitors can write and copy a brief without submitting it to a server.
- **Responsive page layout:** mobile navigation, a keyboard-accessible link to skip the lobby and a content fallback when scene loading fails or the WebGL context is lost.

## Technology

| Layer | Implementation |
| --- | --- |
| Page content | Semantic HTML |
| Styling | CSS with responsive layouts |
| Interaction | JavaScript ES modules and supplied browser runtimes |
| 3D rendering | Three.js `0.160.0` |
| Development and builds | Vite 8 |
| Fonts | Google Fonts, with local system fallbacks |
| Assets | Repository-hosted illustrations, sample images and character models |

The application is a static site. It does not require React, a backend, a database, API keys or an installed ThreeUI package.

## Getting started

### Prerequisites

- **Node.js 22.12 or newer**; Node.js 24 is a suitable choice.
- **npm**, included with Node.js.
- A browser with WebGL support for the interactive lobby.

### Installation

```sh
git clone https://github.com/Rudraksh2996/zru-studios-landing.git
cd zru-studios-landing
npm ci
npm run dev
```

Open the local URL printed by Vite. No environment variables are required.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the dependency versions recorded in `package-lock.json`. |
| `npm run dev` | Start the development server with live updates. |
| `npm run check` | Verify source syntax, assets, navigation and studio content. |
| `npm test` | Run input, dialog, viewport and control lifecycle regression tests. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm run preview` | Serve the production build locally for inspection. |

## Exploring the lobby

Choose **Arcade**, **Basketball** or **Project screens** in the lobby toolbar, or select the corresponding 3D object. On a touch screen, the home lobby allows vertical scrolling; a swipe does not activate an object.

| Experience | Controls |
| --- | --- |
| Arcade cabinet | Click the cabinet; use **Space** to start and fire. Move with **Left/Right arrows** or **A/D**. On touch screens, hold the on-screen arrows and **Fire** buttons; movement and firing support simultaneous touches. |
| Basketball | Click the hoop, then drag upward and release to shoot. **Space** or the on-screen **Shoot** button also takes a shot. |
| CRT project screens | Click a screen. Use the **arrow keys** to browse, select **Previous/Next**, or click another screen. |
| Exit a lobby experience | Select **Exit experience** or press **Escape**. |
| Studio index | Select the status chip in the header. Press **Escape** to close it. |
| Navigation menu | Open the menu from the header; select a link or press **Escape** to close it. |

Use **Skip 3D lobby** when navigating by keyboard to jump to the page content. **Use lighter view** reloads the page with `?graphics=off`, bypassing the lobby and GPU effects. **Enable 3D lobby** returns to the regular view.

Navigation and studio-index dialogs trap keyboard focus, make background content inert and restore focus on close. Small screens and reduced-motion settings use a readable, scrollable text studio index.

## Project structure

```text
zru-studios-landing/
├── index.html                  # Page content, navigation and script loading order
├── src/
│   ├── main.js                 # Scene entry point and WebGL fallback
│   ├── lobby.js                # Three.js scene, games and interactive props
│   ├── styles.css              # Original visual system
│   ├── responsive.css          # Fluid layouts, safe areas and control sizing
│   ├── input.js                # Held inputs, gestures and render budgets
│   ├── controls.js             # Touch and keyboard lobby controls
│   ├── dialog.js               # Focus management and modal isolation
│   └── interface.js            # Navigation and studio-index dialogs
├── public/
│   ├── favicon.svg             # Studio icon
│   ├── design-assets/          # Images and GLB character models (.bin files)
│   └── runtime/                # Browser effect libraries and page interactions
│       ├── page.js             # Menu, studio index, brief form and effect setup
│       ├── crt-runtime.js
│       ├── button-runtime.js
│       ├── gsap-runtime.js
│       ├── particle-scroll.js
│       ├── terrain-plume.js
│       └── storage-images.js
├── scripts/
│   └── check.mjs               # Source and asset verification
├── tests/
│   ├── responsive.test.mjs      # Input, dialog and viewport regressions
│   └── controls.html            # Browser fixture using production controls
├── package.json
├── package-lock.json
└── vite.config.js
```

Vite copies `public/` into the production output. Keep the browser runtime script order in `index.html`: page interactions depend on the effect runtimes loading first.

## Customization

| Change | Where to edit |
| --- | --- |
| Page title, description, navigation, projects and services | `index.html` |
| Colours, typography and base visual design | `src/styles.css` |
| Fluid layouts, safe areas and responsive behaviour | `src/responsive.css` |
| Touch, keyboard and dialog behaviour | `src/controls.js`, `src/input.js`, `src/dialog.js`, `src/interface.js` |
| Lobby geometry, lighting, screen artwork and game behaviour | `src/lobby.js` |
| CRT index copy, visual effects and brief form behaviour | `public/runtime/page.js` |
| Images and character assets | `public/design-assets/`, plus their references in HTML, CSS or JavaScript |
| Build configuration | `vite.config.js` |

Studio details appear in both the page content and the CRT index. When changing branding, also review the text drawn onto lobby screens in `src/lobby.js`.

Three.js is pinned to the version used by the supplied design. Validate rendering and interaction behaviour before upgrading it.

## Build and deployment

Run the checks and generate a production build:

```sh
npm run check
npm test
npm run build
npm run preview
```

Publish **the contents of `dist/`** to a static hosting provider.

For a Git-connected host, use these settings:

| Setting | Value |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `22.12+` |

The current source uses root-relative asset URLs such as `/design-assets/` and `/runtime/`. Deploy at the domain root. Hosting under a subdirectory, including a GitHub Pages project URL, requires updating those references and configuring Vite’s `base` before deployment.

Serve the built site over HTTP or HTTPS; opening `index.html` directly from the filesystem does not provide the module-loading environment the site expects. Clipboard copying requires a secure context such as HTTPS or localhost; the brief tool offers manual copying if clipboard access fails.

## Verification

`npm run check` checks:

- JavaScript syntax in the application and browser runtimes.
- Local asset references and navigation fragment targets.
- The four expected portfolio entries and core studio content.
- Selected template contact details that should not be published.
- Character model headers, format versions and declared file lengths.

`npm test` also covers simultaneous input sources, swipe/tap separation, render budgets through 8K, portrait camera framing, editable fields, dialog focus wrapping, scroll restoration, pointer cancellation and control mode changes.

Browser layout checks passed at ten viewport sizes from 240px through 4K, including portrait tablets and landscape phones. Mobile menu focus handling, studio-index readability and the production control UI were also checked. See [responsive verification](docs/responsive-qa.md) for the exact coverage and limits.

The browser control fixture is available at `/tests/controls.html` while `npm run dev` is running. It loads the real lobby markup and control module against a small game-state adapter, so input and layout can be checked without starting the GPU scene. It is not included in the production build. Full 3D visual and physics verification across physical devices remains outstanding.

## Content and data handling

The studio name, services and portfolio titles come from the original Zru Studios repository. Portfolio images and animated lobby screens are illustrative design assets; they are not evidence of completed client engagements.

The public GitHub profile is the contact destination. Unspecified email addresses, locations and social profiles are omitted.

The project brief tool writes to the visitor’s clipboard only when requested. It does not send the brief to a server or create a newsletter subscription. Images, models and effect scripts are served locally; Google Fonts requests are external.

## Design credits and licensing

The landing page adapts the user-supplied `SublevelStudioLandingPage` source and its bundled visual effects and assets. The studio identity and existing project titles belong to the Zru Studios project.

This repository does not currently include a `LICENSE` file. Check the applicable permissions for the supplied source, bundled runtimes and media before redistributing them. Dependencies retain their respective licenses.
