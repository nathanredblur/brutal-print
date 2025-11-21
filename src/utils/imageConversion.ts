/**
 * Image Conversion Utilities
 * Utilities for converting between different image formats
 */

import { logger } from "../lib/logger";

/**
 * Convert base64 string to HTMLImageElement
 * @param base64 - Base64 encoded image string (data URL)
 * @returns Promise that resolves to HTMLImageElement
 */
export function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      logger.debug("imageConversion", "Image loaded from base64", {
        width: img.width,
        height: img.height,
      });
      resolve(img);
    };

    img.onerror = (error) => {
      logger.error(
        "imageConversion",
        "Failed to load image from base64",
        error
      );
      reject(new Error("Failed to load image from base64"));
    };

    img.src = base64;
  });
}

/**
 * Convert HTMLImageElement to HTMLCanvasElement
 * @param image - HTMLImageElement to convert
 * @param width - Optional width (defaults to image width)
 * @param height - Optional height (defaults to image height)
 * @returns HTMLCanvasElement with the image drawn on it
 */
export function imageToCanvas(
  image: HTMLImageElement,
  width?: number,
  height?: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width ?? image.width;
  canvas.height = height ?? image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  logger.debug("imageConversion", "Image converted to canvas", {
    width: canvas.width,
    height: canvas.height,
  });

  return canvas;
}

/**
 * Convert HTMLCanvasElement to base64 string
 * @param canvas - HTMLCanvasElement to convert
 * @param format - Image format (default: "image/png")
 * @param quality - Image quality for lossy formats (0-1)
 * @returns Base64 encoded image string (data URL)
 */
export function canvasToBase64(
  canvas: HTMLCanvasElement,
  format: string = "image/png",
  quality?: number
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Get ImageData from HTMLCanvasElement
 * @param canvas - HTMLCanvasElement to extract ImageData from
 * @returns ImageData object
 */
export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Put ImageData back into a canvas
 * @param imageData - ImageData to put on canvas
 * @param canvas - Optional existing canvas (creates new one if not provided)
 * @returns HTMLCanvasElement with the ImageData drawn on it
 */
export function imageDataToCanvas(
  imageData: ImageData,
  canvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const targetCanvas = canvas || document.createElement("canvas");
  targetCanvas.width = imageData.width;
  targetCanvas.height = imageData.height;

  const ctx = targetCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.putImageData(imageData, 0, 0);

  return targetCanvas;
}

/**
 * Convert base64 string directly to HTMLCanvasElement
 * @param base64 - Base64 encoded image string (data URL)
 * @param width - Optional width
 * @param height - Optional height
 * @returns Promise that resolves to HTMLCanvasElement
 */
export async function base64ToCanvas(
  base64: string,
  width?: number,
  height?: number
): Promise<HTMLCanvasElement> {
  const image = await base64ToImage(base64);
  return imageToCanvas(image, width, height);
}
