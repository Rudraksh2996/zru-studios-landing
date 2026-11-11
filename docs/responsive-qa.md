# Responsive verification

Checked on 11 November 2026 using the desktop in-app browser and Node.js regression tests.

## Page layout

The page was checked in its lightweight view (`?graphics=off`) so GPU scene startup did not block layout inspection.

| Viewport | Page horizontal overflow | Header fits | Portfolio columns |
| --- | --- | --- | --- |
| 240 × 640 | None | Yes | 1 |
| 320 × 568 | None | Yes | 1 |
| 390 × 844 | None | Yes | 1 |
| 768 × 1024 | None | Yes | 2 |
| 844 × 390 | None | Yes | 2 |
| 1024 × 768 | None | Yes | 2 |
| 1440 × 900 | None | Yes | 2 |
| 1920 × 1080 | None | Yes | 2 |
| 2560 × 1440 | None | Yes | 2 |
| 3840 × 2160 | None | Yes | 2 |

Mobile and desktop screenshots were visually inspected. A narrow capability label found during inspection was corrected to span the grid instead of wrapping into a single vertical column. Additional bounds checks found no clipped page text or links at 240px, 390px, 768px, 844px, 1440px and 3840px widths.

## Navigation and studio index

- Mobile menu fits the viewport, with scrolling available for shorter screens.
- Opening the menu focuses its close button.
- Shift+Tab from the first control wraps to the last menu link.
- Background content receives `inert` and `aria-hidden` while a dialog is open.
- Escape closes the menu.
- The mobile studio index presents a readable, scrollable text mirror.

## Control UI

`/tests/controls.html` uses the production lobby markup and control module with a game-state adapter. It does not render the Three.js scene.

- Arcade entry, Fire activation and Exit were exercised in the browser.
- Basketball entry and Shoot updated the adapter's shot count.
- Project-screen entry and Next updated the selected-screen index.
- Experience-picker buttons fit at 240 × 640, 320 × 568, 390 × 844, 844 × 390, 768 × 1024 and 1440 × 900.
- Checked picker targets were at least 48px high, or 44px in short landscape layouts.

## Automated regressions

`npm test` covers seven cases:

1. Simultaneous touch and keyboard holds, independent release and clearing held inputs.
2. Separation of tap activation from scrolling swipes.
3. A 2.1-million-pixel render budget at 11 viewport sizes through 8K, at four pixel ratios and for coarse/fine pointers.
4. Portrait camera-distance scaling, unchanged wide-screen framing and preserved basketball camera geometry so the existing shot calibration is retained.
5. Detection of editable fields that must keep their own keyboard input.
6. Dialog focus wrapping, prior inert/ARIA state preservation and scroll/focus restoration.
7. Lobby mode entry/exit, touch cancellation, blur cleanup, keyboard release, shooting and screen browsing.

`npm run check` verifies syntax, referenced assets, navigation fragments, the four portfolio cards and model integrity. `npm run build` verifies production bundling.

## Limits

The full 3D scene stalled the in-app browser during startup. Its final appearance, game physics and sustained performance were not verified on physical phones, tablets or different GPUs. The browser fixture validates the input layer, not rendered game behaviour.

Safe-area handling, reduced-motion rules and coarse-pointer optimizations are implemented; real-device notch, virtual-keyboard and multi-finger gesture checks remain useful before release. The viewport matrix is representative coverage, not a guarantee for every possible device or browser.
