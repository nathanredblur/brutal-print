# ↕️ Drag & Drop Layer Reordering

This document describes the **Drag & Drop functionality** for reordering layers in Thermal Print Studio.

## 📋 Overview

Users can **drag and drop layers** in the Layer Panel to change their z-order (stacking order). This allows precise control over which elements appear on top of others in the final print.

## ✨ Features

- **Native HTML5 Drag & Drop API**: No external libraries required
- **Visual Feedback**: Dragged item becomes semi-transparent
- **Drop Target Highlight**: Cyan border indicates where the layer will be placed
- **Locked Layer Protection**: Locked layers cannot be dragged
- **Smooth Animations**: Transitions for drag-over states
- **Drag Handle**: Visual indicator (⋮⋮) shows layers are draggable

## 🎨 Visual States

| State | Visual Effect | Description |
|-------|---------------|-------------|
| **Normal** | Default styling | Layer ready to interact |
| **Hover** | Lighter background | Mouse over layer item |
| **Dragging** | 50% opacity, grabbing cursor | Layer being dragged |
| **Drag Over** | Cyan border + glow, translateY(-2px) | Valid drop target |
| **Selected** | Blue border + glow | Currently selected layer |
| **Locked** | 60% opacity, not-allowed cursor | Cannot be dragged |

## 🛠️ Technical Implementation

### Components Modified

1. **`useLayers.ts`** - Added `moveLayer` function
2. **`LayerPanel.tsx`** - Integrated drag & drop handlers
3. **`CanvasManager.tsx`** - Passes `onMoveLayer` prop

### Key Functions

#### `moveLayer(fromIndex: number, toIndex: number)`

Reorders layers in the state array and updates their `zIndex` properties.

```typescript
const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
  setState(prev => {
    const newLayers = [...prev.layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    
    return {
      ...prev,
      layers: newLayers,
    };
  });
}, []);
```

#### Drag Event Handlers

- `handleDragStart`: Sets the dragged index
- `handleDragOver`: Prevents default and shows drop target
- `handleDragLeave`: Clears drop target highlight
- `handleDrop`: Executes the move operation
- `handleDragEnd`: Cleans up drag state

### Index Reversal Logic

The Layer Panel displays layers in **reverse order** (top layer first visually), but the underlying array stores them in **ascending zIndex order**. The drag & drop logic accounts for this:

```typescript
const reversedLength = layers.length - 1;
const fromIndex = reversedLength - draggedIndex;
const toIndex = reversedLength - dropIndex;

onMoveLayer(fromIndex, toIndex);
```

## 🎯 User Experience Flow

1. **Hover over layer** → Drag handle (⋮⋮) becomes visible
2. **Click and drag** → Layer becomes semi-transparent
3. **Drag over target** → Target layer highlights with cyan border
4. **Release mouse** → Layer moves to new position
5. **Canvas updates** → Re-renders with new layer order

## 🔧 Usage

### For Users

1. Open the **Layer Panel** in the right sidebar
2. Hover over a layer to see the drag handle (⋮⋮)
3. Click and hold on a layer (not locked)
4. Drag to the desired position
5. Release to drop

**Note**: Locked layers (🔒) cannot be dragged.

### For Developers

```typescript
// LayerPanel already has drag & drop integrated
<LayerPanel
  layers={layers}
  selectedLayerId={selectedLayerId}
  onSelectLayer={selectLayer}
  onToggleVisibility={toggleVisibility}
  onToggleLock={toggleLock}
  onRemoveLayer={removeLayer}
  onMoveLayer={moveLayer} // This enables drag & drop
/>
```

## 🎨 Styling

### Drag Handle

```css
.drag-handle {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: grab;
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.layer-item:hover .drag-handle {
  opacity: 1;
}
```

### Dragging State

```css
.layer-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.layer-item.drag-over {
  border-color: var(--color-cyan);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}
```

## 🚀 Future Enhancements

- [ ] **Multi-select drag**: Drag multiple layers at once
- [ ] **Keyboard shortcuts**: Move layers with arrow keys
- [ ] **Layer groups**: Drag layers into groups/folders
- [ ] **Snap to position**: Snap to specific z-index positions
- [ ] **Undo/Redo**: Support for layer reordering history
- [ ] **Touch support**: Mobile-friendly drag & drop

## 🐛 Troubleshooting

### Layer doesn't drag

- Check if layer is **locked** (🔒 icon)
- Ensure mouse is pressed and held
- Try clicking on the drag handle (⋮⋮)

### Drop doesn't work

- Make sure you're dropping **on another layer item**
- Ensure the target layer highlights (cyan border)
- Try refreshing the page if state is stuck

### Visual glitches

- Check if CSS transitions are disabled in browser
- Try disabling hardware acceleration if flickering occurs
- Report persistent issues with browser/OS info

## 📚 Related Documentation

- **[FEATURES.md](./FEATURES.md)** - Full feature list
- **[TOAST_SYSTEM.md](./TOAST_SYSTEM.md)** - Notification system
- **[DEBUG_GUIDE.md](./DEBUG_GUIDE.md)** - Debugging tools

---

**Status**: ✅ **Completed** (v1.5)

Made with ⚡ and 💜

