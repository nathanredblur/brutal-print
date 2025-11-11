# Thermal Print Studio - Application Overview

## General Concept

A Canva-style web application optimized for designing and printing on black and white thermal printers, featuring a modern Neuro Core aesthetic with blue and purple tones, and creative tools to maximize monochrome potential.

---

## Core Features

### 1. **Canvas Editor**

- Workspace adapted to thermal printer dimensions (58mm, 80mm)
- Real-time preview of final output
- Smooth zoom and navigation system
- Optional grid for precise alignment

### 2. **Layer Management**

- Side panel with draggable layer list
- Reorder layers via drag & drop
- Per-layer options:
  - Lock/unlock
  - Show/hide
  - Duplicate
  - Delete
  - Opacity (simulated with dithering)

### 3. **Image Tools**

#### Import

- Upload custom images (JPG, PNG, SVG)
- Library of pre-designed images
- Integrated free image search

#### B&W Conversion Effects

- **Dithering Methods:**
  - Floyd-Steinberg
  - Atkinson
  - Ordered (Bayer)
  - Halftone
  - Random/Stochastic
  - Simple threshold
- **Threshold Adjustment:** Slider 0-255
- **Retro Textures:**
  - Crosshatch
  - Dots
  - Lines (horizontal/vertical/diagonal)
  - Brick pattern
  - Checkerboard
  - Custom ASCII patterns
- **Contrast and brightness**
- **Color inversion**
- **Posterization**

#### Transformations

- Rotate (free or fixed angles: 90°, 180°, 270°)
- Scale maintaining aspect ratio
- Flip horizontal/vertical
- Crop

### 4. **Text Tools**

#### Typography

- System fonts
- Retro monospace fonts:
  - IBM Plex Mono
  - Space Mono
  - Courier Prime
  - VT323
  - Press Start 2P
- Modern sans-serif fonts:
  - Inter
  - Outfit
  - Space Grotesk
  - Manrope

#### Text Effects

- Variable size
- Bold, italic
- Alignment (left, center, right, justified)
- Letter and line spacing
- Outline/stroke
- Texture fill
- Text on arc/curve

### 5. **Drawing Tools**

#### Brushes

- Pencil (solid stroke)
- Textured brush:
  - Dots
  - Crosshatch
  - Noise
  - Custom patterns
- Variable thickness (1-50px)
- Eraser

#### Shapes

- Rectangles
- Circles/ellipses
- Lines
- Polygons
- Arrows
- Solid or textured fill

### 6. **Icons and Emojis**

#### Libraries

- Font Awesome integration
- Material Icons
- Feather Icons
- Lucide Icons
- Native emojis converted to B&W
- Custom thermal icon library

#### Features

- Keyword search
- Organized categories
- Size adjustment
- Apply dithering effects

### 7. **Textures and Patterns**

#### Texture Library

- **Volumetric shadows:**
  - 25% gray (spaced dots)
  - 50% gray (checkerboard)
  - 75% gray (dense dots)
- **Retro patterns:**
  - Scanlines
  - CRT effect
  - Game Boy patterns
  - ZX Spectrum patterns
  - Commodore 64 patterns
- **Organic textures:**
  - Noise
  - Grain
  - Stipple
  - Hatching

#### Application

- Shape fill
- Image overlay
- Custom brushes
- Layer masks

### 8. **Project Management**

#### Save

- JSON format with all project information
- Export as PNG/JPG image (preview)
- Export as PDF
- Pre-designed templates

#### Load

- Open saved projects
- Import templates
- Recent projects history

### 9. **Printer Connection**

#### Pairing

- Automatic thermal printer detection
- Bluetooth connection
- USB connection
- Manual parameter configuration:
  - Paper width (58mm, 80mm)
  - Print density
  - Speed

#### Printing

- Final preview before printing
- Margin adjustment
- Number of copies
- Test print
- Real-time connection status

---

## Technology Stack

### Frontend

```typescript
// Astro + TypeScript
- Astro 4.x
- TypeScript 5.x
- Canvas API for editor
- Web Bluetooth API for connection
```

### Main Libraries

```bash
npm install mxw01-thermal-printer
npm install canvas
npm install fabric  # For canvas manipulation
npm install pica    # For image resizing
npm install jimp    # For image processing
```

### Image Processing

```typescript
// Custom dithering algorithms
- Floyd-Steinberg implementation
- Atkinson dithering
- Ordered dithering (Bayer matrix)
- Custom texture generators
```

---

## Neuro Core Design

### UI Principles

1. **Modern typography with tech feel**

   - Clean sans-serif headers
   - Variable font weights
   - Clear information hierarchy

2. **Sleek and functional layout**

   - Subtle borders with glow effects
   - Soft shadows and gradients
   - Balanced spacing with rhythm

3. **Blue-purple color palette**

   - Primary: Deep blue (#1E40AF, #3B82F6)
   - Secondary: Vibrant purple (#7C3AED, #A78BFA)
   - Accent: Cyan (#06B6D4)
   - Neutral: Dark slate (#0F172A, #1E293B, #334155)
   - Background: Near-black with blue tint (#0A0E1A)

4. **Visual elements**
   - Rounded corners with subtle radius
   - Neon glow effects on hover
   - Glassmorphism panels
   - Gradient borders
   - Smooth transitions and animations

### Component Structure

```
┌─────────────────────────────────────────┐
│  ⚡ THERMAL PRINT STUDIO                │ Neuro blue header
├─────────┬───────────────────┬───────────┤
│ TOOLS   │                   │  LAYERS   │ Glass panels
│ 🖼️      │                   │           │
│ [IMG]   │                   │  👁️ Layer3│
│ [TXT]   │     CANVAS        │  👁️ Layer2│
│ [DRAW]  │                   │  🔒 Layer1│
│ [ICON]  │                   │           │
│         │                   │  PROPS    │
│ EFFECTS │                   │  ╔══════╗ │ Gradient borders
│ ▼       │                   │  ║      ║ │
├─────────┴───────────────────┴───────────┤
│  [💾 SAVE] [📤 EXPORT] [🖨️ PRINT]      │ Glow on hover
└─────────────────────────────────────────┘
```

---

## User Flow

### 1. Start

```
New Project → Select size → Empty canvas
Open Project → Load JSON → Restore state
Template → Choose design → Customize
```

### 2. Design

```
Add elements → Apply effects → Organize layers
↓
Adjust dithering → Apply textures → Preview
↓
Refine details → Save versions
```

### 3. Print

```
Connect printer → Configure parameters → Preview
↓
Adjust density → Test print → Final print
```

---

## Unique Features

### 1. **Procedural Textures**

Real-time texture generation system to simulate volumes and shadows without actual grayscale.

### 2. **Retro Presets**

Collection of effects inspired by:

- 80s receipt printers
- Punk fanzines
- Vintage newspapers
- ASCII art
- 1-bit pixel art

### 3. **Experimental Mode**

- Glitch effects
- Datamoshing
- Artistic error diffusion
- Random texture generation

### 4. **Thermal Optimization**

Specific algorithms to maximize quality on thermal printers:

- Reduction of solid black areas (heat saving)
- Intelligent pixel distribution
- Prevention of banding and artifacts

---

## Astro Project Structure

```
thermal-print-studio/
├── src/
│   ├── components/
│   │   ├── Canvas.astro
│   │   ├── Toolbar.astro
│   │   ├── LayerPanel.astro
│   │   ├── PropertiesPanel.astro
│   │   ├── DitheringControls.astro
│   │   └── PrinterConnection.astro
│   ├── lib/
│   │   ├── dithering/
│   │   │   ├── floyd-steinberg.ts
│   │   │   ├── atkinson.ts
│   │   │   ├── ordered.ts
│   │   │   └── textures.ts
│   │   ├── canvas/
│   │   │   ├── layer-manager.ts
│   │   │   ├── drawing-tools.ts
│   │   │   └── transformations.ts
│   │   ├── printer/
│   │   │   ├── connection.ts
│   │   │   ├── commands.ts
│   │   │   └── preview.ts
│   │   └── utils/
│   │       ├── image-processing.ts
│   │       ├── export.ts
│   │       └── storage.ts
│   ├── styles/
│   │   ├── neuro-core.css
│   │   └── global.css
│   └── pages/
│       └── index.astro
├── public/
│   ├── textures/
│   ├── icons/
│   └── templates/
└── package.json
```

---

## Feature Roadmap

### MVP (v1.0)

1. Basic canvas with layers
2. Import images
3. Text with basic fonts
4. Floyd-Steinberg and Threshold dithering
5. Basic connection and printing
6. Save/load projects

### v1.5

1. Drawing tool
2. Multiple dithering methods
3. Basic textures
4. Icons and emojis
5. Advanced transformations

### v2.0

1. Complete procedural textures
2. Retro presets
3. Experimental mode
4. Pre-designed templates
5. Advanced export
6. Thermal optimization

---

This application combines the nostalgia of monochrome design with modern tools, offering a unique experience for creating printable art on thermal printers with a modern Neuro Core visual style featuring blue and purple tones.
