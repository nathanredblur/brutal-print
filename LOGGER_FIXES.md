# 🐛 Logger Fixes - SSR y Ruido de Logs

## Problemas Encontrados

### 1. ❌ Error SSR: "window is not defined"

**Síntoma**:
```
22:51:51 [ERROR] window is not defined
  Hint:
    Browser APIs are not available on the server.
  Stack trace:
    at ThermalLogger.exposeGlobal (/src/lib/logger.ts:54:6)
```

**Causa**: 
El logger se estaba inicializando en el servidor de Astro (SSR) e intentaba acceder a APIs del navegador (`window`, `document`, `localStorage`) que no existen en el servidor.

**Fix**: 
Agregamos checks de `typeof window === 'undefined'` antes de acceder a APIs del navegador.

### 2. 🔊 Ruido de Logs: SYNC_CLIENT cada 100ms

**Síntoma**:
```
DEBUG Reducer: SYNC_CLIENT
DEBUG Reducer: SYNC_CLIENT  
DEBUG Reducer: SYNC_CLIENT  (cada 100ms = 10 logs/segundo)
```

**Causa**: 
El hook `usePrinter` sincroniza el estado del cliente cada 100ms, disparando el reducer con `SYNC_CLIENT` constantemente.

**Fix**: 
Silenciamos los logs de `SYNC_CLIENT` en el reducer para mantener la consola limpia.

---

## ✅ Cambios Implementados

### `/src/lib/logger.ts`

#### 1. Check SSR en `checkEnabled()`

```typescript
private checkEnabled(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    this.enabled = false;
    return;
  }

  // ... resto del código
}
```

**Efecto**: El logger se desactiva automáticamente en el servidor.

#### 2. Check SSR en `exposeGlobal()`

```typescript
private exposeGlobal(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // ... resto del código
}
```

**Efecto**: Las funciones globales solo se exponen en el navegador.

---

### `/src/hooks/usePrinter.ts`

#### 1. Silenciar logs de SYNC_CLIENT en reducer

**Antes**:
```typescript
function hookReducer(state: HookState, action: HookAction): HookState {
  logger.debug("usePrinter", `Reducer: ${action.type}`, { ... });
  // ^ Se ejecutaba SIEMPRE, incluso para SYNC_CLIENT
  
  switch (action.type) {
    // ...
  }
}
```

**Después**:
```typescript
function hookReducer(state: HookState, action: HookAction): HookState {
  // Don't log SYNC_CLIENT actions (too noisy, happens every 100ms)
  if (action.type !== "SYNC_CLIENT") {
    logger.debug("usePrinter", `Reducer: ${action.type}`, { 
      before: state, 
      payload: (action as any).payload 
    });
  }
  
  switch (action.type) {
    // ...
    case "SYNC_CLIENT":
      // Silently sync state without logging (too noisy)
      return { ...state, ...action.payload };
  }
}
```

**Efecto**: Ya no se loguea `SYNC_CLIENT` en el reducer.

#### 2. Remover logs de sincronización periódica

**Antes**:
```typescript
const syncInterval = setInterval(() => {
  const syncData = { ... };
  
  // Only log if there are changes (avoid spam)
  if (logger.isEnabled() && Math.random() < 0.01) { // Log 1% of syncs
    logger.debug("usePrinter", "Periodic state sync", syncData);
  }
  
  dispatch({ type: "SYNC_CLIENT", payload: syncData });
}, 100);
```

**Después**:
```typescript
const syncInterval = setInterval(() => {
  const syncData = {
    statusMessage: client.statusMessage,
    isPrinting: client.isPrinting,
  };
  
  // Silently sync state (no logs, would be too noisy at 10/sec)
  dispatch({
    type: "SYNC_CLIENT",
    payload: syncData,
  });
}, 100);
```

**Efecto**: Ya no se loguea la sincronización periódica.

---

## 📊 Resultado

### Antes (con errores)

**Terminal/Console**:
```
INFO [03:51:51] Logger Debug mode enabled (development environment)
22:51:51 [ERROR] window is not defined ❌
22:51:51 [ERROR] window is not defined ❌
22:51:51 [ERROR] window is not defined ❌
(repetido múltiples veces en cada hot-reload)

DEBUG Reducer: SYNC_CLIENT
DEBUG Reducer: SYNC_CLIENT  
DEBUG Reducer: SYNC_CLIENT  (10 logs/segundo) ❌
```

### Después (limpio)

**Terminal**:
```
✅ Sin errores de SSR
```

**Browser Console** (cuando debug está activado):
```
🔧 Thermal Print Studio - Debug Mode Active

━━━━━━━━━━━━ PRINTER HOOK INITIALIZATION ━━━━━━━━━━━━
INFO  usePrinter Initializing thermal printer client
SUCCESS usePrinter Client created successfully

(solo logs relevantes, sin ruido de SYNC_CLIENT) ✅
```

---

## 🎯 Beneficios

### 1. Eliminación de Errores SSR ✅
- Ya no hay errores de "window is not defined"
- El servidor de Astro compila sin warnings
- Hot-reload funciona sin errores

### 2. Consola Más Limpia ✅
- Reducción de ~90% de logs en consola
- Solo se muestran logs de acciones importantes
- Mejor experiencia de debugging

### 3. Performance ✅
- Menos operaciones de logging
- Menos sobrecarga en el reducer
- Menor uso de memoria en consola

---

## 🔍 Debugging de SYNC_CLIENT

Si necesitas debuggear la sincronización periódica:

### Opción 1: Ver cambios de estado reales

Los cambios importantes de estado se logean automáticamente:

```typescript
useEffect(() => {
  logger.debug("usePrinter", "Hook state updated", {
    isConnected: state.isConnected,
    isPrinting: state.isPrinting,
    statusMessage: state.statusMessage,
    hasPrinterState: !!state.printerState,
  });
}, [state.isConnected, state.isPrinting, state.statusMessage]);
```

**Verás logs cuando**:
- `isConnected` cambia
- `isPrinting` cambia  
- `statusMessage` cambia

**No verás logs cuando**:
- Solo se sincroniza (sin cambios reales)

### Opción 2: Agregar logs temporalmente

Si realmente necesitas ver cada sync:

```typescript
// En usePrinter.ts, dentro del syncInterval:
const syncInterval = setInterval(() => {
  const syncData = {
    statusMessage: client.statusMessage,
    isPrinting: client.isPrinting,
  };
  
  // DEBUG TEMPORAL: Descomentar para ver cada sync
  // logger.debug("usePrinter", "Sync", syncData);
  
  dispatch({
    type: "SYNC_CLIENT",
    payload: syncData,
  });
}, 100);
```

---

## 📋 Checklist de Verificación

- [x] Error "window is not defined" eliminado
- [x] Logger solo se inicializa en el browser
- [x] Funciones globales solo se exponen en el browser
- [x] SYNC_CLIENT no se loguea en el reducer
- [x] Sincronización periódica no se loguea
- [x] Cambios reales de estado sí se logueaan
- [x] No hay errores de linting
- [x] Hot-reload funciona sin errores

---

## 🚀 Testing

### Test 1: Verificar que no hay errores SSR

```bash
pnpm dev
```

**Esperado**:
```
✅ No errores de "window is not defined"
✅ Servidor inicia correctamente
```

### Test 2: Verificar logs limpios

1. Abre http://localhost:4321
2. Abre consola (F12)
3. Ejecuta: `window.enableThermalDebug()`

**Esperado**:
```
🔧 Thermal Print Studio - Debug Mode Active
━━━━━━━━━━━━ PRINTER HOOK INITIALIZATION ━━━━━━━━━━━━
INFO  usePrinter Initializing thermal printer client

(No deberías ver logs de SYNC_CLIENT) ✅
```

### Test 3: Verificar que cambios importantes sí se logueaan

1. Click en "Connect Printer"

**Esperado**:
```
━━━━━━━━━━━━ PRINTER CONNECTED ━━━━━━━━━━━━
SUCCESS Printer connected event fired
DEBUG   State: isConnected -> true
DEBUG   Hook state updated
  Data: { isConnected: true, ... }

(Estos logs SÍ deben aparecer) ✅
```

---

## 📝 Notas Finales

### ¿Por qué no usar un nivel de verbosidad?

Podríamos agregar niveles de verbosidad en el futuro:

```typescript
// Futuro enhancement
logger.setVerbosity('high'); // Muestra SYNC_CLIENT
logger.setVerbosity('normal'); // No muestra SYNC_CLIENT (default)
logger.setVerbosity('minimal'); // Solo errores
```

Pero por ahora, la solución simple de filtrar `SYNC_CLIENT` es suficiente.

### ¿Afecta el debugging?

No. Los cambios importantes de estado se siguen logueando:
- Conexión/desconexión
- Estado de impresión
- Errores
- Cambios de estado relevantes

Solo se silencia el "ruido" de la sincronización periódica.

---

**Status**: ✅ **FIXED**

**Version**: 1.0.1

**Date**: November 12, 2024

