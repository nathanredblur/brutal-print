// Image processing utilities for thermal printer

import { CANVAS_WIDTH } from "../../constants/canvasStyles";
import type { ImageProcessingOptions } from "./types";
import { applyDithering } from "./algorithms";

/**
 * Adjust image brightness and contrast
 */
export function adjustImageBrightness(
  imageData: ImageData,
  brightness: number = 128,
  contrast: number = 100
): ImageData {
  const data = imageData.data;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessDelta = brightness - 128;

  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast
    data[i] = contrastFactor * (data[i] - 128) + 128;
    data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128;
    data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128;

    // Apply brightness
    data[i] += brightnessDelta;
    data[i + 1] += brightnessDelta;
    data[i + 2] += brightnessDelta;

    // Clamp values
    data[i] = Math.max(0, Math.min(255, data[i]));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
  }

  return imageData;
}

/**
 * Invert image colors
 */
export function invertImage(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

/**
 * Scale image to fit thermal printer width (384px)
 */
export function scaleImageToFit(
  image: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number = CANVAS_WIDTH,
  maintainAspectRatio: boolean = true
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  let width = targetWidth;
  let height = image.height;

  if (maintainAspectRatio) {
    const aspectRatio = image.width / image.height;
    height = Math.round(width / aspectRatio);
  }

  canvas.width = width;
  canvas.height = height;

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

/**
 * Rotate image by specified degrees (0, 90, 180, 270)
 */
export function rotateImage(
  image: HTMLImageElement | HTMLCanvasElement,
  degrees: 0 | 90 | 180 | 270
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Adjust canvas size based on rotation
  if (degrees === 90 || degrees === 270) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  // Rotate around center
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas;
}

/**
 * Process image with all options applied
 */
export function processImageForPrinter(
  image: HTMLImageElement,
  options: Partial<ImageProcessingOptions> = {}
): { canvas: HTMLCanvasElement; binaryData: boolean[][]; alphaMask: boolean[][] | null } {
  const defaults: ImageProcessingOptions = {
    ditherMethod: "steinberg",
    threshold: 128,
    invert: false,
    brightness: 128,
    contrast: 100,
  };

  const opts = { ...defaults, ...options };

  // Step 1: Scale to printer width
  const canvas = scaleImageToFit(image, CANVAS_WIDTH, true);

  // Step 2: Get image data
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Step 3: Extract alpha mask and composite transparent pixels against white.
  // This ensures transparent areas become white (no ink) during dithering
  // while preserving the original transparency info for canvas display.
  const alphaMask = extractAlphaAndFlatten(imageData);

  // Step 4: Apply brightness and contrast
  imageData = adjustImageBrightness(imageData, opts.brightness, opts.contrast);

  // Step 5: Invert if needed
  if (opts.invert) {
    imageData = invertImage(imageData);
  }

  // Step 6: Put processed data back
  ctx.putImageData(imageData, 0, 0);

  // Step 7: Apply dithering
  const binaryData = applyDithering(
    imageData,
    opts.ditherMethod,
    opts.threshold,
    opts.bayerMatrixSize,
    opts.halftoneCellSize
  );

  return { canvas, binaryData, alphaMask };
}

/**
 * Extract alpha mask from image data and composite transparent pixels
 * against white. Returns null for fully-opaque images (fast path).
 * Returns a 2D boolean mask (true = opaque) for images with transparency.
 * Mutates imageData in place: transparent pixels become white + opaque.
 */
function extractAlphaAndFlatten(imageData: ImageData): boolean[][] | null {
  const { data, width, height } = imageData;

  // Fast check: if all pixels are fully opaque, skip the full pass
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      hasTransparency = true;
      break;
    }
  }
  if (!hasTransparency) return null;

  const mask: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      row.push(alpha >= 128);

      if (alpha < 255) {
        const a = alpha / 255;
        data[idx] = Math.round(data[idx] * a + 255 * (1 - a));
        data[idx + 1] = Math.round(data[idx + 1] * a + 255 * (1 - a));
        data[idx + 2] = Math.round(data[idx + 2] * a + 255 * (1 - a));
        data[idx + 3] = 255;
      }
    }
    mask.push(row);
  }

  return mask;
}

/**
 * Convert boolean array to visual canvas for preview.
 * When alphaMask is provided, white pixels that were originally transparent
 * are rendered with alpha=0 to preserve transparency on the canvas.
 */
export function binaryDataToCanvas(
  binaryData: boolean[][],
  scale: number = 1,
  alphaMask?: boolean[][] | null,
): HTMLCanvasElement {
  const height = binaryData.length;
  const width = binaryData[0]?.length || 0;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Create ImageData for efficient pixel manipulation
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBlack = binaryData[y][x];
      const color = isBlack ? 0 : 255;
      const isOpaque = alphaMask ? alphaMask[y]?.[x] ?? true : true;
      // Transparent white pixels (background) get alpha=0
      const alpha = !isBlack && !isOpaque ? 0 : 255;

      // Fill scaled pixels
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const idx = ((y * scale + sy) * canvas.width + (x * scale + sx)) * 4;
          data[idx] = color;
          data[idx + 1] = color;
          data[idx + 2] = color;
          data[idx + 3] = alpha;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
