# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**Dev Tools Chrome Extension** - A standalone, cyberpunk-themed developer tools Chrome extension with floating glass panels. Created as a separate project (not part of PKN).

## Key Files

- `manifest.json` - Chrome extension config (Manifest V3)
- `background.js` - Handles extension icon click, injects content.js
- `content.js` - **Main file** - All UI and logic (~1280 lines)
- `icons/` - Extension icons (16, 48, 128px)

## Architecture

Everything is in `content.js` as a single IIFE that injects into the page:
- CSS styles (scoped with `.__dt_` prefix)
- HTML for 8 panels (hub, inspector, styles, console, elements, network, settings, shortcuts)
- Panel class handles drag/resize/snap
- Settings stored in localStorage
- Event listeners for all controls

## Features

- **Main Hub** - Opens other tool panels
- **Inspector** - Pick element, hide/show/remove, copy HTML, copy selector
- **Styles** - Width/height, padding/margin, colors, border, radius, opacity, export CSS, undo
- **Console** - Eval JS in page context
- **Elements** - Search by CSS selector
- **Network** - Monitor fetch/XHR/resource requests with filters and detail view
- **Settings** - Theme color presets + custom picker, reset options
- **Shortcuts** - Keyboard shortcut reference

### Panel Behaviors
- Draggable (header)
- Resizable (bottom bar, right edge, corner)
- Windows-style snap zones (half/quarter screen)
- Transparent mode (button)
- Minimize (button) - collapses to header only
- Position persistence via localStorage

### Keyboard Shortcuts
- `Esc` - Toggle DevTools
- `P` - Pick element
- `Ctrl+Z` - Undo style change
- `H` - Hide selected element
- `S` - Show selected element
- `Del` - Delete selected element
- `C` - Copy selector
- `O` - Toggle outline all

## Development

```bash
# Test changes
1. Edit content.js
2. Go to chrome://extensions
3. Click refresh icon on the extension
4. Test on any page
```

## Style Guide

- Cyberpunk theme: dark bg (#0f0f14), customizable accent color
- Glass panels: backdrop-filter blur, semi-transparent
- All CSS classes prefixed with `.__dt_` to avoid conflicts
- z-index starts at 2147483647 (max safe integer)
- Theme colors: cyan, magenta, green, orange, pink, purple, yellow, white + custom

## GitHub

Repo: https://github.com/CovertCloak06/devtools-extension

## Changelog

### v2.1.0 (2026-01-10)
- Network panel: intercepts fetch/XHR, monitors resources via PerformanceObserver
- Filter by type (All, Fetch, XHR, Img, JS, CSS)
- Click request to see details and response headers
- Fixed button label visibility with !important styles

### v2.0.0 (2026-01-08)
- Theme customization: 8 preset colors + custom color picker
- localStorage persistence for panel positions and theme
- Keyboard shortcuts (Esc, P, Ctrl+Z, H, S, Del, C, O)
- Additional style controls: padding, margin, border radius, opacity
- Undo functionality for style changes
- Copy CSS selector button
- Settings panel and Shortcuts panel
- Code refactored to ~1000 lines

### v1.1.0 (2026-01-06)
- Fixed minimize to collapse properly
- Added Windows-style snap zones (half/quarter screen)
- Initial GitHub push

### v1.0.0 (2026-01-06)
- Created as standalone project (moved from ~/pkn/debugger-app/)
- Main hub + 4 tool panels
- Draggable, resizable, transparent panels
