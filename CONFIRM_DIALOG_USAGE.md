# Confirm Dialog Usage Guide

Este proyecto usa **Zustand** para manejar el estado del diálogo de confirmación de forma global.

## Arquitectura

### Store de Zustand
```typescript
// src/stores/useConfirmDialogStore.ts
```
- Maneja el estado global del diálogo
- Proporciona una API Promise-based para confirmaciones
- No requiere prop drilling

### Componente Global
```typescript
// src/components/GlobalConfirmDialog.tsx
```
- Se renderiza UNA sola vez en el root (CanvasManager)
- Lee el estado del store automáticamente
- Maneja la UI del AlertDialog de shadcn/ui

## Cómo Usar

### 1. Importar el Store

```typescript
import { useConfirmDialogStore } from "../stores/useConfirmDialogStore";
```

### 2. Acceder a la Función `confirm`

```typescript
// Opción A: Selector específico (más eficiente)
const confirmDialog = useConfirmDialogStore((state) => state.confirm);

// Opción B: Hook completo (si necesitas más cosas del store)
const { confirm, isOpen, close } = useConfirmDialogStore();
```

### 3. Usar en Funciones Async

```typescript
const handleDelete = async () => {
  const confirmed = await confirmDialog(
    "Delete Item?",                    // título
    "This action cannot be undone.",   // descripción
    {
      confirmText: "Yes, delete",      // texto botón confirmar (opcional)
      cancelText: "Cancel"             // texto botón cancelar (opcional)
    }
  );

  if (confirmed) {
    // Usuario confirmó
    deleteItem();
  } else {
    // Usuario canceló
    console.log("Deletion cancelled");
  }
};
```

## Ejemplos

### Ejemplo 1: Confirmación Simple

```typescript
import { useConfirmDialogStore } from "../stores/useConfirmDialogStore";

function MyComponent() {
  const confirmDialog = useConfirmDialogStore((state) => state.confirm);

  const handleAction = async () => {
    const confirmed = await confirmDialog(
      "Are you sure?",
      "This will clear all your work."
    );

    if (confirmed) {
      clearWork();
    }
  };

  return <button onClick={handleAction}>Clear Work</button>;
}
```

### Ejemplo 2: Con Textos Personalizados

```typescript
const handleLogout = async () => {
  const confirmed = await confirmDialog(
    "Logout?",
    "You will need to login again to continue.",
    {
      confirmText: "Yes, logout",
      cancelText: "Stay logged in"
    }
  );

  if (confirmed) {
    logout();
  }
};
```

### Ejemplo 3: En Event Handlers

```typescript
const handleRemove = useCallback(async (e: React.MouseEvent) => {
  e.stopPropagation();
  
  const confirmed = await confirmDialog(
    "Delete Layer?",
    `Are you sure you want to delete "${layer.name}"?`,
    { confirmText: "Delete", cancelText: "Cancel" }
  );

  if (confirmed) {
    onRemoveLayer(layer.id);
  }
}, [layer.id, layer.name, onRemoveLayer, confirmDialog]);
```

## Ventajas de Este Enfoque

✅ **No más prop drilling**: Usa el store directamente desde cualquier componente
✅ **Una sola instancia**: GlobalConfirmDialog se renderiza solo una vez
✅ **Type-safe**: TypeScript completo en toda la cadena
✅ **Clean code**: No necesitas gestionar estado local del diálogo
✅ **Promise-based**: API simple y familiar con async/await
✅ **Escalable**: Agregar nuevos diálogos es trivial

## API Completa del Store

```typescript
interface ConfirmDialogStore {
  // Estado
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;

  // Acciones principales
  confirm: (
    title: string,
    description: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => Promise<boolean>;

  // Acciones auxiliares (raramente necesarias)
  close: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}
```

## Notas

- El diálogo se cierra automáticamente cuando el usuario hace click en cualquier botón
- Hacer click fuera del diálogo también lo cierra (cuenta como cancelar)
- Solo puede haber un diálogo abierto a la vez (esto es por diseño)
- Si necesitas múltiples tipos de diálogos, puedes crear stores adicionales siguiendo el mismo patrón

