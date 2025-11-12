# 🧪 Testing Interactive Canvas

## Test Checklist

Use this checklist to verify that all interactive features are working correctly.

## Environment Setup

1. **Start Development Server**
   ```bash
   cd brutal-print
   pnpm dev
   ```

2. **Open Browser**
   - Navigate to `http://localhost:4321`
   - Open browser DevTools (F12) to monitor console logs

## Test Cases

### ✅ Test 1: Image Upload & Selection

**Steps:**
1. Click the **Image tool** (second icon in toolbar)
2. Upload any image file
3. Wait for image to appear on canvas
4. Click on the image

**Expected Results:**
- ✅ Image appears on canvas after upload
- ✅ Selection handles appear when clicked
- ✅ Blue corner handles visible for resizing
- ✅ Rotation handle appears above image
- ✅ Layer appears in Layer Panel
- ✅ Layer is selected in Layer Panel (highlighted)

**Console Check:**
- Look for: `[INFO] CanvasManager: Image added as layer`
- Look for: `[DEBUG] FabricCanvas: Created object`

---

### ✅ Test 2: Drag to Move

**Steps:**
1. Add an image to canvas (see Test 1)
2. Click and hold on the image
3. Drag to a new position
4. Release mouse

**Expected Results:**
- ✅ Image follows mouse cursor smoothly
- ✅ Image position updates in real-time
- ✅ Layer properties update (x, y coordinates)
- ✅ No lag or jitter during drag

**Console Check:**
- Look for: `[DEBUG] FabricCanvas: Object modified`
- Look for: `[DEBUG] useLayers: Layer updated`

---

### ✅ Test 3: Resize with Handles

**Steps:**
1. Add an image to canvas
2. Click to select the image
3. Drag a corner handle outward
4. Release mouse

**Expected Results:**
- ✅ Image scales proportionally
- ✅ Corner handles remain at corners
- ✅ Width and height update
- ✅ Image quality maintained (no pixelation at smaller sizes)

**Additional Test:**
- Resize to very small size (test minimum)
- Resize to very large size (test maximum/canvas boundaries)

---

### ✅ Test 4: Rotation

**Steps:**
1. Add an image to canvas
2. Click to select
3. Hover over rotation handle (circular icon above image)
4. Click and drag rotation handle in a circular motion
5. Release mouse

**Expected Results:**
- ✅ Image rotates smoothly
- ✅ Rotation follows mouse cursor
- ✅ Rotation angle updates
- ✅ Image rotates around its center point
- ✅ Selection box rotates with image

---

### ✅ Test 5: Text Addition & Manipulation

**Steps:**
1. Click the **Text tool** (third icon in toolbar)
2. Enter text: "Test Text"
3. Configure font size to 32px
4. Click "Add Text"
5. Click on the text to select
6. Drag to move
7. Resize using handles
8. Rotate using rotation handle

**Expected Results:**
- ✅ Text appears on canvas
- ✅ Text is selectable
- ✅ Text can be dragged
- ✅ Text can be resized
- ✅ Text can be rotated
- ✅ Text layer appears in Layer Panel
- ✅ Font properties are correctly applied

---

### ✅ Test 6: Layer Panel Integration

**Steps:**
1. Add 2 images to canvas
2. Add 1 text element
3. Click on Layer 1 in Layer Panel
4. Click on Layer 2 in Layer Panel
5. Toggle visibility (eye icon) on Layer 2
6. Lock Layer 1 (lock icon)
7. Try to select locked layer on canvas

**Expected Results:**
- ✅ Clicking layer in panel selects it on canvas
- ✅ Selection handles appear on clicked layer
- ✅ Toggling visibility hides/shows element on canvas
- ✅ Locked layer cannot be selected or moved on canvas
- ✅ Layer order matches visual stacking on canvas

---

### ✅ Test 7: Multi-Element Interaction

**Steps:**
1. Add 3 different elements (2 images, 1 text)
2. Select first element
3. Move it
4. Select second element (first should deselect)
5. Overlap elements partially
6. Click on overlapping area

**Expected Results:**
- ✅ Only one element selected at a time
- ✅ Previous selection clears when new element selected
- ✅ Click on overlap selects top element (z-index works)
- ✅ All elements can be manipulated independently

---

### ✅ Test 8: Layer Reordering

**Steps:**
1. Add 3 elements to canvas
2. In Layer Panel, drag bottom layer to top
3. Observe canvas
4. Click on overlapping area

**Expected Results:**
- ✅ Visual stacking order changes on canvas
- ✅ Previously bottom element now appears on top
- ✅ Click selects correct element based on new order
- ✅ Z-index is correctly updated

---

### ✅ Test 9: Delete Layer

**Steps:**
1. Add an image to canvas
2. Select the image
3. Click delete button in Layer Panel

**Expected Results:**
- ✅ Image disappears from canvas immediately
- ✅ Layer removed from Layer Panel
- ✅ No selection handles remain
- ✅ Canvas updates correctly

---

### ✅ Test 10: Canvas Export & Print

**Steps:**
1. Add 2-3 elements with different positions, sizes, rotations
2. Connect to thermal printer (or skip if not available)
3. Click "Print" button
4. Check console logs

**Expected Results:**
- ✅ Canvas exports to HTML canvas element
- ✅ All transformations preserved in export
- ✅ Export canvas dimensions match original (384x800)
- ✅ Print process initiates (if printer connected)
- ✅ No errors in console

**Console Check:**
- Look for: `[DEBUG] CanvasManager: Canvas exported from Fabric.js`
- Look for: `[INFO] CanvasManager: Calling printCanvas()`

---

### ✅ Test 11: Edge Cases

**Test 11.1: Empty Canvas**
- Start with no elements
- Canvas should be blank (white)
- No errors in console

**Test 11.2: Single Element**
- Add one element
- All interactions should work normally

**Test 11.3: Many Elements**
- Add 10+ elements
- Performance should remain smooth
- All interactions should work
- Layer Panel should scroll if needed

**Test 11.4: Extreme Positions**
- Drag element to edge of canvas
- Drag element outside canvas bounds (should be constrained or allowed based on implementation)

**Test 11.5: Extreme Sizes**
- Resize element to very small (1-10px)
- Resize element to very large (filling canvas)
- Should remain functional

**Test 11.6: Extreme Rotations**
- Rotate element 360° (full circle)
- Rotate element to 45°, 90°, 180°, 270°
- All angles should work correctly

---

### ✅ Test 12: Undo System (Future Feature)

*Not implemented yet - placeholder for future testing*

---

## Performance Tests

### Frame Rate Test

1. Add 20 elements to canvas
2. Select and drag an element rapidly
3. Monitor browser DevTools Performance tab

**Expected:**
- ✅ No dropped frames
- ✅ Smooth 60fps animation
- ✅ CPU usage reasonable (<50% for simple operations)

### Memory Test

1. Add elements
2. Delete elements
3. Repeat 10 times
4. Monitor browser Memory tab

**Expected:**
- ✅ No memory leaks
- ✅ Memory usage stable after garbage collection
- ✅ Old objects properly disposed

---

## Browser Compatibility Tests

Test on these browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Expected:**
- ✅ All features work across browsers
- ✅ No visual glitches
- ✅ Performance is acceptable

---

## Accessibility Tests

- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Test color contrast
- [ ] Test focus indicators

---

## Known Issues / Limitations

Document any issues discovered during testing:

1. **Issue:** [Description]
   - **Severity:** Low/Medium/High/Critical
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Workaround:** [If any]

---

## Test Summary

| Category | Pass | Fail | Skip | Notes |
|----------|------|------|------|-------|
| Basic Selection | ☐ | ☐ | ☐ | |
| Drag & Drop | ☐ | ☐ | ☐ | |
| Resize | ☐ | ☐ | ☐ | |
| Rotation | ☐ | ☐ | ☐ | |
| Text | ☐ | ☐ | ☐ | |
| Layer Panel | ☐ | ☐ | ☐ | |
| Multi-Element | ☐ | ☐ | ☐ | |
| Reordering | ☐ | ☐ | ☐ | |
| Delete | ☐ | ☐ | ☐ | |
| Print/Export | ☐ | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | ☐ | |
| Performance | ☐ | ☐ | ☐ | |
| Browser Compat | ☐ | ☐ | ☐ | |

---

## Automated Tests (Future)

Consider adding automated tests using:
- Vitest for unit tests
- Playwright for E2E tests
- Visual regression tests

---

## Regression Testing

When adding new features, re-run this entire test suite to ensure no existing functionality is broken.

---

## Sign-off

- **Tester:** _______________
- **Date:** _______________
- **Version:** _______________
- **Status:** ☐ Pass ☐ Fail ☐ Conditional
- **Notes:** _______________

---

## Quick Test Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tips for Testing

1. **Clear Console:** Use `console.clear()` or clear button before each test
2. **Check Network Tab:** Ensure images load correctly
3. **Monitor Errors:** Watch for red errors in console
4. **Use Logger:** The app has built-in logger - check console for detailed logs
5. **Test Incrementally:** Test each feature individually before combining
6. **Document Issues:** Note any unexpected behavior immediately

---

**Happy Testing! 🎉**

