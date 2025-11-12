/**
 * Layer System Types
 * 
 * Defines the structure for canvas layers (images, text, shapes)
 * This allows non-destructive editing and proper layer management
 */

export type LayerType = 'image' | 'text' | 'shape';

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
  type: 'image';
  imageData: HTMLCanvasElement; // Processed image ready to render
  originalImage?: HTMLImageElement;
  ditherMethod?: string;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  color: string;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'line';
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

