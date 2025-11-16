# 🚀 Getting Started - Thermal Print Studio

## Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended)
- MXW01 thermal printer (Cat Printer)
- Chrome, Edge, or Opera browser (Web Bluetooth required)
- Bluetooth enabled

---

## Installation (2 minutes)

```bash
# 1. Navigate to project
cd brutal-print

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev
```

Open **http://localhost:4321** in Chrome/Edge/Opera.

---

## First Print (5 minutes)

### 1. Connect Printer

1. Click **"Connect Printer"** button in sidebar
2. Browser shows Bluetooth device picker
3. Select your **MXW01** printer
4. Click **"Pair"**
5. Wait for "Connected" status ✅

**Expected**: Status shows "Connected to [Printer Name]" + battery level

### 2. Upload & Process Image

1. Click **Image tool** (📷 icon) in toolbar
2. Drag & drop an image OR click to browse
3. Wait for processing (~2 seconds)

**Expected**: Image appears on canvas, scaled to 384px width

### 3. Adjust Dithering (Optional)

Try different dithering methods for best results:

| Method              | Best For      | When to Use                |
| ------------------- | ------------- | -------------------------- |
| **Floyd-Steinberg** | Photos        | General use, most natural  |
| **Atkinson**        | Illustrations | Comics, line art           |
| **Bayer**           | Patterns      | Textures, backgrounds      |
| **Pattern**         | Retro look    | Halftone newspaper effect  |
| **Threshold**       | Text/QR       | High contrast, sharp edges |

**Adjust settings**:

- **Brightness**: Increase if too dark (try 140)
- **Contrast**: Increase for more dramatic (try 120)
- **Threshold**: Adjust black/white cutoff (default 128)

### 4. Print!

1. Verify printer is connected (green indicator)
2. Check battery level is sufficient (>20%)
3. Click **"Print"** button
4. Wait for print completion (~10-30 seconds)

**Expected**:

- Printer makes sound
- Paper feeds
- Image appears on thermal paper
- Success notification appears

---

## Add Text (2 minutes)

1. Click **Text tool** (T icon)
2. Enter your text (e.g., "Hello Thermal!")
3. Choose settings:
   - **Font**: Space Grotesk or Inter (recommended)
   - **Size**: 24px or larger for readability
   - **Style**: Bold ON (prints better)
   - **Alignment**: Center
4. Click **"Add Text"**

**Pro tip**: Click text on canvas to edit via Properties Panel

---

## Interactive Canvas

### Move Elements

- Click and drag any element

### Resize

- Click to select → Drag corner handles

### Rotate

- Click to select → Drag rotation handle (circle above)

### Layer Management

- **Click layer** in panel to select on canvas
- **Drag layers** to reorder (changes z-order)
- **Eye icon** to show/hide
- **Lock icon** to prevent editing

---

## Troubleshooting

### Can't Connect to Printer

**Check**:

- Using Chrome, Edge, or Opera (NOT Firefox/Safari)
- Bluetooth is enabled
- Printer is powered on
- Battery is charged (>20%)

**Fix**:

1. Turn printer off/on
2. Refresh browser page
3. Try pairing again
4. Close other apps using printer

### Print is Blank

**Fix**:

```javascript
Settings:
- Dither: steinberg
- Brightness: 140
- Intensity: 100
```

**Also check**:

- Paper loaded correctly (thermal side up)
- Paper isn't expired
- Print head is clean

### Print is Too Dark

**Fix**:

- Decrease intensity (try 80)
- Increase threshold (try 140)
- Try Atkinson dithering

### "Please connect to printer first"

**Fix**:

1. Enable debug: `window.enableThermalDebug()` in browser console
2. Check console logs
3. Refresh page and reconnect

See [DEBUGGING.md](./DEBUGGING.md) for advanced troubleshooting.

---

## Tips for Best Results

### Image Preparation

- Crop tightly before uploading
- High contrast images work best
- Remove backgrounds for cleaner prints
- Smaller files process faster

### Text Best Practices

- **Minimum 14px** size for readability
- **Bold text** prints better
- **Sans-serif fonts** are clearer
- Leave margins (20px from edges)

### Print Quality

- Check battery before printing (>50% recommended)
- Use good quality thermal paper
- Clean print head regularly
- Test with small prints first

### Dithering Guide

**Photos of people**: Floyd-Steinberg
**Logos/graphics**: Threshold
**Artistic effects**: Atkinson
**Vintage look**: Pattern
**Textures**: Bayer

---

## Common Workflows

### Recipe Card

1. Upload food photo
2. Floyd-Steinberg dithering
3. Add title (36px, bold, centered)
4. Add ingredients (14px, left-aligned)
5. Print

### Photo + Caption

1. Upload portrait
2. Atkinson dithering
3. Add name/date at bottom (18px)
4. Print

### QR Code

1. Upload QR code image
2. Threshold dithering (important!)
3. Increase brightness (150)
4. Print

---

## Next Steps

- Explore **Properties Panel** for live editing
- Try **different dithering methods** for effects
- Experiment with **layer ordering**
- Your work **auto-saves** (localStorage)
- Check **CHANGELOG.md** for new features

---

## Need More Help?

- **Technical Details**: [brutal-print.md](./brutal-print.md)
- **Debug Mode**: [DEBUGGING.md](./DEBUGGING.md)
- **Version History**: [CHANGELOG.md](./CHANGELOG.md)

---

**Happy printing!** 🖨️⚡
