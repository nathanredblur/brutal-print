# ⚡ Thermal Print Studio

A modern web application for designing and printing on MXW01 thermal printers. Drag, resize, and rotate elements like Canva, then print directly via Bluetooth.

![Neuro Core Design](https://img.shields.io/badge/Design-Neuro_Core-A78BFA?style=for-the-badge)
![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?style=for-the-badge&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)

## 🚀 Quick Start

```bash
cd brutal-print
pnpm install
pnpm dev
```

Open **http://localhost:4321** in Chrome/Edge/Opera.

### First Print (30 seconds)

1. **Connect Printer** → Select MXW01
2. **Upload Image** (📷) → Choose photo
3. **Adjust Dithering** → Try Floyd-Steinberg
4. **Print** 🎉

For detailed setup, see **[GETTING_STARTED.md](./GETTING_STARTED.md)**.

---

## ✨ Key Features

### Interactive Canvas (Canva-like)

- **Drag to move** - Click and drag any element
- **Resize** - Corner handles for scaling
- **Rotate** - Rotation handle for any angle
- **Live editing** - Change text, fonts, sizes in real-time

### Image Processing

- **5 Dithering Methods**: Floyd-Steinberg, Atkinson, Bayer, Pattern, Threshold
- **Smart Filters**: Change dithering after upload without re-uploading
- **Adjustments**: Brightness, contrast, inversion

### Professional Tools

- **Layer Management**: Non-destructive editing, drag to reorder
- **Properties Panel**: Edit text, fonts, canvas height on the fly
- **Auto-Save**: Never lose your work (localStorage)
- **Web Bluetooth**: Direct connection to MXW01 printers

### Design System

- **Neuro Core**: Blue/purple aesthetic with glassmorphism
- **WYSIWYG**: What you see is what you print (1-bit preview)
- **384px Canvas**: Optimized for thermal printer width

---

## 📱 Printer Compatibility

- **Model**: MXW01 (Cat Printer)
- **Connection**: Bluetooth Low Energy
- **Browsers**: Chrome, Edge, Opera (Web Bluetooth required)
- ❌ Firefox/Safari not supported (no Web Bluetooth API)

---

## 🎨 What You Can Do

### Design

- Upload images (JPG, PNG, SVG)
- Add and style text (6 fonts, bold, italic)
- Drag, resize, rotate elements
- Multiple layers with show/hide/lock
- Adjust canvas height (400-2000px)

### Print

- 5 dithering algorithms for different effects
- Adjust brightness and contrast
- Battery level monitoring
- Real-time print status

---

## 📖 Documentation

**Getting Started**

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup & first use guide

**Technical**

- **[brutal-print.md](./brutal-print.md)** - Architecture & technical specification
- **[COLOR_SYSTEM.md](./COLOR_SYSTEM.md)** - Neuro Core color system & Tailwind usage guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history (v1.0 - v1.8)
- **[DEBUGGING.md](./DEBUGGING.md)** - Debug mode & troubleshooting
- **[TESTING.md](./TESTING.md)** - Testing guide

---

## 🐛 Common Issues

### Printer won't connect

- Use Chrome/Edge/Opera (not Firefox/Safari)
- Enable Bluetooth
- Check battery level

### Print is blank

```javascript
// Try these settings:
{
  dither: 'steinberg',
  brightness: 140,
  intensity: 100
}
```

See [DEBUGGING.md](./DEBUGGING.md) for detailed troubleshooting.

---

## 🎯 Current Version: 1.8.0

### Recent Updates

- ✅ Smart image filters (v1.8)
- ✅ Canvas persistence & auto-save (v1.8)
- ✅ Properties panel with live editing (v1.7)
- ✅ Interactive canvas with Fabric.js (v1.6)
- ✅ Layer management system (v1.5)

### Roadmap v2.0

- [ ] Drawing tools
- [ ] Shape tools
- [ ] Icons library
- [ ] Undo/redo
- [ ] Templates
- [ ] Export to PNG/PDF

See [CHANGELOG.md](./CHANGELOG.md) for complete history.

---

## 🔧 Tech Stack

- **Astro 4.x** + **React 18** + **TypeScript 5**
- **Fabric.js** (interactive canvas)
- **Tailwind CSS v4** (styling)
- **shadcn/ui** (component library)
- **Lucide Icons** (icon system)
- **mxw01-thermal-printer** (printer library)

### Component Installation

To add new UI components:

```bash
pnpm dlx shadcn@latest add button
```

**Resources**:
- [shadcn Components](https://ui.shadcn.com/docs/components) - Available UI components
- [Lucide Icons](https://www.shadcn.io/icons/lucide) - Icon library (1,636 icons)

---

## 🙏 Credits

- **Protocol**: [jeremy46231/catprinter](https://github.com/jeremy46231/catprinter)
- **Inspiration**: [dropalltables/catprinter](https://github.com/dropalltables/catprinter)
- **Library**: [mxw01-thermal-printer](https://github.com/clementvp/mxw01-thermal-printer)

## 📄 License

MIT

---

Made with ⚡ and 💜 | Version 1.8.0 | November 16, 2025
