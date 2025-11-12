// Dithering algorithms based on catprinter implementation

import type { DitherMethod } from "./types";

/**
 * Apply threshold dithering
 * Simple black/white conversion based on threshold
 */
export function thresholdDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height, data } = imageData;
  const result: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Convert to grayscale
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      row.push(gray < threshold);
    }
    result.push(row);
  }

  return result;
}

/**
 * Floyd-Steinberg dithering
 * Distributes quantization error to neighboring pixels
 */
export function floydSteinbergDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height, data } = imageData;
  const result: boolean[][] = [];

  // Create a copy of grayscale values
  const gray: number[][] = [];
  for (let y = 0; y < height; y++) {
    gray[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y][x] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
  }

  // Apply Floyd-Steinberg dithering
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const oldPixel = gray[y][x];
      const newPixel = oldPixel < threshold ? 0 : 255;
      row.push(newPixel === 0);

      const error = oldPixel - newPixel;

      // Distribute error to neighbors
      if (x + 1 < width) {
        gray[y][x + 1] += (error * 7) / 16;
      }
      if (y + 1 < height) {
        if (x > 0) {
          gray[y + 1][x - 1] += (error * 3) / 16;
        }
        gray[y + 1][x] += (error * 5) / 16;
        if (x + 1 < width) {
          gray[y + 1][x + 1] += (error * 1) / 16;
        }
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Atkinson dithering
 * Similar to Floyd-Steinberg but distributes error differently
 */
export function atkinsonDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height, data } = imageData;
  const result: boolean[][] = [];

  // Create a copy of grayscale values
  const gray: number[][] = [];
  for (let y = 0; y < height; y++) {
    gray[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y][x] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
  }

  // Apply Atkinson dithering
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const oldPixel = gray[y][x];
      const newPixel = oldPixel < threshold ? 0 : 255;
      row.push(newPixel === 0);

      const error = (oldPixel - newPixel) / 8; // Atkinson uses 1/8 of error

      // Distribute error to neighbors (Atkinson pattern)
      if (x + 1 < width) gray[y][x + 1] += error;
      if (x + 2 < width) gray[y][x + 2] += error;

      if (y + 1 < height) {
        if (x > 0) gray[y + 1][x - 1] += error;
        gray[y + 1][x] += error;
        if (x + 1 < width) gray[y + 1][x + 1] += error;
      }

      if (y + 2 < height) {
        gray[y + 2][x] += error;
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Ordered (Bayer) dithering
 * Uses a threshold matrix for pattern-based dithering
 */
export function orderedDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height, data } = imageData;
  const result: boolean[][] = [];

  // 4x4 Bayer matrix (scaled to 0-255)
  const bayerMatrix = [
    [0, 128, 32, 160],
    [192, 64, 224, 96],
    [48, 176, 16, 144],
    [240, 112, 208, 80],
  ];

  const matrixSize = 4;

  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      const bayerValue = bayerMatrix[y % matrixSize][x % matrixSize];
      const adjustedThreshold = threshold + (bayerValue - 128) / 2;

      row.push(gray < adjustedThreshold);
    }
    result.push(row);
  }

  return result;
}

/**
 * Halftone dithering
 * Creates a halftone pattern effect
 */
export function halftoneDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height, data } = imageData;
  const result: boolean[][] = [];

  const cellSize = 4;

  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Calculate distance from center of halftone cell
      const cellX = x % cellSize;
      const cellY = y % cellSize;
      const centerX = cellSize / 2;
      const centerY = cellSize / 2;
      const distance = Math.sqrt(
        Math.pow(cellX - centerX, 2) + Math.pow(cellY - centerY, 2)
      );

      // Normalize distance and compare with gray value
      const normalizedDistance = (distance / (cellSize / 2)) * 255;

      row.push(gray < normalizedDistance);
    }
    result.push(row);
  }

  return result;
}

/**
 * Apply dithering method to image data
 * Method names match mxw01-thermal-printer library
 */
export function applyDithering(
  imageData: ImageData,
  method: DitherMethod,
  threshold: number = 128
): boolean[][] {
  switch (method) {
    case "threshold":
      return thresholdDither(imageData, threshold);
    case "steinberg": // Floyd-Steinberg (official name)
      return floydSteinbergDither(imageData, threshold);
    case "atkinson":
      return atkinsonDither(imageData, threshold);
    case "bayer": // Ordered/Bayer (official name)
      return orderedDither(imageData, threshold);
    case "pattern": // Halftone/Pattern (official name)
      return halftoneDither(imageData, threshold);
    case "none":
      return thresholdDither(imageData, 128); // Default to threshold
    default:
      return thresholdDither(imageData, threshold);
  }
}
