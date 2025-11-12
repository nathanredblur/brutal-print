# 🎉 Toast Notification System

This document describes the **Toast Notification System** implemented in Thermal Print Studio.

## 📋 Overview

The toast system provides **elegant, non-intrusive notifications** with Neuro Core styling to replace browser alerts. It integrates seamlessly with the blue/purple aesthetic and supports multiple notification types.

## ✨ Features

- **4 Notification Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Configurable duration (default 5 seconds)
- **Persistent Notifications**: Set `duration: null` for manual dismiss
- **Action Buttons**: Optional action buttons with callbacks
- **Smooth Animations**: Slide-in/slide-out with fade effects
- **Mobile Responsive**: Full-width on mobile devices
- **Neuro Core Styling**: Glassmorphism, neon glows, gradient borders
- **SSR Safe**: Works with Astro's server-side rendering

## 🎨 Visual Design

Each toast type has a unique color scheme:

| Type    | Border Color | Icon Background | Icon | Description             |
| ------- | ------------ | --------------- | ---- | ----------------------- |
| Success | Cyan         | Cyan (20%)      | ✓    | Operation completed     |
| Error   | Purple       | Purple (20%)    | ✕    | Operation failed        |
| Warning | Orange       | Orange (20%)    | ⚠    | User attention needed   |
| Info    | Blue         | Blue (20%)      | ℹ    | Informational message   |

### Visual Elements

- **Glassmorphism panel** with backdrop blur
- **Gradient border** with neon glow on left side
- **Large icon** with circular background
- **Title** in primary text color
- **Message** in secondary text color (optional)
- **Action button** with hover effects (optional)
- **Close button** with smooth hover transition

## 🛠️ Architecture

### Components

```
src/
├── types/
│   └── toast.ts              # Toast type definitions
├── hooks/
│   └── useToast.ts           # Toast state management hook
├── contexts/
│   └── ToastContext.tsx      # Global toast provider
└── components/
    └── ToastContainer.tsx    # Toast rendering component
```

### Data Flow

1. **ToastProvider** wraps the app in `App.tsx`
2. **useToast** hook manages toast state (add, remove, auto-dismiss)
3. **ToastContext** provides global access via `useToastContext()`
4. **ToastContainer** renders all active toasts
5. **ToastItem** handles individual toast animations and lifecycle

## 📖 Usage

### Basic Usage

```typescript
import { useToastContext } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToastContext();

  const handleSuccess = () => {
    toast.success('Operation completed!', 'Your changes have been saved.');
  };

  const handleError = () => {
    toast.error('Something went wrong', 'Please try again later.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### Convenience Methods

```typescript
// Success notification (green/cyan)
toast.success(title: string, message?: string, duration?: number)

// Error notification (purple/red)
toast.error(title: string, message?: string, duration?: number)

// Warning notification (orange)
toast.warning(title: string, message?: string, duration?: number)

// Info notification (blue)
toast.info(title: string, message?: string, duration?: number)
```

### Advanced Usage

```typescript
// Custom toast with action button
toast.addToast({
  type: 'info',
  title: 'New update available',
  message: 'Version 2.0 is ready to install.',
  duration: 10000, // 10 seconds
  action: {
    label: 'Update Now',
    onClick: () => {
      // Handle update
    },
  },
});

// Persistent toast (manual dismiss only)
const toastId = toast.addToast({
  type: 'warning',
  title: 'Action required',
  message: 'Please review the settings.',
  duration: null, // Won't auto-dismiss
});

// Manually remove a toast
toast.removeToast(toastId);
```

## 🎯 Integration Points

The toast system is used throughout the application:

### CanvasManager

- **Image added**: Success notification when an image layer is added
- **Text added**: Success notification when a text layer is added
- **Print completed**: Success notification after successful print
- **Print failed**: Error notification on print failure
- **Printer not connected**: Warning notification before printing
- **Canvas error**: Error notification if canvas is unavailable

### Future Integration Points

- **Layer operations**: Delete, duplicate, reorder
- **File operations**: Save, load, export
- **Settings changes**: Preferences saved
- **Connection status**: Printer connected/disconnected
- **Validation errors**: Invalid input or configuration

## 🔧 Configuration

### Default Duration

Default auto-dismiss duration is **5 seconds (5000ms)**. Change in `useToast.ts`:

```typescript
const DEFAULT_DURATION = 5000; // Adjust as needed
```

### Animation Duration

Toast slide-in/out animation is **300ms**. Change in `ToastContainer.tsx`:

```typescript
setTimeout(() => {
  onClose();
}, 300); // Match CSS transition duration
```

### Position

Toasts appear in the **top-right corner** by default. Change in `ToastContainer.tsx`:

```css
.toast-container {
  position: fixed;
  top: 1rem; /* Change to bottom: 1rem for bottom positioning */
  right: 1rem; /* Change to left: 1rem for left positioning */
}
```

## 🎬 Animations

### Enter Animation

- Opacity: `0 → 1`
- Transform: `translateX(100%) → translateX(0)`
- Duration: `300ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### Exit Animation

- Opacity: `1 → 0`
- Transform: `translateX(0) → translateX(100%)`
- Duration: `300ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

## 📱 Responsive Design

- **Desktop**: Max width 400px, top-right corner
- **Mobile**: Full width (minus margins), stacks vertically

## 🧪 Testing

### Manual Testing Checklist

- [ ] Success toast displays correctly
- [ ] Error toast displays correctly
- [ ] Warning toast displays correctly
- [ ] Info toast displays correctly
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Multiple toasts stack correctly
- [ ] Close button works
- [ ] Action button works (if provided)
- [ ] Persistent toasts don't auto-dismiss
- [ ] Animations are smooth
- [ ] Mobile layout is correct
- [ ] SSR doesn't break (no window errors)

### Browser Console Testing

```javascript
// Enable debug mode
window.enableThermalDebug();

// Test all toast types
// (Use browser console after app loads)
```

## 🚀 Future Enhancements

- [ ] Toast queue with max display limit
- [ ] Toast grouping (same type)
- [ ] Progress bar for duration
- [ ] Sound effects (optional)
- [ ] Custom icons
- [ ] Swipe to dismiss (mobile)
- [ ] Undo action support
- [ ] Toast history/log

## 🎨 Customization

### Custom Colors

Modify in `src/styles/global.css`:

```css
:root {
  --color-cyan: #06b6d4; /* Success border */
  --color-purple-accent: #b56bff; /* Error border */
  /* etc. */
}
```

### Custom Icons

Modify `getIcon()` in `ToastContainer.tsx`:

```typescript
const getIcon = () => {
  switch (toast.type) {
    case 'success':
      return '🎉'; // Custom emoji
    // ...
  }
};
```

## 📚 Related Documentation

- **[FEATURES.md](./FEATURES.md)** - Full feature list
- **[DEBUG_GUIDE.md](./DEBUG_GUIDE.md)** - Debugging with logger
- **[QUICK_START.md](./QUICK_START.md)** - User guide

---

**Status**: ✅ **Completed** (v1.5)

Made with ⚡ and 💜

