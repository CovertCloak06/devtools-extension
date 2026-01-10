# Dev Tools Chrome Extension

A lightweight, cyberpunk-themed developer tools extension for Chrome. Inspect elements, modify styles, and export CSS changes - all in floating glass panels with customizable themes.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Version](https://img.shields.io/badge/Version-2.1-cyan)

## Features

- **Inspector** - Pick and select any element on the page
- **Styles** - Modify size, spacing, colors, borders, opacity in real-time
- **Console** - Run JavaScript in the page context
- **Elements** - Search elements by CSS selector
- **Network** - Monitor fetch/XHR requests with filters and detail view
- **Settings** - Customize theme colors (8 presets + custom picker)
- **Export CSS** - Download all your style modifications
- **Undo** - Revert style changes with Ctrl+Z

### Panel Controls
- Drag header to move
- Resize from edges/corners
- **Snap zones** - Drag to screen edges for half/quarter layouts (Windows-style)
- **◐** Transparent mode
- **−** Minimize to header
- **×** Close panel

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Esc` | Toggle DevTools |
| `P` | Pick element |
| `Ctrl+Z` | Undo style change |
| `H` | Hide selected |
| `S` | Show selected |
| `Del` | Delete selected |
| `C` | Copy selector |
| `O` | Outline all elements |

## Install

1. Clone this repo or download ZIP
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the extension folder

## Usage

1. Click the extension icon on any page
2. Open tools from the main hub panel
3. Use **Pick Element** (or press `P`) to select elements
4. Modify styles and see changes live
5. Export CSS when done

## Theme Customization

Open the **Settings** panel to choose from 8 preset colors or use the custom color picker:
- Cyan, Magenta, Green, Orange, Pink, Purple, Yellow, White

Your theme preference is saved and persists across sessions.

## Tech Stack

- Vanilla JavaScript (no dependencies)
- Chrome Manifest V3
- CSS backdrop-filter for glass effect
- localStorage for settings persistence

## Files

```
devtools-extension/
├── manifest.json    # Extension config
├── background.js    # Click handler
├── content.js       # Main devtools UI/logic (~1280 lines)
├── icons/           # Extension icons
├── README.md        # This file
├── NOTES.md         # Dev notes & changelog
└── CLAUDE.md        # AI assistant context
```

## License

MIT
