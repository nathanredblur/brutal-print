# 🎨 Interactive Canvas - Fabric.js Integration

## Overview

The canvas has been upgraded with **Fabric.js**, providing full interactive capabilities similar to professional design tools like Canva. You can now drag, resize, rotate, and select elements directly on the canvas.

## Features

### ✨ Interactive Controls

- **Click to Select**: Click on any element to select it
- **Drag to Move**: Click and drag selected elements to reposition them
- **Resize**: Drag the corner handles to resize elements
- **Rotate**: Use the rotation handle to rotate elements
- **Multi-select**: Select multiple elements (Fabric.js supports this natively)

### 🎯 Selection Handles

When you select an element, you'll see:
- **Corner Handles**: Blue squares for resizing
- **Rotation Handle**: Circular handle above the element for rotation
- **Bounding Box**: Visual indicator showing the selected element
- **Center Point**: Visual center indicator

### 🖱️ Mouse Interactions

- **Single Click**: Select an element
- **Click + Drag**: Move an element
- **Corner Drag**: Resize an element
- **Rotation Handle Drag**: Rotate an element
- **Click Empty Area**: Deselect all elements

## Technical Implementation

### Components

#### FabricCanvas.tsx

Main interactive canvas component that:
- Manages Fabric.js canvas instance
- Syncs layers with Fabric objects
- Handles selection, modification, and transformation events
- Provides export functionality for printing

Key features:
```typescript
- Initialize Fabric.js canvas with proper dimensions
- Create Fabric objects (Image, Text) from layer data
- Sync layer changes with Fabric objects
- Handle user interactions (selection, drag, resize, rotate)
- Export canvas to HTML canvas element for printing
```

#### Updated CanvasManager.tsx

Integrated FabricCanvas:
- Replaced native HTML canvas with FabricCanvas component
- Connected layer system with interactive canvas
- Maintained compatibility with existing features (printing, layers, tools)

### Layer System Integration

The layer system now works seamlessly with the interactive canvas:

1. **Layer to Fabric Object**: Each layer is converted to a Fabric.js object
2. **Bidirectional Sync**: Changes in layers update Fabric objects and vice versa
3. **Selection Sync**: Selecting a layer in the panel selects it on canvas
4. **Property Updates**: Position, size, rotation updates sync automatically

### Data Flow

```
User Interaction → Fabric.js Object → Layer Update → State Update
                                    ↓
                            Canvas Re-render
```

## Usage Guide

### Adding Images

1. Click the **Image tool** in the toolbar
2. Upload an image
3. The image appears on canvas as a draggable, resizable object
4. Click to select, drag to move, resize with handles

### Adding Text

1. Click the **Text tool** in the toolbar
2. Enter your text and configure options
3. The text appears on canvas as an interactive object
4. Drag, resize, or rotate as needed

### Manipulating Elements

**Moving:**
- Click and drag the element

**Resizing:**
- Click to select
- Drag corner handles to resize
- Hold Shift for proportional scaling (Fabric.js default)

**Rotating:**
- Click to select
- Drag the rotation handle (circular icon above)
- Rotate to any angle

**Deleting:**
- Select the element
- Use the delete button in the Layer Panel

### Layer Panel Integration

The Layer Panel works in harmony with the canvas:
- Click a layer to select it on canvas
- Drag layers to reorder (changes z-index)
- Toggle visibility to show/hide elements
- Lock layers to prevent editing
- Delete layers to remove from canvas

## Printing

The interactive canvas exports to a standard HTML canvas for printing:
- All transformations (position, size, rotation) are preserved
- The export canvas matches the printer dimensions (384x800px)
- Printing workflow remains unchanged

## Keyboard Shortcuts

Fabric.js supports standard keyboard shortcuts:
- **Delete/Backspace**: Delete selected object (can be enabled)
- **Ctrl+C / Cmd+C**: Copy (can be enabled)
- **Ctrl+V / Cmd+V**: Paste (can be enabled)
- **Arrow Keys**: Nudge position (can be enabled)

*Note: These shortcuts can be enabled based on project needs*

## Advanced Features

### Object Properties

Each Fabric object has these properties:
- `left`, `top`: Position
- `width`, `height`: Dimensions
- `scaleX`, `scaleY`: Scale factors
- `angle`: Rotation in degrees
- `opacity`: Transparency (0-1)
- `visible`: Visibility flag
- `selectable`: Interaction flag
- `data.layerId`: Link to layer system

### Custom Styling

Fabric.js allows customization of:
- Selection border color
- Handle colors and sizes
- Rotation handle style
- Bounding box appearance

Current theme matches the Neuro Core design:
- Purple selection borders
- Modern, minimalist handles
- Smooth animations

## Performance

### Optimization

- Fabric.js renders efficiently using canvas hardware acceleration
- Only modified objects are re-rendered
- Layer sync is optimized with Maps for O(1) lookups
- Event handlers are debounced to prevent excessive updates

### Scaling

- Handles hundreds of objects smoothly
- Efficient for typical thermal printer designs (small canvas size)
- Memory-efficient object management

## Browser Compatibility

Fabric.js works on all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (with touch support)

## Touch Support

Fabric.js includes touch support out of the box:
- Touch to select
- Touch and drag to move
- Pinch to resize
- Two-finger rotation

## Future Enhancements

Possible additions:
- [ ] Snap to grid
- [ ] Alignment guides
- [ ] Group selection
- [ ] Copy/paste functionality
- [ ] Undo/redo system
- [ ] Shape drawing tools
- [ ] Custom keyboard shortcuts
- [ ] Export to SVG/PNG

## Troubleshooting

### Element Not Selectable

- Check if layer is locked (lock icon in Layer Panel)
- Verify layer is visible (eye icon in Layer Panel)
- Ensure Fabric canvas is properly initialized

### Canvas Not Updating

- Check console for errors
- Verify layer data is correct
- Ensure Fabric.js is properly imported

### Print Output Differs

- The export canvas should match the interactive canvas
- Check if all layers are visible before printing
- Verify transformations are applied

## Technical Notes

### Why Fabric.js?

Fabric.js was chosen because:
1. **Mature and Stable**: Battle-tested library with large community
2. **Feature-Rich**: Built-in support for all needed interactions
3. **Lightweight**: Reasonable bundle size for the features
4. **Well-Documented**: Excellent documentation and examples
5. **TypeScript Support**: Good type definitions available
6. **No Framework Lock-in**: Works with any framework (React, Vue, vanilla)

### Bundle Size

- Fabric.js: ~200KB minified
- Acceptable for the rich feature set provided
- Tree-shaking not available (full library needed)

### Alternative Libraries

Other options considered:
- **Konva.js**: Similar features, React-specific wrapper available
- **Paper.js**: More focused on vector graphics
- **Three.js**: Overkill for 2D canvas
- **Custom Implementation**: Too time-consuming for the scope

## Resources

- [Fabric.js Official Docs](http://fabricjs.com/docs/)
- [Fabric.js GitHub](https://github.com/fabricjs/fabric.js)
- [Interactive Demos](http://fabricjs.com/demos/)

## Summary

The interactive canvas powered by Fabric.js transforms the thermal printer design tool into a professional-grade application. Users can now manipulate elements naturally, just like in Canva or other design tools, while maintaining full compatibility with the existing layer system and printing workflow.

🎨 **Enjoy your new interactive design experience!**

