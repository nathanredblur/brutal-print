# ⚡ Thermal Print Studio

A modern, Canva-style web application for designing and printing on MXW01 thermal printers, featuring a beautiful Neuro Core aesthetic with blue and purple tones.

![Neuro Core Design](https://img.shields.io/badge/Design-Neuro_Core-A78BFA?style=for-the-badge)
![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?style=for-the-badge&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)

## 🎯 Overview

Thermal Print Studio is an enhanced version of [catprinter](https://github.com/dropalltables/catprinter) with a modern UI, advanced layer management, and professional design tools optimized for 384px wide thermal printers (MXW01 model).

## ✨ Features

- 🎨 **Modern Neuro Core UI** - Beautiful glassmorphism interface with blue/purple gradients
- 📐 **384px Canvas** - Optimized for MXW01 thermal printer width
- 🖼️ **Layer Management** - Non-destructive editing with visibility and lock controls
- 🎭 **Advanced Dithering** - Floyd-Steinberg, Atkinson, Ordered, Halftone, and more
- ⚡ **WYSIWYG Canvas** - What You See Is What You Get - 1-bit preview in real-time
- 🔌 **Web Bluetooth** - Connect directly to MXW01 printers via BLE
- 🎯 **Zoom & Pan** - Smooth navigation with 10%-500% zoom
- 🎨 **Image Processing** - Brightness, contrast, invert, and texture overlays

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended)
- A Bluetooth-enabled device
- MXW01 thermal printer (Cat Printer compatible)
- **Chrome/Edge/Opera browser** (Web Bluetooth required)

### Installation

```bash
cd brutal-print
pnpm install
pnpm dev
```

Then open **http://localhost:4321** in Chrome/Edge/Opera.

### First Print

1. Click **"Connect Printer"** in the sidebar
2. Select your MXW01 printer from Bluetooth dialog
3. Click **Image tool** (📷) and upload a photo
4. Adjust dithering settings if needed
5. Click **"Print"** button
6. Done! 🎉

For detailed instructions, see **[QUICK_START.md](./QUICK_START.md)**.

### 🔧 Debugging

If you encounter issues (like "Please connect to printer first"), enable debug mode:

```javascript
// In browser console
window.enableThermalDebug()
```

Then check the console for detailed logs. See **[DEBUG_GUIDE.md](./DEBUG_GUIDE.md)** for full instructions.

### Browser Compatibility

Web Bluetooth API is required for printer connection:

✅ Chrome/Edge 56+
✅ Opera 43+  
✅ Chrome for Android  
❌ Firefox (not supported)  
❌ Safari (not supported as of 2024)

## 📱 Thermal Printer Specs

- **Model**: MXW01 (Cat Printer)
- **Print Width**: 384 pixels (48 bytes per line)
- **Print Mode**: 1-bit monochrome (black/white only)
- **Minimum Data**: 4320 bytes (90 lines)
- **Connection**: Bluetooth Low Energy (BLE)
- **Paper Width**: ~58mm (~384px at 6.8px/mm)

## 🎨 Design System

The Neuro Core design system features:

- **Primary**: Deep blue (#1E40AF, #3B82F6)
- **Secondary**: Vibrant purple (#7C3AED, #A78BFA)
- **Accent**: Cyan (#06B6D4)
- **Background**: Near-black with blue tint (#0A0E1A)
- **Typography**: Inter, Space Grotesk
- **Effects**: Glassmorphism, neon glows, smooth transitions

## 🛠️ Project Structure

```
brutal-print/
├── src/
│   ├── components/
│   │   ├── Canvas.astro           # Main canvas editor
│   │   ├── Toolbar.astro          # Tool selection
│   │   ├── LayerPanel.astro       # Layer management
│   │   └── PropertiesPanel.astro  # Properties editor
│   ├── lib/
│   │   └── dithering/
│   │       ├── types.ts           # Type definitions
│   │       ├── algorithms.ts      # Dithering algorithms
│   │       ├── imageProcessing.ts # Image utilities
│   │       └── index.ts           # Main exports
│   ├── styles/
│   │   └── global.css             # Neuro Core design system
│   └── pages/
│       └── index.astro            # Main application
├── public/
├── brutal-print.md                # Detailed specification
└── README.md                      # This file
```

## 📚 Dithering Methods

| Method              | Official Name | Best For              | Description                      |
| ------------------- | ------------- | --------------------- | -------------------------------- |
| Floyd-Steinberg     | `steinberg`   | Photos, general use   | Error diffusion (recommended)    |
| Atkinson            | `atkinson`    | Comics, illustrations | Lighter error diffusion          |
| Ordered (Bayer)     | `bayer`       | Patterns, textures    | Ordered dithering                |
| Halftone/Pattern    | `pattern`     | Special effects       | Dot pattern effect               |
| Threshold           | `threshold`   | Text, simple graphics | Basic black/white conversion     |

> **Note**: Method names follow the [mxw01-thermal-printer](https://github.com/clementvp/mxw01-thermal-printer) official API.

## 🔧 Technologies Used

- **[Astro 4.x](https://astro.build/)** - Web framework
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type safety
- **[React 18+](https://react.dev/)** - Interactive components
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[mxw01-thermal-printer](https://github.com/clementvp/mxw01-thermal-printer)** - Printer library
- **Web Bluetooth API** - Printer connection

## 📖 Documentation

- **[brutal-print.md](./brutal-print.md)** - Complete specification and architecture
- **[PRINTING_FIX.md](./PRINTING_FIX.md)** - ⚡ How we fixed the printing issue
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide for users
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Complete testing checklist
- **[FEATURES.md](./FEATURES.md)** - Implemented features overview
- **[DEBUG_GUIDE.md](./DEBUG_GUIDE.md)** - 🔧 Sistema de debugging con logs
- **[LOGGER_API.md](./LOGGER_API.md)** - 📘 Logger API reference
- **[LOGGER_FIXES.md](./LOGGER_FIXES.md)** - 🐛 Fixes de SSR y ruido de logs
- **[STATE_SYNC_FIX.md](./STATE_SYNC_FIX.md)** - 🔧 **FIX FINAL**: Solución al bug de estado duplicado
- **[TOAST_SYSTEM.md](./TOAST_SYSTEM.md)** - 🎉 Sistema de notificaciones Toast
- **[DRAG_DROP_LAYERS.md](./DRAG_DROP_LAYERS.md)** - ↕️ Drag & drop para reordenar capas

## 🎯 Roadmap

### MVP (v1.0) ✅ **COMPLETED**
- [x] Canvas with 384px width
- [x] Neuro Core design system
- [x] Dithering algorithms (Floyd-Steinberg, Atkinson, Bayer, Pattern)
- [x] **Printer connection via mxw01-thermal-printer** ✅
- [x] **Image import and processing** ✅
- [x] **Basic text tool** ✅
- [x] **Print functionality** ✅ (Fixed with official API patterns)

### v1.5 ✅ **COMPLETED**
- [x] **Layer management system** ✅ (Non-destructive editing)
- [x] **WYSIWYG 1-bit canvas** ✅ (Dithering applied in real-time)
- [x] **Success/error popups** ✅ (Beautiful toast notifications with Neuro Core styling)
- [x] **Drag & drop layer reordering** ✅ (Reorganize layers by dragging)
- [x] **Delete confirmation dialog** ✅ (In-app modal for destructive actions)
- [x] **Subtle UI feedback** ✅ (No toast spam, visual layer feedback)

### v2.0 (Planned)
- [ ] Drag & drop to reposition layers on canvas
- [ ] Drawing tool with brushes
- [ ] Multiple texture patterns
- [ ] Icons and emojis library
- [ ] Advanced transformations (rotate, scale)
- [ ] Save/load projects (JSON)
- [ ] Procedural texture generation
- [ ] Retro presets (80s receipt, punk fanzines)
- [ ] Experimental glitch effects
- [ ] Template library
- [ ] Export to PNG/PDF

## 🙏 Credits

- **Protocol Research**: Based on [jeremy46231/catprinter](https://github.com/jeremy46231/catprinter)
- **Original Project**: Inspired by [dropalltables/catprinter](https://github.com/dropalltables/catprinter)
- **Printer Library**: [mxw01-thermal-printer](https://github.com/clementvp/mxw01-thermal-printer) by Clément Van Peuter

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! This is an experimental project in a monorepo. Feel free to open issues or submit pull requests.

---

Made with ⚡ and 💜 in the mono-experiments monorepo
