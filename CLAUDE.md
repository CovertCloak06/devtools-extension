# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**Dev Tools Chrome Extension** - A standalone, cyberpunk-themed developer tools Chrome extension with floating glass panels. Created as a separate project (not part of PKN).

## Key Files

- `manifest.json` - Chrome extension config (Manifest V3)
- `background.js` - Handles extension icon click, injects content.js
- `content.js` - **Main file** - All UI and logic (~700 lines)
- `icons/` - Extension icons (16, 48, 128px)

## Architecture

Everything is in `content.js` as a single IIFE that injects into the page:
- CSS styles (scoped with `.__dt_` prefix)
- HTML for 5 panels (hub, inspector, styles, console, elements)
- Panel class handles drag/resize/snap
- Event listeners for all controls

## Features

- **Main Hub** - Opens other tool panels
- **Inspector** - Pick element, hide/show/remove, copy HTML
- **Styles** - Width/height sliders, colors, border, export CSS
- **Console** - Eval JS in page context
- **Elements** - Search by CSS selector

### Panel Behaviors
- Draggable (header)
- Resizable (bottom bar, right edge, corner)
- Edge snapping (25px threshold)
- Center snapping
- Transparent mode (◐ button)
- Minimize (− button) - collapses to header only

## Development

```bash
# Test changes
1. Edit content.js
2. Go to chrome://extensions
3. Click refresh icon on the extension
4. Test on any page
```

## Style Guide

- Cyberpunk theme: dark bg (#0f0f14), cyan accents (#00ffff)
- Glass panels: backdrop-filter blur, semi-transparent
- All CSS classes prefixed with `.__dt_` to avoid conflicts
- z-index starts at 2147483647 (max safe integer)

## GitHub

Repo: https://github.com/CovertCloak06/devtools-extension

## Recent Changes (2026-01-06)

- Created as standalone project (moved from ~/pkn/debugger-app/)
- Fixed minimize to collapse properly
- Added edge snapping (25px) and center snapping
- Initial GitHub push
