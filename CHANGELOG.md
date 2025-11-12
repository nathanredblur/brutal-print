# 📝 Changelog - Thermal Print Studio

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2024-11-12 ✅ **PRINTING FIX**

### 🐛 Fixed - Critical Printing Issue

**Problem**: Printer was connecting successfully but not printing anything.

**Root Cause**: Implementation didn't follow the [official mxw01-thermal-printer patterns](https://github.com/clementvp/mxw01-thermal-printer/blob/main/examples/react-hook.tsx).

**Solution**: Complete rewrite of printer integration following official documentation.

### ✅ Changes Made

#### 1. Printer Hook (`src/hooks/usePrinter.ts`)
- ✅ Rewrote to use `useReducer` instead of multiple `useState` hooks
- ✅ Single `useEffect` for initialization
- ✅ Added periodic state sync (100ms interval)
- ✅ Proper event listener cleanup
- ✅ Changed API from `print(imageData)` to `printCanvas(canvas, options)`
- ✅ Renamed `connect()` to `connectPrinter()` to match official API

#### 2. Dithering Methods (`src/lib/dithering/`)
- ✅ Updated to use official method names:
  - `floydSteinberg` → `steinberg` (Floyd-Steinberg)
  - `ordered` → `bayer` (Ordered/Bayer)
  - `halftone` → `pattern` (Halftone/Pattern)
- ✅ Added type mappings for backwards compatibility
- ✅ Updated all references throughout codebase

#### 3. Canvas Manager (`src/components/CanvasManager.tsx`)
- ✅ Removed unnecessary `currentImageData` state
- ✅ Pass canvas directly to `printCanvas()` instead of ImageData
- ✅ Updated print options with correct dithering method names
- ✅ Improved error handling

#### 4. Printer Connection UI (`src/components/PrinterConnection.tsx`)
- ✅ Updated to use new hook API (`connectPrinter` vs `connect`)
- ✅ Get battery level from `printerState` object
- ✅ Simplified status message display

#### 5. Image Uploader (`src/components/ImageUploader.tsx`)
- ✅ Default to `'steinberg'` dithering method
- ✅ Updated UI options with correct method names
- ✅ Maintained user-friendly labels

### 📚 New Documentation

- ✅ **PRINTING_FIX.md** - Detailed explanation of fixes and troubleshooting
- ✅ **TESTING_CHECKLIST.md** - Complete testing guide with 10 test scenarios
- ✅ **CHANGELOG.md** - This file

### 🔧 Technical Details

**Before**:
```typescript
const { print, connect } = usePrinter();
await print(imageData); // ❌ Wrong API
```

**After**:
```typescript
const { printCanvas, connectPrinter } = usePrinter();
await printCanvas(canvas, {
  dither: 'steinberg',
  brightness: 128,
  intensity: 93,
}); // ✅ Correct API
```

### ✅ Verification

- [x] Printer connects successfully
- [x] Battery level displays
- [x] Image uploads and processes
- [x] Text tool works
- [x] **Printing works!** 🎉
- [x] Multiple prints succeed
- [x] No memory leaks
- [x] Error handling works

### 📖 References

- [Official React Hook Example](https://github.com/clementvp/mxw01-thermal-printer/blob/main/examples/react-hook.tsx)
- [mxw01-thermal-printer Library](https://github.com/clementvp/mxw01-thermal-printer)

---

## [0.9.0] - 2024-11-11 - Initial MVP

### ✨ Features Added

- ✅ Astro + React + TypeScript setup
- ✅ Neuro Core design system
  - Glassmorphism panels
  - Neon glow effects
  - Blue/purple color palette
  - Modern sans-serif typography
- ✅ Canvas Manager component
- ✅ Image uploader with drag & drop
- ✅ Text tool with styling options
- ✅ Dithering algorithms:
  - Floyd-Steinberg
  - Atkinson
  - Ordered/Bayer
  - Halftone/Pattern
  - Threshold
- ✅ Image processing:
  - Brightness adjustment
  - Contrast adjustment
  - Color inversion
  - Auto-scaling to 384px
- ✅ Real-time preview
- ✅ Web Bluetooth integration (partial)

### 🛠️ Technical Stack

- Astro 4.x
- React 18+
- TypeScript 5.x
- Tailwind CSS v4
- mxw01-thermal-printer

### 🐛 Known Issues (Fixed in v1.0.0)

- ❌ Printer connects but doesn't print → ✅ Fixed in v1.0.0

---

## [0.1.0] - 2024-11-10 - Project Setup

### 🎯 Initial Setup

- ✅ Created project structure
- ✅ Defined Neuro Core aesthetic
- ✅ Wrote project specification (`brutal-print.md`)
- ✅ Set up monorepo cursor rules
- ✅ Documented MXW01 printer specifications

### 📝 Documentation

- brutal-print.md - Complete specification
- .cursorrules - Monorepo best practices
- README.md - Project overview

---

## Future Releases

### [1.5.0] - Planned

**Layer Management**:
- [ ] Drag & drop layers
- [ ] Layer visibility toggle
- [ ] Layer lock/unlock
- [ ] Layer reordering

**Drawing Tools**:
- [ ] Brush tool with variable size
- [ ] Eraser tool
- [ ] Shape tools (rectangle, circle, line)

**Assets**:
- [ ] Icon library
- [ ] Emoji picker
- [ ] Texture patterns

**Transforms**:
- [ ] Rotate elements
- [ ] Scale elements
- [ ] Flip horizontal/vertical

**Project Management**:
- [ ] Save project as JSON
- [ ] Load project from JSON
- [ ] Export as PNG/PDF

### [2.0.0] - Future

**Advanced Features**:
- [ ] Procedural texture generation
- [ ] Retro presets (80s receipt, punk fanzines)
- [ ] Glitch effects
- [ ] Template library
- [ ] Multi-language support
- [ ] Keyboard shortcuts

**Optimizations**:
- [ ] WebAssembly for dithering (performance)
- [ ] Web Worker for image processing
- [ ] IndexedDB for project storage
- [ ] PWA support (offline mode)

---

## Version Naming

- **Major (X.0.0)**: Breaking changes or major features
- **Minor (0.X.0)**: New features, backwards compatible
- **Patch (0.0.X)**: Bug fixes and small improvements

---

## Links

- **Repository**: mono-experiments/brutal-print
- **Issue Tracker**: GitHub Issues
- **Documentation**: [/brutal-print/docs/](./PRINTING_FIX.md)

---

Last Updated: November 12, 2024
Current Version: **1.0.0** ✅

