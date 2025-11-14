// Optimized dithering algorithms using TypedArrays and better performance techniques

import type { DitherMethod } from "./types";

/**
 * Convert RGBA imageData to grayscale using weighted luminance formula
 * Uses TypedArray for better performance
 */
function toGrayscale(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const gray = new Uint8Array(width * height);
  const len = width * height;
  
  // Use weighted luminance: 0.299R + 0.587G + 0.114B
  // Optimized with bit shifts: (77R + 150G + 29B) >> 8
  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    gray[i] = (77 * data[idx] + 150 * data[idx + 1] + 29 * data[idx + 2]) >> 8;
  }
  
  return gray;
}

/**
 * Clamp value between 0 and 255
 */
function clamp(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

/**
 * Apply threshold dithering (optimized)
 */
export function thresholdDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height } = imageData;
  const gray = toGrayscale(imageData.data, width, height);
  const result: boolean[][] = new Array(height);
  
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      row[x] = gray[rowOffset + x] < threshold;
    }
    result[y] = row;
  }
  
  return result;
}

/**
 * Floyd-Steinberg dithering (optimized with Float32Array for error diffusion)
 */
export function floydSteinbergDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height } = imageData;
  const gray = new Float32Array(toGrayscale(imageData.data, width, height));
  const result: boolean[][] = new Array(height);
  
  // Pre-calculate error fractions
  const e7_16 = 7 / 16;
  const e3_16 = 3 / 16;
  const e5_16 = 5 / 16;
  const e1_16 = 1 / 16;
  
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const idx = y * width;
    const nextRowIdx = idx + width;
    
    for (let x = 0; x < width; x++) {
      const i = idx + x;
      const oldPixel = gray[i];
      const newPixel = oldPixel < threshold ? 0 : 255;
      row[x] = newPixel === 0;
      
      const error = oldPixel - newPixel;
      
      // Distribute error to neighbors
      if (x + 1 < width) {
        gray[i + 1] += error * e7_16;
      }
      if (y + 1 < height) {
        if (x > 0) {
          gray[nextRowIdx + x - 1] += error * e3_16;
        }
        gray[nextRowIdx + x] += error * e5_16;
        if (x + 1 < width) {
          gray[nextRowIdx + x + 1] += error * e1_16;
        }
      }
    }
    result[y] = row;
  }
  
  return result;
}

/**
 * Atkinson dithering (optimized)
 */
export function atkinsonDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height } = imageData;
  const gray = new Float32Array(toGrayscale(imageData.data, width, height));
  const result: boolean[][] = new Array(height);
  
  // Atkinson uses 1/8 of error
  const errorFraction = 1 / 8;
  
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const idx = y * width;
    const nextRowIdx = idx + width;
    const nextNextRowIdx = idx + width * 2;
    
    for (let x = 0; x < width; x++) {
      const i = idx + x;
      const oldPixel = gray[i];
      const newPixel = oldPixel < threshold ? 0 : 255;
      row[x] = newPixel === 0;
      
      const error = (oldPixel - newPixel) * errorFraction;
      
      // Distribute error (Atkinson pattern)
      if (x + 1 < width) gray[i + 1] += error;
      if (x + 2 < width) gray[i + 2] += error;
      
      if (y + 1 < height) {
        if (x > 0) gray[nextRowIdx + x - 1] += error;
        gray[nextRowIdx + x] += error;
        if (x + 1 < width) gray[nextRowIdx + x + 1] += error;
      }
      
      if (y + 2 < height) {
        gray[nextNextRowIdx + x] += error;
      }
    }
    result[y] = row;
  }
  
  return result;
}

/**
 * Ordered (Bayer) dithering (optimized with flat Bayer matrix)
 */
export function orderedDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height } = imageData;
  const gray = toGrayscale(imageData.data, width, height);
  const result: boolean[][] = new Array(height);
  
  // Flat 4x4 Bayer matrix for better cache performance
  const bayer = new Uint8Array([
    0, 128, 32, 160,
    192, 64, 224, 96,
    48, 176, 16, 144,
    240, 112, 208, 80
  ]);
  
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const rowOffset = y * width;
    const bayerRowOffset = (y & 3) << 2; // (y % 4) * 4, optimized with bitwise
    
    for (let x = 0; x < width; x++) {
      const grayValue = gray[rowOffset + x];
      const bayerValue = bayer[bayerRowOffset + (x & 3)]; // x % 4, optimized
      const adjustedThreshold = threshold + ((bayerValue - 128) >> 1);
      row[x] = grayValue < adjustedThreshold;
    }
    result[y] = row;
  }
  
  return result;
}

/**
 * Halftone dithering (optimized with lookup)
 */
export function halftoneDither(
  imageData: ImageData,
  threshold: number = 128
): boolean[][] {
  const { width, height } = imageData;
  const gray = toGrayscale(imageData.data, width, height);
  const result: boolean[][] = new Array(height);
  
  const cellSize = 4;
  const halfCell = cellSize / 2;
  
  // Pre-calculate distance values for 4x4 cell
  const distances = new Float32Array(cellSize * cellSize);
  for (let cy = 0; cy < cellSize; cy++) {
    for (let cx = 0; cx < cellSize; cx++) {
      const dx = cx - halfCell;
      const dy = cy - halfCell;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distances[cy * cellSize + cx] = (dist / halfCell) * 255;
    }
  }
  
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const rowOffset = y * width;
    const cellY = y % cellSize;
    
    for (let x = 0; x < width; x++) {
      const cellX = x % cellSize;
      const normalizedDistance = distances[cellY * cellSize + cellX];
      row[x] = gray[rowOffset + x] < normalizedDistance;
    }
    result[y] = row;
  }
  
  return result;
}

/**
 * Apply dithering method to image data (optimized router)
 */
export function applyDithering(
  imageData: ImageData,
  method: DitherMethod,
  threshold: number = 128
): boolean[][] {
  switch (method) {
    case "threshold":
      return thresholdDither(imageData, threshold);
    case "steinberg":
      return floydSteinbergDither(imageData, threshold);
    case "atkinson":
      return atkinsonDither(imageData, threshold);
    case "bayer":
      return orderedDither(imageData, threshold);
    case "pattern":
      return halftoneDither(imageData, threshold);
    case "none":
      return thresholdDither(imageData, 128);
    default:
      return thresholdDither(imageData, threshold);
  }
}
