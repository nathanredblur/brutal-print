// Dithering types and constants

// Official DitherMethod types from mxw01-thermal-printer
// See: https://github.com/clementvp/mxw01-thermal-printer
export type DitherMethod =
  | "threshold"
  | "steinberg" // Floyd-Steinberg (official name in library)
  | "atkinson"
  | "bayer" // Ordered/Bayer (official name in library)
  | "pattern" // Halftone/Pattern (official name in library)
  | "none";

export interface ImageProcessingOptions {
  ditherMethod: DitherMethod;
  threshold: number; // 0-255
  invert: boolean;
  brightness: number; // 0-255, default 128
  contrast: number; // 0-200, default 100
  bayerMatrixSize?: number; // For Bayer dithering, 2-16
  halftoneCellSize?: number; // For halftone dithering, 2-16
}
