# Dev Tools - Chrome Extension

## Project Location
`/home/gh0st/devtools-extension/`

## Install
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder

## Files
- `manifest.json` - Extension config (Manifest V3)
- `background.js` - Click handler, injects content.js
- `content.js` - The actual devtools UI and logic (~1280 lines)
- `icons/` - Extension icons (16, 48, 128px)

## Features
- **Main Hub** - Central panel to open other tools
- **Inspector** - Pick elements, hide/show/remove, copy HTML, copy selector
- **Styles** - Size, spacing, colors, border, radius, opacity, undo, export CSS
- **Console** - Run JS in page context
- **Elements** - Search by CSS selector
- **Network** - Monitor fetch/XHR/resource requests, filter by type, view details
- **Settings** - Theme color picker (8 presets + custom)
- **Shortcuts** - Keyboard shortcut reference

### Panel Controls
- **Drag** - Grab header to move
- **Resize** - Bottom bar, right edge, corner
- **Snap** - Drag to edges for half/quarter screen (Windows-style)
- **◐** - Transparent mode (see-through)
- **−** - Minimize (collapse to header)
- **×** - Close panel

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Esc | Toggle DevTools |
| P | Pick element |
| Ctrl+Z | Undo style change |
| H | Hide selected |
| S | Show selected |
| Del | Delete selected |
| C | Copy selector |
| O | Outline all |

## Changelog

### v2.1.0 (2026-01-10)
- Network panel: intercepts fetch/XHR, monitors images/JS/CSS via PerformanceObserver
- Filter by type (All, Fetch, XHR, Img, JS, CSS)
- Click request to see details and response headers
- Fixed button label visibility with !important styles
- Hub panel height increased for 8 tools

### v2.0.0 (2026-01-08)
- Theme customization with 8 preset colors + custom picker
- localStorage persistence for panel positions and theme
- Keyboard shortcuts
- Additional style controls (padding, margin, border radius, opacity)
- Undo functionality for style changes
- Copy CSS selector button
- Settings panel and Shortcuts panel

### v1.1.0 (2026-01-06)
- Fixed minimize to collapse to header only (not black box)
- Added Windows-style snap zones (half/quarter screen)
- Moved to standalone project `/home/gh0st/devtools-extension/`
- Added NOTES.md for project context

### v1.0.0 (2026-01-06)
- Initial release
- Main hub + 4 tool panels
- Draggable, resizable panels
- Transparent mode toggle
- Pick element with hover highlight
- Style controls (size, colors, border)
- CSS export
- JS console with eval
- Element search

## TODO
- [ ] DOM tree view in Elements panel
- [ ] Network tab
- [ ] Performance metrics
- [ ] Redo functionality
- [ ] Multiple element selection

## Tech Notes
- Uses Manifest V3 (required for Chrome)
- All CSS scoped with `.__dt_` prefix to avoid conflicts
- z-index starts at 2147483647 (max safe)
- Panels track modified elements in Map for CSS export
- Settings stored in localStorage under `__devtools_settings`
- Theme uses `accentRGB()` helper for RGBA color variants
