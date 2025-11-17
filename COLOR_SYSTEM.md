# Color System Guide - Thermal Print Studio

## Neuro Core Design System

Este proyecto usa un sistema de colores personalizado llamado **Neuro Core** con estética azul/púrpura, glassmorphismo y efectos de neón.

---

## 🎨 Reglas de Uso de Colores

### ✅ SIEMPRE Usar:

1. **Variables de tema de Tailwind**
   - `bg-primary`, `text-foreground`, `border-border`
   - `bg-secondary`, `text-secondary-foreground`
   - `bg-accent`, `text-accent-foreground`

2. **Escala de colores de Tailwind**
   - `bg-purple-500`, `text-purple-600`, `border-purple-500`
   - `bg-blue-500`, `bg-blue-600`
   - `bg-slate-700`, `bg-slate-800`, `bg-slate-900`

3. **Modificadores de opacidad**
   - `bg-purple-500/40` (40% opacity)
   - `shadow-purple-500/20` (20% opacity for shadows)

### ❌ NUNCA Usar:

1. **Valores arbitrarios para colores**
   - ❌ `text-[#c7cfe6]`
   - ❌ `hover:bg-[rgba(167,139,250,0.1)]`
   - ❌ `border-[#2a2f48]`

2. **Inline styles con colores**
   - ❌ `style={{ color: '#f5f7ff' }}`

---

## 📋 Paleta de Colores Neuro Core

### Colores Principales

| Color | Variable | Tailwind Class | Hex | Uso |
|-------|----------|----------------|-----|-----|
| Purple Dark | `--color-purple-600` | `purple-600` | `#7c3aed` | Primario, botones principales |
| Purple Primary | `--color-purple-500` | `purple-500` | `#a78bfa` | Acentos, hover states |
| Blue Dark | `--color-blue-600` | `blue-600` | `#1e40af` | Gradientes, fondos |
| Blue Primary | `--color-blue-500` | `blue-500` | `#3b82f6` | Acentos azules |

### Colores de Fondo

| Color | Variable | Tailwind Class | Hex | Uso |
|-------|----------|----------------|-----|-----|
| BG Primary | `--background` | `bg-background` | `#0A0E1A` | Fondo principal |
| BG Secondary | `--color-slate-900` | `bg-slate-900` | `#0F172A` | Paneles secundarios |
| BG Tertiary | `--color-slate-800` | `bg-slate-800` | `#1E293B` | Cards, elementos |

### Colores de Texto

| Color | Variable | Tailwind Class | Hex | Uso |
|-------|----------|----------------|-----|-----|
| Text Primary | `--foreground` | `text-foreground` | `#f5f7ff` | Texto principal |
| Text Secondary | `--secondary-foreground` | `text-secondary-foreground` | `#c7cfe6` | Texto secundario |
| Text Muted | `--color-slate-400` | `text-slate-400` | `#94A3B8` | Texto deshabilitado |

### Borders

| Color | Variable | Tailwind Class | Hex | Uso |
|-------|----------|----------------|-----|-----|
| Border | `--border` | `border-border` | `#2a2f48` | Bordes por defecto |

---

## 💡 Ejemplos de Uso

### Botones

```tsx
// ✅ Botón primario
<Button variant="neuro">
  Print
</Button>

// ✅ Botón secundario
<Button variant="neuro-ghost">
  Cancel
</Button>

// ✅ Botón de herramienta activo
<Button variant="neuro-tool-active">
  Image
</Button>
```

### Clases CSS directas

```tsx
// ✅ Panel con glassmorphism
<div className="bg-slate-800 border border-border rounded-lg">
  Content
</div>

// ✅ Texto con jerarquía
<h1 className="text-foreground">Title</h1>
<p className="text-secondary-foreground">Description</p>

// ✅ Hover effects
<div className="hover:bg-accent hover:text-accent-foreground">
  Hover me
</div>

// ✅ Gradiente
<div className="bg-gradient-to-br from-purple-600 to-blue-600">
  Gradient background
</div>
```

---

## 🔧 Cómo Agregar Nuevos Colores

1. **Verifica si existe** en la paleta de Tailwind por defecto
2. **Verifica si existe** en `global.css` → `@theme inline`
3. **Si no existe**, agrégalo a `global.css`:

```css
@theme inline {
  /* Nuevo color */
  --color-cyan-500: #06b6d4;
  --color-cyan-600: #0891b2;
}
```

4. **Úsalo** con la clase de Tailwind:

```tsx
<div className="bg-cyan-500 text-white">
  New color!
</div>
```

---

## 🎭 Variantes de Botones

### Disponibles

| Variant | Uso | Estilo |
|---------|-----|--------|
| `neuro` | Botones principales (Print, Connect) | Gradiente purple-blue con glow |
| `neuro-ghost` | Botones secundarios (Cancel, Disconnect) | Transparente con border |
| `neuro-menu` | Items de menú dropdown | Sin border, hover purple |
| `neuro-icon` | Botones solo ícono (Undo, Redo) | Pequeño, transparente |
| `neuro-tool` | Botones de herramientas (Image, Text) | Estilo tool, columna |
| `neuro-tool-active` | Herramienta activa | Gradiente con border púrpura |

---

## 📚 Referencias

- [Tailwind CSS v4 Colors](https://tailwindcss.com/docs/colors)
- [Customizing Theme](https://tailwindcss.com/docs/theme#customizing-your-theme)
- Archivo: `src/styles/global.css` (definiciones de colores)
- Archivo: `src/components/ui/button.tsx` (implementación)

---

**Last Updated**: November 17, 2025  
**Version**: 1.8.0

