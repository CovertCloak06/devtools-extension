# PKN Dev Tools - Chrome Extension

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
- `content.js` - The actual devtools UI and logic
- `icons/` - Extension icons (16, 48, 128px)

## Features
- **Main Hub** - Central panel to open other tools
- **Inspector** - Pick elements, hide/show/remove, copy HTML
- **Styles** - Width/height, colors, border, export CSS
- **Console** - Run JS in page context
- **Elements** - Search by CSS selector

### Panel Controls
- **Drag** - Grab header to move
- **Resize** - Bottom bar, right edge, corner
- **◐** - Transparent mode (see-through)
- **−** - Minimize (collapse to header)
- **×** - Close panel

### Special Features
- Edge snapping (panels snap to screen edges)
- Export CSS downloads all modifications
- Click search results to select element

## Changelog

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

### v1.1.0 (2026-01-06)
- Fixed minimize to collapse to header only (not black box)
- Added edge snapping (15px threshold)
- Moved to standalone project `/home/gh0st/devtools-extension/`
- Added NOTES.md for project context

## TODO
- [ ] Save panel positions to localStorage
- [ ] Add more style controls (padding, margin, opacity)
- [ ] DOM tree view in Elements panel
- [ ] Network tab
- [ ] Performance metrics

## Tech Notes
- Uses Manifest V3 (required for Chrome)
- All CSS scoped with `.__dt_` prefix to avoid conflicts
- z-index starts at 2147483647 (max safe)
- Panels track modified elements in Map for CSS export
