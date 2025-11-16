# 🔧 Debugging Guide - Thermal Print Studio

## Quick Start

### Enable Debug Mode

Open browser console (F12) and run:

```javascript
window.enableThermalDebug();
```

To disable:

```javascript
window.disableThermalDebug();
```

---

## Debug Mode Features

When enabled, you'll see detailed logs for:

- Printer connection/disconnection
- State changes
- Print operations
- Canvas operations
- Layer management
- User interactions

---

## Common Issues

### Issue: "Please connect to printer first"

**Symptom**: Printer shows as connected but print button shows error

**Debug Steps**:

1. Enable debug mode
2. Connect printer - look for:

```
━━━━━━━━━━━━ PRINTER CONNECTED ━━━━━━━━━━━━
SUCCESS Printer connected event fired
DEBUG   State: isConnected -> true
```

3. Check component state:

```
INFO PrinterConnection Component state updated
  Data: { isConnected: true, ... }
```

4. Try printing - check:

```
INFO CanvasManager Checking connection status
  Data: { isConnected: ???, isPrinting: false }
```

**Fix**: If `isConnected` is `false` at print time, refresh page and reconnect.

---

### Issue: Printer won't connect

**Debug Steps**:

1. Check browser compatibility (Chrome/Edge only)
2. Verify Bluetooth is enabled
3. Check console for errors
4. Try turning printer off/on
5. Check printer battery level

---

### Issue: Print is blank/poor quality

**Try these settings**:

**For photos**:

```javascript
{
  dither: 'steinberg',
  brightness: 140,
  intensity: 100
}
```

**For text/documents**:

```javascript
{
  dither: 'threshold',
  brightness: 128,
  intensity: 110
}
```

---

## Logger API

### Basic Usage

```typescript
import { logger } from "../lib/logger";

// Information
logger.info("Component", "User clicked button", { userId: 123 });

// Success
logger.success("API", "Request completed", { duration: 234 });

// Warning
logger.warn("Cache", "Cache miss", { key: "user:123" });

// Error (always shown)
logger.error("Auth", "Login failed", error);

// Debug (only when enabled)
logger.debug("Reducer", "State transition", { from: "idle", to: "loading" });

// Visual separators
logger.separator("PRINTER CONNECTION");
```

### Check if Enabled

```typescript
if (logger.isEnabled()) {
  // Do expensive logging operation
}
```

---

## Performance Tips

### Avoid Expensive Logs

```typescript
// ✅ Good: Check first
if (logger.isEnabled()) {
  const expensiveData = calculateDebugInfo();
  logger.debug("Component", "Data", expensiveData);
}

// ❌ Bad: Always calculates
logger.debug("Component", "Data", calculateDebugInfo());
```

### Reduce Log Spam

```typescript
// Sample logs (1% of the time)
if (logger.isEnabled() && Math.random() < 0.01) {
  logger.debug("Interval", "Periodic check", data);
}
```

---

## Browser Console Tips

### Filter Logs

Use browser console filters:

- `usePrinter` - See only printer-related logs
- `Canvas` - See only canvas logs
- `ERROR` - See only errors

### Copy Logs for Bug Reports

1. Enable debug mode
2. Reproduce the issue
3. Right-click console → Save as...
4. Or select all and copy

---

## React DevTools

Install [React DevTools](https://react.dev/learn/react-developer-tools) to:

- Inspect component state
- Track re-renders
- View hook values
- Monitor performance

---

## Need Help?

If debugging doesn't solve your issue:

1. Copy all console logs
2. Note your:
   - Browser & version
   - Operating system
   - Printer model
   - Steps to reproduce
3. Open a GitHub issue with this info

---

**Auto-Enabled**: Debug mode is automatically on in development (`pnpm dev`)
