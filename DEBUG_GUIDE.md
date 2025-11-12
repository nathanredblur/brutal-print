# 🔧 Debug Guide - Thermal Print Studio

## Sistema de Logs de Debugging

Hemos implementado un sistema completo de logs para diagnosticar problemas, especialmente el issue de "Please connect to printer first" cuando la impresora ya está conectada.

---

## 🚀 Cómo Activar los Logs

El sistema de logs se activa automáticamente en **modo desarrollo**, pero puedes habilitarlo manualmente en producción de 3 formas:

### Método 1: Comando en Consola (Recomendado)

Abre la consola del navegador (F12) y ejecuta:

```javascript
window.enableThermalDebug();
```

Para desactivar:

```javascript
window.disableThermalDebug();
```

### Método 2: Cookie

En la consola del navegador:

```javascript
document.cookie = "debug_thermal=true; max-age=31536000";
```

Luego recarga la página.

### Método 3: LocalStorage

En la consola del navegador:

```javascript
localStorage.setItem("debug_thermal", "true");
```

Luego recarga la página.

---

## 📊 Qué Logs Verás

Una vez activado, verás logs detallados en la consola organizados por componentes:

### 1. **PRINTER HOOK INITIALIZATION**

```
━━━━━━━━━━━━━━━━━━━━ PRINTER HOOK INITIALIZATION ━━━━━━━━━━━━━━━━━━━━
INFO  [HH:MM:SS] usePrinter Initializing thermal printer client
SUCCESS [HH:MM:SS] usePrinter Client created successfully
```

**Qué buscar**: Verifica que el cliente se inicialice correctamente.

### 2. **PRINTER CONNECTED**

```
━━━━━━━━━━━━━━━━━━━━ PRINTER CONNECTED ━━━━━━━━━━━━━━━━━━━━
SUCCESS [HH:MM:SS] usePrinter Printer connected event fired
INFO    [HH:MM:SS] usePrinter Dispatching SET_CONNECTED: true
DEBUG   [HH:MM:SS] usePrinter Reducer: SET_CONNECTED
DEBUG   [HH:MM:SS] usePrinter State: isConnected -> true
```

**Qué buscar**:

- El evento "connected" debe dispararse
- El estado `isConnected` debe cambiar a `true`
- Verifica que no haya errores después

### 3. **PRINTER CONNECTION UI**

```
━━━━━━━━━━━━━━━━━━━━ PRINTER CONNECTION UI ━━━━━━━━━━━━━━━━━━━━
INFO  [HH:MM:SS] PrinterConnection Connect button clicked
INFO  [HH:MM:SS] PrinterConnection Calling connectPrinter()...
SUCCESS [HH:MM:SS] PrinterConnection connectPrinter() completed successfully
INFO  [HH:MM:SS] PrinterConnection Component state updated
  Data: {
    isConnected: true,
    isPrinting: false,
    statusMessage: "Connected to MXW01",
    batteryLevel: 85
  }
```

**Qué buscar**:

- El componente debe recibir `isConnected: true`
- El UI debe actualizarse correctamente

### 4. **HANDLE PRINT**

```
━━━━━━━━━━━━━━━━━━━━ HANDLE PRINT ━━━━━━━━━━━━━━━━━━━━
INFO  [HH:MM:SS] CanvasManager handlePrint() called
DEBUG [HH:MM:SS] CanvasManager Canvas exists { width: 384, height: 800 }
INFO  [HH:MM:SS] CanvasManager Checking connection status
  Data: { isConnected: true, isPrinting: false }
```

**🐛 AQUÍ ESTÁ EL BUG**:
Si ves esto:

```
ERROR [HH:MM:SS] CanvasManager Printer not connected! isConnected = false
WARN  [HH:MM:SS] CanvasManager This is the bug - printer should be connected but isConnected is false
```

Significa que el estado de conexión no se está propagando correctamente al `CanvasManager`.

### 5. **PRINT CANVAS**

```
━━━━━━━━━━━━━━━━━━━━ PRINT CANVAS ━━━━━━━━━━━━━━━━━━━━
INFO  [HH:MM:SS] usePrinter printCanvas() called
  Data: { canvasSize: { width: 384, height: 800 }, options: {...} }
INFO  [HH:MM:SS] usePrinter Extracting image data from canvas
DEBUG [HH:MM:SS] usePrinter Image data extracted
INFO  [HH:MM:SS] usePrinter Calling client.print()...
SUCCESS [HH:MM:SS] usePrinter Print completed successfully
```

**Qué buscar**:

- La imagen debe extraerse correctamente
- El método `client.print()` debe completarse sin errores

---

## 🔍 Diagnosticando el Problema Actual

### Escenario: "Please connect to printer first"

Sigue estos pasos:

#### 1. Activa los logs

```javascript
window.enableThermalDebug();
```

#### 2. Conecta la impresora

Click en "Connect Printer". Busca en la consola:

✅ **Debe aparecer**:

```
━━━━━━━━━━━━━━━━━━━━ PRINTER CONNECTED ━━━━━━━━━━━━━━━━━━━━
SUCCESS Printer connected event fired
DEBUG   State: isConnected -> true
```

❌ **Si NO aparece**, el problema está en la librería `mxw01-thermal-printer` o en la conexión Bluetooth.

#### 3. Verifica el estado en PrinterConnection

Busca:

```
INFO PrinterConnection Component state updated
  Data: { isConnected: true, ... }
```

✅ **Si `isConnected: true`**: El hook está funcionando.

❌ **Si `isConnected: false`**: El estado no se está propagando del hook al componente.

#### 4. Verifica el estado en CanvasManager

Busca después de conectar:

```
DEBUG CanvasManager Printer connection state
  Data: { isConnected: true, isPrinting: false }
```

✅ **Si `isConnected: true`**: Todo está bien, intenta imprimir.

❌ **Si `isConnected: false`**: **AQUÍ ESTÁ EL BUG**. El `CanvasManager` no está recibiendo el estado actualizado del hook.

#### 5. Intenta imprimir

Click en "Print". Busca:

```
━━━━━━━━━━━━━━━━━━━━ HANDLE PRINT ━━━━━━━━━━━━━━━━━━━━
INFO  Checking connection status
  Data: { isConnected: ???, isPrinting: false }
```

**Análisis del estado `isConnected`**:

- ✅ `true`: Debe proceder a imprimir
- ❌ `false`: Muestra el error "Please connect to printer first"

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Hook se inicializa múltiples veces

**Síntoma**: Ves múltiples mensajes "PRINTER HOOK INITIALIZATION"

**Causa**: React está remontando el componente

**Solución**:

- Verifica que `CanvasManager` y `PrinterConnection` estén usando el **mismo hook** (singleton)
- Asegúrate de que no haya múltiples instancias de `usePrinter`

### Problema 2: Estado no se sincroniza

**Síntoma**: Ves "SET_CONNECTED: true" pero `isConnected` sigue siendo `false` en componentes

**Causa**: Posible problema con el `useReducer` o múltiples instancias del hook

**Debugging**:

```javascript
// En la consola, después de conectar:
// Inspecciona el componente en React DevTools
// Busca el hook usePrinter y verifica su estado
```

### Problema 3: Evento "connected" nunca se dispara

**Síntoma**: No ves "PRINTER CONNECTED" en los logs

**Causa**: La librería `mxw01-thermal-printer` no está disparando el evento

**Solución**:

- Verifica que estés usando la versión correcta de la librería
- Revisa la documentación oficial
- Prueba con otro navegador (Chrome/Edge recomendado)

### Problema 4: Sincronización periódica sobrescribe el estado

**Síntoma**: `isConnected` cambia a `true` pero luego vuelve a `false`

**Causa**: El `SYNC_CLIENT` cada 100ms puede estar sobrescribiendo el estado

**Debugging**: Busca en logs:

```
DEBUG Periodic state sync
  Data: { statusMessage: "...", isPrinting: false }
```

**Nota**: El sync no debería incluir `isConnected`, solo `statusMessage` y `isPrinting`.

---

## 📝 Logs Útiles para Reportar Bugs

Si encuentras un bug, copia y pega estos logs:

### 1. Estado de inicialización

```
Busca: "PRINTER HOOK INITIALIZATION"
Copia: Los siguientes 5-10 líneas
```

### 2. Estado de conexión

```
Busca: "PRINTER CONNECTED"
Copia: Toda la sección hasta el próximo separador
```

### 3. Estado en componentes

```
Busca: "PrinterConnection Component state updated"
Copia: El objeto Data completo
```

### 4. Error de impresión

```
Busca: "HANDLE PRINT"
Copia: Toda la sección especialmente "Checking connection status"
```

---

## 🎯 Quick Debug Checklist

Cuando tengas el problema "Please connect to printer first":

- [ ] Logs están activados (`window.enableThermalDebug()`)
- [ ] Veo "PRINTER CONNECTED" en los logs
- [ ] Veo "State: isConnected -> true"
- [ ] PrinterConnection muestra `isConnected: true`
- [ ] CanvasManager muestra `isConnected: true`
- [ ] Al hacer click en Print, `isConnected` es `true` en handlePrint

Si TODOS los checks pasan pero aún falla, el bug está en otro lado.

Si algún check FALLA, ese es el punto donde el estado se pierde.

---

## 🔬 Debugging Avanzado

### Ver todos los dispatches del reducer

Cada dispatch del reducer se logea automáticamente:

```
DEBUG Reducer: SET_CONNECTED
  Data: { before: { isConnected: false, ... }, payload: true }
```

### Ver estado del hook en tiempo real

Los cambios de estado se logean automáticamente:

```
DEBUG Hook state updated
  Data: {
    isConnected: true,
    isPrinting: false,
    statusMessage: "Connected",
    hasPrinterState: true
  }
```

### Inspeccionar el cliente directamente

En la consola, puedes acceder al cliente (solo en dev):

```javascript
// Esto NO funciona porque clientRef es privado
// Pero puedes inspeccionar el componente en React DevTools
```

---

## 📞 Contacto y Reporte de Bugs

Si después de seguir esta guía aún tienes problemas:

1. **Activa los logs** con `window.enableThermalDebug()`
2. **Reproduce el problema**
3. **Copia TODOS los logs de la consola**
4. **Abre un issue** con:
   - Navegador y versión
   - Sistema operativo
   - Modelo de impresora
   - Logs completos
   - Screenshots si es posible

---

## ✅ Verificación Final

Una vez que funcione, deberías ver esto en orden:

```
1. PRINTER HOOK INITIALIZATION
   ✅ Client created successfully

2. PRINTER CONNECTION UI
   ✅ Connect button clicked
   ✅ connectPrinter() completed successfully

3. PRINTER CONNECTED
   ✅ Printer connected event fired
   ✅ State: isConnected -> true

4. PrinterConnection Component state updated
   ✅ isConnected: true

5. CanvasManager Printer connection state
   ✅ isConnected: true

6. HANDLE PRINT
   ✅ Checking connection status: isConnected: true
   ✅ Calling printCanvas()

7. PRINT CANVAS
   ✅ Image data extracted
   ✅ Calling client.print()...
   ✅ Print completed successfully
```

---

**Happy debugging!** 🐛🔍
