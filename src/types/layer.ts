/**
 * Layer System Types
 *
 * Defines the structure for canvas layers (images, text, shapes)
 * This allows non-destructive editing and proper layer management
 */

export type LayerType = "image" | "text" | "shape";

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number; // 0-1
  rotation: number; // degrees
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  imageData: HTMLCanvasElement; // Processed 1-bit image ready to render
  originalImageData: string; // Base64 of original image for reprocessing
  ditherMethod: string; // Current dithering method applied
  threshold: number; // Threshold value (0-255)
  invert: boolean; // Whether image is inverted
  brightness?: number; // Brightness (0-255, default 128)
  contrast?: number; // Contrast (0-200, default 100)
  bayerMatrixSize?: number; // Bayer matrix size (2-16, default 4)
  halftoneCellSize?: number; // Halftone cell size (2-16, default 4)
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  color: string;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rectangle" | "circle" | "line";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer;

export interface LayerState {
  layers: Layer[];
  selectedLayerId: string | null;
  nextId: number;
}
