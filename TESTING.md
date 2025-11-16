# 🧪 Testing Guide

## Prerequisites

- [ ] Dev server running (`pnpm dev`)
- [ ] Chrome, Edge, or Opera
- [ ] Bluetooth enabled
- [ ] MXW01 printer on (>50% battery)

---

## Essential Tests

### 1. Printer Connection

1. Open http://localhost:4321
2. Click "Connect Printer"
3. Select MXW01 → Pair

**Expected**: Status "Connected" + battery level shown

### 2. Upload Image

1. Click Image tool (📷)
2. Upload photo

**Expected**: Image on canvas, scaled to 384px

### 3. Interactive Canvas

1. Click image to select
2. Drag to move
3. Drag corner to resize
4. Drag rotation handle

**Expected**: Smooth manipulation, no lag

### 4. Print

1. Create design (image + text)
2. Click "Print"

**Expected**: Printer feeds paper, output matches canvas

### 5. Persistence

1. Add elements
2. Refresh page

**Expected**: Everything restored

---

## Print Quality Tests

### Photos
```javascript
{ dither: 'steinberg', brightness: 140, intensity: 100 }
```

### Text
```javascript
{ dither: 'threshold', brightness: 128, intensity: 110 }
```

### Illustrations
```javascript
{ dither: 'atkinson', brightness: 135, intensity: 105 }
```

---

## Edge Cases

- Large image (4000×3000px) → Should scale correctly
- Small image (100×100px) → Should scale up
- Empty canvas → Should handle gracefully
- Low battery → Should show warning

---

## Common Issues

### "Please connect to printer first"
```javascript
// In console:
window.enableThermalDebug()
// Check logs, then see DEBUGGING.md
```

### Print blank
- Check paper (thermal side up)
- Increase brightness (140+)
- Try threshold dithering

### Print too dark
- Decrease intensity
- Increase threshold

---

## Browser Compatibility

- ✅ Chrome/Edge/Opera
- ❌ Firefox/Safari (no Web Bluetooth)

---

## Sign-Off

- [ ] Connection works
- [ ] Upload works
- [ ] Canvas interactions smooth
- [ ] Print output correct
- [ ] Persistence works
- [ ] No critical bugs

---

For detailed debugging: **[DEBUGGING.md](./DEBUGGING.md)**
