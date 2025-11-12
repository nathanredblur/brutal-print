# Installation Guide - Thermal Print Studio

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** or **Bun**
- **pnpm** (recommended package manager)
- A **Bluetooth-enabled device** (for printer connection)
- **MXW01 thermal printer** (Cat Printer compatible)

## Browser Requirements

The application requires **Web Bluetooth API** support:

✅ **Supported:**
- Chrome/Chromium 56+
- Microsoft Edge 79+
- Opera 43+
- Chrome for Android

❌ **Not Supported:**
- Firefox (no Web Bluetooth support)
- Safari (no Web Bluetooth support as of 2024)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd /Users/nathanredblur/my-projects/mono-experiments/brutal-print
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Install Thermal Printer Library

**IMPORTANT:** This step must be done manually:

```bash
pnpm add mxw01-thermal-printer
```

This library provides:
- MXW01 printer protocol implementation
- Web Bluetooth adapter
- Print queue management
- Status monitoring

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:4321**

## Verifying Installation

After starting the dev server, you should see:

1. ⚡ **Thermal Print Studio** header
2. **Three-column layout**: Toolbar | Canvas | Sidebar
3. **Canvas** showing 384px × 800px white area
4. **Printer connection panel** in the sidebar

## Troubleshooting

### Issue: `mxw01-thermal-printer` not found

**Solution:**
```bash
# Make sure you're in the correct directory
cd brutal-print

# Install the library
pnpm add mxw01-thermal-printer
```

### Issue: Web Bluetooth not available

**Error:** "Web Bluetooth API is not available in this browser"

**Solutions:**
- Use Chrome, Edge, or Opera browser
- Ensure you're on HTTPS or localhost
- Check browser flags: `chrome://flags/#enable-web-bluetooth`

### Issue: Cannot connect to printer

**Solutions:**
1. Ensure printer is powered on and in pairing mode
2. Check Bluetooth is enabled on your device
3. Try forgetting and re-pairing the device
4. Make sure no other app is connected to the printer

### Issue: Port already in use

**Error:** "Port 4321 is already in use"

**Solution:**
```bash
# Kill the process using the port
lsof -ti:4321 | xargs kill -9

# Or use a different port
pnpm dev -- --port 3000
```

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm astro check
```

## Project Structure After Installation

```
brutal-print/
├── node_modules/
│   └── mxw01-thermal-printer/    ← Installed library
├── src/
│   ├── components/
│   │   ├── CanvasManager.tsx     ← Main React component
│   │   ├── ImageUploader.tsx     ← Image processing
│   │   └── PrinterConnection.tsx ← Bluetooth connection
│   ├── hooks/
│   │   └── usePrinter.ts         ← Printer hook
│   ├── lib/
│   │   ├── dithering/            ← Dithering algorithms
│   │   └── canvas/               ← Canvas utilities
│   └── pages/
│       └── index.astro           ← Main page
├── package.json
└── pnpm-lock.yaml
```

## Next Steps

After successful installation:

1. **Connect Printer:**
   - Click "Connect Printer" button in sidebar
   - Select your MXW01 printer from the list
   - Wait for connection confirmation

2. **Upload Image:**
   - Click the Image tool (📷 icon)
   - Drag & drop or select an image
   - Adjust dithering settings
   - Preview the 1-bit conversion

3. **Print:**
   - Ensure printer is connected
   - Click "Print" button
   - Wait for print completion

## Additional Resources

- **Documentation:** [brutal-print.md](./brutal-print.md)
- **mxw01-thermal-printer docs:** https://github.com/clementvp/mxw01-thermal-printer
- **Protocol specification:** https://github.com/jeremy46231/catprinter

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review the [catprinter documentation](https://github.com/dropalltables/catprinter)
3. Check browser console for error messages

---

Happy printing! 🖨️⚡

