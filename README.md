# Dev Tools Chrome Extension

A lightweight, cyberpunk-themed developer tools extension for Chrome. Inspect elements, modify styles, and export CSS changes - all in floating glass panels.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

## Features

- **Inspector** - Pick and select any element on the page
- **Styles** - Modify width, height, colors, borders in real-time
- **Console** - Run JavaScript in the page context
- **Elements** - Search elements by CSS selector
- **Export CSS** - Download all your style modifications

### Panel Controls
- Drag header to move
- Resize from edges/corners
- **◐** Transparent mode
- **−** Minimize to header
- **×** Close panel
- Edge snapping (panels snap to screen edges)

## Install

1. Clone this repo or download ZIP
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the extension folder

## Usage

1. Click the extension icon on any page
2. Open tools from the main hub panel
3. Use **Pick Element** to select elements
4. Modify styles and see changes live
5. Export CSS when done

## Screenshots

The extension uses a dark cyberpunk theme with cyan accents and glass-morphism panels.

## Tech Stack

- Vanilla JavaScript (no dependencies)
- Chrome Manifest V3
- CSS backdrop-filter for glass effect

## Files

```
devtools-extension/
├── manifest.json    # Extension config
├── background.js    # Click handler
├── content.js       # Main devtools UI/logic
├── icons/           # Extension icons
├── README.md        # This file
└── NOTES.md         # Dev notes & changelog
```

## License

MIT
