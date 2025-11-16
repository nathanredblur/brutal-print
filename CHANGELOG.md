# Changelog - Thermal Print Studio

All notable changes to this project will be documented in this file.

---

## [1.8.0] - 2025-11-16 ✅ **Smart Image Filters & Persistence**

### ✨ Features

- **Smart Image Filters**: Change dithering method after upload without re-uploading
- **Canvas Persistence**: Auto-save and restore work from localStorage
- **New Canvas Button**: Clear all layers while keeping canvas height
- **Original Image Storage**: Reprocess images with different dithering methods without quality loss

### 🔧 Technical

- Original images stored as base64 for reprocessing
- Auto-save with 2-second debounce
- Complete state serialization/deserialization
- `useCanvasPersistence` custom hook

---

## [1.7.0] - 2025-11-12 ✅ **Properties Panel & Live Editing**

### ✨ Features

- **Properties Panel**: Real-time editing of selected elements
- **Text Editing**: Edit content, font, size, style, alignment live
- **Dynamic Canvas Height**: Adjust from 400px to 2000px
- **Context-aware UI**: Panel adapts to selected layer type

### 🔧 Technical

- Local state prevents input lag
- Type-safe layer updates (`updateTextLayer`, `updateImageLayer`)
- Separate canvas dimension management

---

## [1.6.0] - 2025-11-12 ✅ **Interactive Canvas**

### ✨ Features

- **Fabric.js Integration**: Professional canvas manipulation
- **Direct Element Control**: Drag, resize, rotate on canvas
- **Bidirectional Sync**: Canvas ↔ Layer Panel
- **Visual Handles**: Corner handles for resize, rotation handle for rotate

### 🔧 Technical

- `FabricCanvas.tsx` component wrapping Fabric.js
- Fabric objects sync with layer state
- Export to HTML canvas for printing
- Hardware-accelerated rendering

---

## [1.5.0] - 2025-11-12 ✅ **Layer Management UX**

### ✨ Features

- **Toast Notifications**: Beautiful in-app notifications replacing browser alerts
- **Delete Confirmation**: Modal dialog for layer deletion
- **Drag & Drop Reordering**: Drag layers to change z-order
- **Subtle Feedback**: Visual feedback over notification spam

### 🔧 Technical

- `ToastContext` for global notifications
- `ConfirmDialog` component with Neuro Core styling
- Native HTML5 Drag & Drop API
- No toast on image upload (visual feedback only)

---

## [1.0.0] - 2024-11-12 ✅ **PRINTING FIX - MVP Complete**

### 🐛 Critical Bug Fixed

**Problem**: Printer connected but wouldn't print
**Solution**: Rewrote printer integration following [official mxw01-thermal-printer patterns](https://github.com/clementvp/mxw01-thermal-printer)

### ✅ Changes Made

- Rewrote `usePrinter` hook with `useReducer`
- Changed from `print(imageData)` to `printCanvas(canvas, options)`
- Fixed dithering method names:
  - `floydSteinberg` → `steinberg`
  - `ordered` → `bayer`
  - `halftone` → `pattern`
- Added periodic state sync (100ms interval)
- Proper event listener cleanup

### ✨ Features (MVP)

- 384px canvas for MXW01 thermal printers
- Image upload with drag & drop
- 5 dithering algorithms (Floyd-Steinberg, Atkinson, Bayer, Pattern, Threshold)
- Text tool with fonts and styling
- Web Bluetooth printer connection
- Real-time preview
- Neuro Core design system

---

## Version History Summary

- **v1.8** - Smart filters & persistence
- **v1.7** - Properties panel & live editing
- **v1.6** - Interactive canvas with Fabric.js
- **v1.5** - Toast system & layer UX
- **v1.0** - MVP with working printer integration

---

## Roadmap

### v2.0 (Planned)

- [ ] Drawing tools with brushes
- [ ] Shape tools (rectangles, circles)
- [ ] Multiple texture patterns
- [ ] Icons and emojis library
- [ ] Undo/redo system
- [ ] Snap to grid & alignment guides
- [ ] Group selection
- [ ] Copy/paste functionality
- [ ] Template library
- [ ] Export to PNG/PDF

---

Last Updated: November 16, 2025
Current Version: **1.8.0** ✅
