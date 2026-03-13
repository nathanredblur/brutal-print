# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on localhost:4321
pnpm build            # Production build (Astro + Tailwind)
pnpm preview          # Preview production build
pnpm cloudflare:deploy  # Deploy to Cloudflare Workers
```

No test runner is configured. Debugging uses a custom logger (`src/lib/logger.ts`) activated via `window.enableThermalDebug()` or `document.cookie = "debug_thermal=true"`.

## Architecture

**Thermal Print Studio** — A Canva-style web editor for designing and printing on MXW01 thermal printers via Web Bluetooth.

**Stack**: Astro 5 + React 19 + TypeScript, Fabric.js 6 for canvas, Zustand for state, Tailwind CSS 4 + shadcn/ui, deployed on Cloudflare Workers.

### Key Patterns

- **State management**: All app state lives in Zustand stores (`src/stores/`). Layers store uses IndexedDB via `idb-keyval` for persistence; others use localStorage.
- **Canvas**: `FabricCanvas.tsx` wraps Fabric.js and syncs with `useLayersStore`. `CanvasManager.tsx` orchestrates the editor layout and panels. Canvas is fixed at 384px width (thermal printer width) with variable height.
- **Image processing**: `src/lib/dithering/` implements 5 algorithms (Floyd-Steinberg, Atkinson, Bayer, Halftone, Threshold) for converting images to 1-bit monochrome. Original image data is preserved in layers for non-destructive re-processing.
- **Printer**: `src/stores/usePrinterStore.ts` manages Bluetooth connection state. `mxw01-thermal-printer` library handles the protocol.
- **Path aliases**: `@/*` maps to `src/*`.

### Component Structure

- `src/pages/index.astro` — Single page entry point
- `src/components/App.tsx` — Root React component
- `src/components/CanvasManager.tsx` — Main editor orchestrator
- `src/components/FabricCanvas.tsx` — Fabric.js canvas wrapper
- `src/components/properties/` — Property panel sections (size, position, typography, filters)
- `src/components/ui/` — shadcn/ui primitives
- `src/stores/` — Zustand stores (canvas, layers, printer, project, UI, confirm dialog)
- `src/lib/dithering/` — Image dithering algorithms
- `src/utils/` — Project I/O, image conversion, canvas rendering
- `src/constants/` — Fonts, canvas styles, image defaults
- `src/types/layer.ts` — Layer type definitions

### Design System (Neuro Core)

Purple/blue glassmorphism theme on dark slate backgrounds. See `docs/COLOR_SYSTEM.md` for the full palette. Use existing Tailwind classes and CSS variables defined in `src/styles/global.css`.
