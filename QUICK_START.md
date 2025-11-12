# 🚀 Quick Start Guide

## Installation (3 minutes)

### 1. Install Dependencies
```bash
cd brutal-print
pnpm install
```

### 2. Install Printer Library
```bash
pnpm add mxw01-thermal-printer
```

### 3. Start Dev Server
```bash
pnpm dev
```

### 4. Open in Browser
Navigate to: **http://localhost:4321**

✅ You should see the Thermal Print Studio interface!

---

## First Print (5 minutes)

### Step 1: Upload an Image
1. Click the **Image tool** (📷 icon) in the left toolbar
2. **Drag & drop** an image or click to browse
3. Wait for the image to process

### Step 2: Adjust Dithering
In the sidebar panel:
- **Method**: Try "Floyd-Steinberg" (recommended)
- **Threshold**: Adjust slider to ~128
- **Brightness**: Adjust if image is too dark/light
- **Contrast**: Increase for more dramatic effect

### Step 3: Connect Printer
1. Click **"Connect Printer"** button
2. In the browser dialog, select your MXW01 printer
3. Click **"Pair"**
4. Wait for "Connected" status ✅

### Step 4: Print!
1. Ensure printer shows "Connected" ✅
2. Check battery level is sufficient
3. Click the **"Print"** button
4. Wait for completion message

---

## Adding Text (2 minutes)

### Simple Text
1. Click **Text tool** (T icon) in toolbar
2. Type your text in the textarea
3. Choose font (Inter recommended)
4. Set size (24px is good)
5. Click **"Add Text"**

### Styled Text
- **Bold**: Click B button
- **Italic**: Click I button
- **Align**: Choose left/center/right
- **Position**: Set X/Y coordinates

### Tips
- X: 192 centers text (384px ÷ 2)
- Y: Start at 100 and go down
- Use monospace fonts for retro look
- Try bold for better readability

---

## Dithering Methods

### When to Use Each

#### Floyd-Steinberg (Default)
- **Best for**: Photos, portraits, complex images
- **Effect**: Smooth gradients, natural look
- **Use when**: You want the best overall quality

#### Atkinson
- **Best for**: Comics, illustrations, line art
- **Effect**: Lighter, more artistic
- **Use when**: You want a hand-drawn feel

#### Ordered (Bayer)
- **Best for**: Patterns, textures, backgrounds
- **Effect**: Regular dot pattern
- **Use when**: You want consistent texture

#### Halftone
- **Best for**: Retro prints, newspapers
- **Effect**: Visible dot pattern
- **Use when**: You want vintage look

#### Threshold
- **Best for**: Text, simple graphics, QR codes
- **Effect**: Hard black/white edges
- **Use when**: You need high contrast

---

## Common Issues & Solutions

### Image Too Dark
```
Solution:
1. Increase Brightness slider
2. Lower Threshold value
3. Increase Contrast
4. Try Atkinson dithering
```

### Image Too Light
```
Solution:
1. Decrease Brightness slider
2. Increase Threshold value
3. Try Floyd-Steinberg
4. Check "Invert Colors"
```

### Printer Won't Connect
```
Solution:
1. Turn printer off and on
2. Check battery level
3. Close other apps using printer
4. Use Chrome/Edge browser
5. Try pairing again
```

### Text Not Visible
```
Solution:
1. Make sure text is black
2. Check X/Y position (within 384 × 800)
3. Increase font size
4. Use bold weight
5. Check canvas isn't blank
```

---

## Keyboard Shortcuts (Future)

Coming in v1.5:
- `V` - Select tool
- `I` - Image tool
- `T` - Text tool
- `D` - Draw tool
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+S` - Save project
- `Ctrl+P` - Print

---

## Pro Tips

### Image Preparation
1. **Crop tightly** before uploading
2. **Increase contrast** in photo editor first
3. **Convert to grayscale** for better control
4. **Remove backgrounds** for cleaner prints

### Text Best Practices
1. **Use sans-serif** fonts for clarity
2. **Minimum 12px** size recommended
3. **Bold** text prints better
4. **Leave margins** (20px from edges)
5. **Test print** small text first

### Print Quality
1. **Check battery** before printing
2. **Use good paper** quality
3. **Clean print head** regularly
4. **Test small** before full print
5. **Adjust intensity** if too light/dark

### Performance
1. **Smaller images** process faster
2. **Close other tabs** for best performance
3. **Use Chrome** for best compatibility
4. **Clear cache** if issues persist

---

## Example Projects

### Recipe Card
```
1. Upload food photo
2. Floyd-Steinberg dithering
3. Add recipe name (36px, bold, centered)
4. Add ingredients (14px, left-aligned)
5. Print!
```

### Event Ticket
```
1. Create text layers:
   - Event name (48px, bold, centered)
   - Date/time (24px, centered)
   - Venue (18px, centered)
2. Add QR code image
3. Print multiple copies
```

### Photo Strip
```
1. Upload portrait photo
2. Atkinson dithering for artistic look
3. Adjust threshold for best detail
4. Add name/date text at bottom
5. Print as keepsake
```

---

## Need Help?

- **Documentation**: See [brutal-print.md](./brutal-print.md)
- **Installation**: See [INSTALLATION.md](./INSTALLATION.md)
- **Features**: See [FEATURES.md](./FEATURES.md)
- **GitHub Issues**: Report bugs and request features

---

Ready to print? Let's go! 🖨️⚡

