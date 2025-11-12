// Dithering types and constants

export const PRINTER_WIDTH = 384;
export const PRINTER_WIDTH_BYTES = PRINTER_WIDTH / 8; // 48 bytes
export const MIN_DATA_BYTES = 90 * PRINTER_WIDTH_BYTES; // 4320 bytes minimum

// Official DitherMethod types from mxw01-thermal-printer
// See: https://github.com/clementvp/mxw01-thermal-printer
export type DitherMethod = 
  | 'threshold'
  | 'steinberg'  // Floyd-Steinberg (official name in library)
  | 'atkinson'
  | 'bayer'      // Ordered/Bayer (official name in library)
  | 'pattern'    // Halftone/Pattern (official name in library)
  | 'none';

// Legacy names for backwards compatibility
export type DitherMethodLegacy = 
  | 'floydSteinberg'  // Use 'steinberg' instead
  | 'ordered'         // Use 'bayer' instead
  | 'halftone';       // Use 'pattern' instead

export interface ImageProcessingOptions {
  ditherMethod: DitherMethod;
  threshold: number; // 0-255
  invert: boolean;
  brightness: number; // 0-255, default 128
  contrast: number; // 0-200, default 100
}

export interface PrintOptions {
  dither?: DitherMethod;
  rotate?: 0 | 90 | 180 | 270;
  flip?: 'none' | 'h' | 'v' | 'both';
  brightness?: number;
  intensity?: number; // Print head heat intensity
}

