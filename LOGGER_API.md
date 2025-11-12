# 📘 Logger API Reference

## Funciones Globales

### `window.enableThermalDebug()`

Activa el modo debug. Los logs se mostrarán en la consola.

```javascript
window.enableThermalDebug()
// 🔧 Thermal Debug ENABLED
// Logs will now appear in console
```

**Persistencia**: Se guarda en `localStorage` y cookie (1 año).

---

### `window.disableThermalDebug()`

Desactiva el modo debug.

```javascript
window.disableThermalDebug()
// 🔇 Thermal Debug DISABLED
```

---

## Logger Instance

El logger es un singleton exportado desde `src/lib/logger.ts`:

```typescript
import { logger } from '../lib/logger';
```

### Métodos Principales

#### `logger.info(component: string, message: string, data?: any)`

Log informativo (azul).

```typescript
logger.info("MyComponent", "User clicked button", { userId: 123 });
```

**Output**:
```
INFO [12:34:56] MyComponent User clicked button
  Data: { userId: 123 }
```

---

#### `logger.success(component: string, message: string, data?: any)`

Log de éxito (verde).

```typescript
logger.success("API", "Request completed", { duration: 234 });
```

**Output**:
```
SUCCESS [12:34:56] API Request completed
  Data: { duration: 234 }
```

---

#### `logger.warn(component: string, message: string, data?: any)`

Log de advertencia (naranja).

```typescript
logger.warn("Cache", "Cache miss", { key: "user:123" });
```

**Output**:
```
WARN [12:34:56] Cache Cache miss
  Data: { key: "user:123" }
```

---

#### `logger.error(component: string, message: string, data?: any)`

Log de error (rojo). **Siempre se muestra, incluso si debug está deshabilitado**.

```typescript
logger.error("Auth", "Login failed", new Error("Invalid credentials"));
```

**Output**:
```
ERROR [12:34:56] Auth Login failed
  Data: Error: Invalid credentials
  (stack trace)
```

---

#### `logger.debug(component: string, message: string, data?: any)`

Log de debugging (morado). Solo visible cuando debug está activado.

```typescript
logger.debug("Reducer", "State transition", { from: "idle", to: "loading" });
```

**Output**:
```
DEBUG [12:34:56] Reducer State transition
  Data: { from: "idle", to: "loading" }
```

---

### Métodos de Ayuda

#### `logger.logState(component: string, stateName: string, value: any)`

Shortcut para loguear cambios de estado.

```typescript
logger.logState("usePrinter", "isConnected", true);
```

**Equivale a**:
```typescript
logger.debug("usePrinter", "State: isConnected", true);
```

**Output**:
```
DEBUG [12:34:56] usePrinter State: isConnected
  Data: true
```

---

#### `logger.logEvent(component: string, eventName: string, data?: any)`

Shortcut para loguear eventos.

```typescript
logger.logEvent("Button", "onClick", { x: 100, y: 200 });
```

**Equivale a**:
```typescript
logger.info("Button", "Event: onClick", { x: 100, y: 200 });
```

**Output**:
```
INFO [12:34:56] Button Event: onClick
  Data: { x: 100, y: 200 }
```

---

#### `logger.separator(message?: string)`

Imprime una línea separadora para organizar visualmente los logs.

```typescript
logger.separator("PRINTER CONNECTION");
```

**Output**:
```
━━━━━━━━━━━━━━━━━━━━ PRINTER CONNECTION ━━━━━━━━━━━━━━━━━━━━
```

---

#### `logger.isEnabled(): boolean`

Verifica si el modo debug está activado.

```typescript
if (logger.isEnabled()) {
  // Hacer algo costoso solo en debug
  const debugInfo = expensiveCalculation();
  logger.debug("App", "Debug info", debugInfo);
}
```

---

## Ejemplos de Uso

### En un Hook

```typescript
import { logger } from '../lib/logger';
import { useEffect, useState } from 'react';

export function useMyHook() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    logger.separator("MY HOOK INIT");
    logger.info("useMyHook", "Initializing hook");
    
    fetchData()
      .then(result => {
        logger.success("useMyHook", "Data fetched", result);
        setData(result);
      })
      .catch(error => {
        logger.error("useMyHook", "Failed to fetch data", error);
      });
  }, []);
  
  // Log state changes
  useEffect(() => {
    logger.logState("useMyHook", "data", data);
  }, [data]);
  
  return data;
}
```

---

### En un Componente

```typescript
import { logger } from '../lib/logger';
import { useEffect } from 'react';

export function MyComponent({ userId }) {
  useEffect(() => {
    logger.info("MyComponent", "Component mounted", { userId });
    
    return () => {
      logger.info("MyComponent", "Component unmounted");
    };
  }, []);
  
  const handleClick = () => {
    logger.logEvent("MyComponent", "buttonClick", { userId });
    // ... handle click
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

---

### En un Reducer

```typescript
import { logger } from '../lib/logger';

function myReducer(state, action) {
  logger.debug("myReducer", `Action: ${action.type}`, {
    before: state,
    payload: action.payload
  });
  
  switch (action.type) {
    case 'SET_VALUE':
      logger.logState("myReducer", "value", action.payload);
      return { ...state, value: action.payload };
      
    default:
      logger.warn("myReducer", "Unknown action type", action.type);
      return state;
  }
}
```

---

## Configuración

### Activación Automática en Desarrollo

El logger se activa automáticamente si `import.meta.env.DEV === true`.

```typescript
// En astro.config.mjs o similar
export default {
  // El modo dev activa automáticamente los logs
}
```

---

### Activación Manual (Producción)

#### Opción 1: Cookie

```javascript
document.cookie = "debug_thermal=true; max-age=31536000"; // 1 año
location.reload();
```

#### Opción 2: LocalStorage

```javascript
localStorage.setItem('debug_thermal', 'true');
location.reload();
```

#### Opción 3: Función Global

```javascript
window.enableThermalDebug();
// Automáticamente establece cookie y localStorage
```

---

## Formato de Logs

Los logs aparecen en la consola con el siguiente formato:

```
LEVEL [HH:MM:SS] Component Message
  Data: { ... }
```

### Colores

- **INFO**: Azul (#3B82F6)
- **SUCCESS**: Verde (#10B981)
- **WARN**: Naranja (#F59E0B)
- **ERROR**: Rojo (#EF4444)
- **DEBUG**: Morado (#A78BFA)

### Grupos Colapsables

Los logs usan `console.groupCollapsed()` para mantener la consola limpia. Haz click para expandir.

---

## Optimización de Performance

### Evitar Logs Costosos

Si tienes cálculos costosos solo para logs:

```typescript
if (logger.isEnabled()) {
  const expensiveData = calculateExpensiveData();
  logger.debug("Component", "Expensive data", expensiveData);
}
```

### Logs Condicionales (Reducir Spam)

Para reducir spam de logs en loops o intervalos:

```typescript
// Solo loguear 1% de las veces
if (logger.isEnabled() && Math.random() < 0.01) {
  logger.debug("Interval", "Periodic check", { count });
}
```

### Logs de Producción

Los errores **siempre se logean**, incluso en producción:

```typescript
logger.error("API", "Critical error", error);
// Esto SIEMPRE aparece en consola, debug activado o no
```

---

## Best Practices

### 1. Usa Separadores para Secciones Grandes

```typescript
logger.separator("USER AUTHENTICATION");
logger.info("Auth", "Starting authentication flow");
// ... múltiples logs
logger.separator(); // Cierra la sección
```

### 2. Nombres de Componentes Consistentes

```typescript
// ✅ Bueno: Usa el nombre del componente/hook
logger.info("usePrinter", "Connection established");

// ❌ Malo: Nombres genéricos
logger.info("Hook", "Something happened");
```

### 3. Mensajes Descriptivos

```typescript
// ✅ Bueno: Mensaje claro y accionable
logger.error("API", "Failed to fetch user data", { userId, error });

// ❌ Malo: Mensaje vago
logger.error("API", "Error", error);
```

### 4. Data Estructurada

```typescript
// ✅ Bueno: Objeto estructurado
logger.info("Payment", "Transaction completed", {
  amount: 100,
  currency: "USD",
  transactionId: "tx_123"
});

// ❌ Malo: String concatenado
logger.info("Payment", `Transaction $100 USD completed tx_123`);
```

### 5. Niveles Apropiados

- `info`: Flujo normal de la aplicación
- `success`: Operaciones completadas exitosamente
- `warn`: Algo inesperado pero no crítico
- `error`: Errores que requieren atención
- `debug`: Información detallada para debugging

---

## TypeScript Support

El logger tiene tipos completos:

```typescript
import { logger } from '../lib/logger';

// Autocompletado de métodos
logger.info();     // ✅
logger.success();  // ✅
logger.warn();     // ✅
logger.error();    // ✅
logger.debug();    // ✅

// Type safety en parámetros
logger.info("Component", "Message"); // ✅
logger.info("Component");            // ❌ Error: Missing message
```

---

## Troubleshooting

### Los logs no aparecen

1. Verifica que el debug esté activado:
   ```javascript
   window.enableThermalDebug()
   ```

2. Recarga la página

3. Verifica la consola:
   ```
   🔧 Thermal Print Studio - Debug Mode Active
   ```

### Los logs están activados pero no veo mis mensajes

- Verifica que estés usando `logger.info/debug/etc`, no `console.log`
- Los logs `debug()` solo aparecen en modo debug
- Revisa los filtros de la consola

### Quiero desactivar logs en producción

```javascript
window.disableThermalDebug()
```

O elimina la cookie/localStorage:

```javascript
localStorage.removeItem('debug_thermal');
document.cookie = 'debug_thermal=; max-age=0';
```

---

## Roadmap

Futuras mejoras planeadas:

- [ ] Exportar logs a archivo
- [ ] Filtrar logs por componente
- [ ] Niveles de verbosidad configurables
- [ ] Integration con herramientas de monitoring
- [ ] Performance metrics automáticos

---

**API Version**: 1.0.0  
**Last Updated**: November 12, 2024

