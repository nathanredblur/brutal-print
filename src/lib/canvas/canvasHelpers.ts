// Canvas helper utilities
import { PRINTER_WIDTH } from '../dithering';

/**
 * Create a new canvas with thermal printer dimensions
 */
export function createThermalCanvas(height: number = 800): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PRINTER_WIDTH;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
}

/**
 * Clear canvas with white background
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Add text to canvas
 */
export function addTextToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    fontSize?: number;
    color?: string;
    align?: CanvasTextAlign;
    bold?: boolean;
  } = {}
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const {
    font = 'Inter, sans-serif',
    fontSize = 16,
    color = '#000000',
    align = 'left',
    bold = false,
  } = options;
  
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${fontSize}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/**
 * Draw border on canvas
 */
export function drawBorder(
  canvas: HTMLCanvasElement,
  padding: number = 10,
  color: string = '#cccccc',
  width: number = 1
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);
}

/**
 * Get canvas as ImageData
 */
export function getCanvasImageData(canvas: HTMLCanvasElement): ImageData | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Download canvas as image
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'thermal-print.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Resize canvas maintaining content
 */
export function resizeCanvas(canvas: HTMLCanvasElement, newHeight: number): HTMLCanvasElement {
  const oldCanvas = canvas.cloneNode(true) as HTMLCanvasElement;
  const oldCtx = oldCanvas.getContext('2d');
  const newCtx = canvas.getContext('2d');
  
  if (!oldCtx || !newCtx) return canvas;
  
  // Save old content
  const imageData = oldCtx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Resize
  canvas.height = newHeight;
  
  // Clear with white
  newCtx.fillStyle = '#ffffff';
  newCtx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Restore old content
  newCtx.putImageData(imageData, 0, 0);
  
  return canvas;
}

/**
 * Merge multiple canvases vertically
 */
export function mergeCanvasesVertically(canvases: HTMLCanvasElement[]): HTMLCanvasElement {
  if (canvases.length === 0) {
    return createThermalCanvas();
  }
  
  if (canvases.length === 1) {
    return canvases[0];
  }
  
  // Calculate total height
  const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);
  
  // Create new canvas
  const mergedCanvas = createThermalCanvas(totalHeight);
  const ctx = mergedCanvas.getContext('2d');
  
  if (!ctx) return mergedCanvas;
  
  // Draw all canvases
  let currentY = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, currentY);
    currentY += canvas.height;
  }
  
  return mergedCanvas;
}

