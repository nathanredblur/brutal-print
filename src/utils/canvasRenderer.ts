/**
 * Canvas Renderer Utilities
 * 
 * Handles rendering all layers to the canvas in the correct order
 * with proper transformations and styles.
 * 
 * Images are rendered with dithering applied to show 1-bit preview
 * (what will actually print on the thermal printer)
 */

import type { Layer, ImageLayer, TextLayer } from '../types/layer';
import { logger } from '../lib/logger';

export function renderLayers(
  canvas: HTMLCanvasElement,
  layers: Layer[],
  selectedLayerId?: string | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render layers from bottom to top
  const visibleLayers = layers.filter(layer => layer.visible);
  
  logger.debug('canvasRenderer', 'Rendering layers', {
    total: layers.length,
    visible: visibleLayers.length,
  });

  visibleLayers.forEach(layer => {
    ctx.save();

    // Apply opacity
    ctx.globalAlpha = layer.opacity;

    // Apply transformations
    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.translate(-(layer.x + layer.width / 2), -(layer.y + layer.height / 2));

    // Render based on type
    switch (layer.type) {
      case 'image':
        renderImageLayer(ctx, layer as ImageLayer);
        break;
      case 'text':
        renderTextLayer(ctx, layer as TextLayer);
        break;
      // case 'shape': implement later
    }

    // Draw selection outline if selected
    if (selectedLayerId && layer.id === selectedLayerId && !layer.locked) {
      drawSelectionOutline(ctx, layer);
    }

    ctx.restore();
  });

  // Draw canvas border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function renderImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer): void {
  try {
    // Image is already processed with dithering (1-bit black and white)
    // from ImageUploader, so we just draw it directly
    ctx.drawImage(
      layer.imageData,
      layer.x,
      layer.y,
      layer.width,
      layer.height
    );
    
    // Note: The imageData already contains the dithered version
    // This ensures WYSIWYG - What You See Is What You Get (printed)
  } catch (error) {
    logger.error('canvasRenderer', 'Failed to render image layer', error);
  }
}

function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  try {
    // Force black text for 1-bit printing (thermal printers only print black)
    // Even if layer.color is set to something else, we render in pure black
    ctx.fillStyle = '#000000';
    ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
    ctx.textAlign = layer.align;

    const lines = layer.text.split('\n');
    const lineHeight = layer.fontSize * 1.2;

    lines.forEach((line, index) => {
      ctx.fillText(line, layer.x, layer.y + (index * lineHeight));
    });
    
    // Note: Text is rendered in pure black to match thermal printer output
    // This ensures WYSIWYG - What You See Is What You Get (printed)
  } catch (error) {
    logger.error('canvasRenderer', 'Failed to render text layer', error);
  }
}

function drawSelectionOutline(ctx: CanvasRenderingContext2D, layer: Layer): void {
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
  ctx.setLineDash([]);

  // Draw corner handles
  const handleSize = 8;
  const corners = [
    { x: layer.x, y: layer.y }, // Top-left
    { x: layer.x + layer.width, y: layer.y }, // Top-right
    { x: layer.x, y: layer.y + layer.height }, // Bottom-left
    { x: layer.x + layer.width, y: layer.y + layer.height }, // Bottom-right
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;

  corners.forEach(corner => {
    ctx.fillRect(
      corner.x - handleSize / 2,
      corner.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      corner.x - handleSize / 2,
      corner.y - handleSize / 2,
      handleSize,
      handleSize
    );
  });
}

export function renderWelcomeMessage(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ THERMAL', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText('PRINT STUDIO', canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('384px × Variable Height', canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText('1-bit Monochrome', canvas.width / 2, canvas.height / 2 + 50);
  ctx.fillText('Add images and text to start', canvas.width / 2, canvas.height / 2 + 80);

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
}

