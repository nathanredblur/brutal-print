# Thermal Print Studio - Technical Specification

## Overview

A Canva-style web application optimized for designing and printing on MXW01 thermal printers (384px width), featuring a modern Neuro Core aesthetic with blue and purple tones.

---

## ✅ Implemented Features (v1.8)

### Canvas Editor

- 384px width × variable height (400-2000px)
- Real-time 1-bit monochrome preview
- Interactive manipulation via Fabric.js (drag, resize, rotate)
- Auto-save & restore from localStorage
- WYSIWYG rendering

### Layer Management

- Non-destructive editing
- Drag & drop reordering
- Lock/unlock layers
- Show/hide visibility
- Layer selection sync with canvas
- Delete with confirmation dialog

### Image Processing

- **5 Dithering Methods**:
  - Floyd-Steinberg (steinberg) - Photos
  - Atkinson - Illustrations
  - Ordered/Bayer (bayer) - Patterns
  - Halftone (pattern) - Dot effect
  - Threshold - High contrast
- Smart filters (change dithering post-upload)
- Brightness adjustment (0-255)
- Contrast adjustment (0-200)
- Color inversion
- Original image preservation for reprocessing

### Text Tool

- Multi-line text support
- **6 Font Families**:
  - Modern: Inter, Space Grotesk
  - Monospace: Courier New
  - Classic: Arial, Georgia, Times New Roman
- Bold and italic styling
- Alignment (left, center, right)
- Font sizes (8-200px)
- Live editing via Properties Panel

### Properties Panel

- Real-time text editing
- Font customization
- Canvas height adjustment
- Image information display
- Context-aware UI (adapts to layer type)

### Printer Integration

- Web Bluetooth connection (MXW01)
- Battery level monitoring
- Status indicators
- Error handling
- Print with configurable parameters:
  - Dither method
  - Brightness (0-255)
  - Intensity (0-255, default: 93)

### User Experience

- Toast notifications system
- Confirmation dialogs
- Loading states
- Neuro Core design system
- Glassmorphism effects
- Smooth animations

---

## 🔧 Technical Stack

### Framework & Libraries

```typescript
- Astro 4.x          // Web framework
- React 18+          // Interactive components
- TypeScript 5.x     // Type safety
- Fabric.js 6.x      // Interactive canvas
- Tailwind CSS v4    // Styling
```

### Key Dependencies

```bash
mxw01-thermal-printer  # MXW01 printer library
```

### APIs

- Web Bluetooth API (printer connection)
- Canvas API (image rendering)
- LocalStorage API (state persistence)

---

## 📱 Printer Specifications

### MXW01 (Cat Printer)

- **Print Width**: 384 pixels (48 bytes per line)
- **Print Mode**: 1-bit monochrome
- **Encoding**: Left to right, top to bottom
- **Bit Order**: LSB first
- **Minimum Data**: 4320 bytes (90 lines)
- **Connection**: Bluetooth Low Energy
- **Protocol**: Custom BLE with 3 characteristics:
  - `AE01` (Control) - Commands
  - `AE02` (Notify) - Status responses
  - `AE03` (Data) - Image data transfer

### Paper Specifications

- Width: ~58mm thermal paper
- Scale: ~6.8 pixels per millimeter
- Format: Variable length

---

## 🎨 Neuro Core Design System

### Color Palette

- **Primary**: Deep blue (#1E40AF, #3B82F6)
- **Secondary**: Vibrant purple (#7C3AED, #A78BFA)
- **Accent**: Cyan (#06B6D4)
- **Neutral**: Dark slate (#0F172A, #1E293B, #334155)
- **Background**: Near-black with blue tint (#0A0E1A)

### Visual Elements

- Glassmorphism panels with backdrop blur
- Neon glow effects on hover
- Gradient borders
- Smooth transitions (200-300ms)
- Rounded corners (4-8px)

### Typography

- Primary: Inter, Space Grotesk
- Monospace: Courier New
- Variable font weights for hierarchy
- Clear contrast and readability

---

## 📁 Project Structure

```
brutal-print/
├── src/
│   ├── components/
│   │   ├── CanvasManager.tsx       # Main controller
│   │   ├── FabricCanvas.tsx        # Interactive canvas (Fabric.js)
│   │   ├── LayersPanel.tsx         # Layer management UI
│   │   ├── PropertiesPanel.tsx     # Properties editor
│   │   ├── PrinterConnection.tsx   # Bluetooth connection
│   │   ├── ImageUploader.tsx       # Image upload & processing
│   │   ├── TextTool.tsx            # Text editor
│   │   └── ToastContainer.tsx      # Notifications
│   ├── contexts/
│   │   ├── PrinterContext.tsx      # Shared printer state
│   │   └── ToastContext.tsx        # Global toast manager
│   ├── hooks/
│   │   ├── usePrinter.ts           # Printer state management
│   │   ├── useLayers.ts            # Layer state management
│   │   ├── useToast.ts             # Toast notifications
│   │   └── useCanvasPersistence.ts # LocalStorage sync
│   ├── lib/
│   │   ├── dithering/
│   │   │   ├── algorithms.ts       # 5 dithering algorithms
│   │   │   ├── imageProcessing.ts  # Image utilities
│   │   │   └── types.ts            # Type definitions
│   │   ├── canvas/
│   │   │   └── canvasHelpers.ts    # Canvas utilities
│   │   └── logger.ts               # Debug logging system
│   ├── utils/
│   │   ├── canvasRenderer.ts       # Layer rendering
│   │   └── imageReprocessor.ts     # Smart filter reprocessing
│   ├── types/
│   │   ├── layer.ts                # Layer type definitions
│   │   └── toast.ts                # Toast type definitions
│   └── styles/
│       └── global.css              # Neuro Core design system
├── public/
└── docs/                           # Documentation
```

---

## 🔄 Data Flow

### Printer Connection

```
User clicks Connect → Web Bluetooth API → Select MXW01
→ ThermalPrinterClient.connect() → Event: 'connected'
→ PrinterContext updates → Components receive state
→ UI shows "Connected" + battery level
```

### Image Processing

```
User uploads image → ImageUploader processes
→ Apply dithering algorithm → Convert to 1-bit
→ Store original as base64 → Create ImageLayer
→ useLayers.addImageLayer() → Render to canvas
→ Auto-save to localStorage
```

### Interactive Canvas

```
User drags element → Fabric.js fires 'modified' event
→ FabricCanvas updates layer position
→ useLayers.updateLayer() → State updated
→ LayersPanel reflects changes
→ Auto-save triggered
```

### Printing

```
User clicks Print → CanvasManager.handlePrint()
→ Check isConnected → Export Fabric canvas
→ usePrinter.printCanvas(canvas, options)
→ ThermalPrinterClient.print() → Send to printer
→ Show toast notification
```

---

## 🗺️ Roadmap

### Completed

- ✅ v1.0 - MVP with printer integration
- ✅ v1.5 - Layer management & toast system
- ✅ v1.6 - Interactive canvas (Fabric.js)
- ✅ v1.7 - Properties Panel & live editing
- ✅ v1.8 - Smart filters & persistence

### Planned v2.0

- [ ] Drawing tools with brushes
- [ ] Shape tools (rectangles, circles, lines)
- [ ] Icons and emojis library
- [ ] Undo/redo system
- [ ] Snap to grid & alignment guides
- [ ] Group selection & multi-select
- [ ] Copy/paste functionality
- [ ] Template library
- [ ] Export to PNG/PDF
- [ ] Multiple texture patterns
- [ ] Procedural texture generation
- [ ] Advanced image filters
- [ ] Batch processing

---

## 🔍 Browser Compatibility

### Supported

- ✅ Chrome/Chromium 56+
- ✅ Microsoft Edge 79+
- ✅ Opera 43+
- ✅ Chrome for Android

### Not Supported

- ❌ Firefox (no Web Bluetooth API)
- ❌ Safari (no Web Bluetooth API as of 2024)

**Note**: Web Bluetooth API is required for printer connection.

---

## 📊 Performance Characteristics

### Rendering

- 60fps canvas manipulation (Fabric.js hardware acceleration)
- Efficient layer rendering (only modified objects)
- Real-time dithering preview

### Memory

- LocalStorage state: ~50KB per saved canvas
- Fabric.js overhead: ~200KB
- Efficient image storage (base64)

### Network

- Zero network calls (fully offline-capable)
- Web Bluetooth only for printer communication

---

## 🎯 Design Principles

1. **WYSIWYG** - What you see is what you print
2. **Non-destructive** - All edits are reversible
3. **Real-time feedback** - Instant visual updates
4. **Professional UX** - Canva-like experience
5. **Thermal-optimized** - 1-bit preview at all times
6. **Auto-save** - Never lose work
7. **Type-safe** - TypeScript throughout

---

**Version**: 1.8.0  
**Last Updated**: November 16, 2025

This specification reflects the **current implementation** of Thermal Print Studio.
For future features, see the Roadmap section.
