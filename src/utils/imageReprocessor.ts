/**
 * Image Reprocessor
 * 
 * Reprocesses images with different dithering methods
 * Maintains original image quality by using base64 stored data
 */

import { processImageForPrinter, binaryDataToCanvas } from '../lib/dithering';
import type { DitherMethod } from '../lib/dithering';
import { logger } from '../lib/logger';

export interface ReprocessOptions {
  threshold?: number;
  brightness?: number;
  contrast?: number;
  invert?: boolean;
}

export async function reprocessImage(
  originalImageData: string,
  ditherMethod: DitherMethod,
  options?: ReprocessOptions
): Promise<{ canvas: HTMLCanvasElement; binaryData: boolean[][] }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const { binaryData } = processImageForPrinter(img, {
          ditherMethod,
          threshold: options?.threshold ?? 128,
          brightness: options?.brightness ?? 128,
          contrast: options?.contrast ?? 100,
          invert: options?.invert ?? false,
        });

        // Create 1-bit dithered canvas for display
        const canvas = binaryDataToCanvas(binaryData, 1);

        logger.info('imageReprocessor', 'Image reprocessed', {
          ditherMethod,
          threshold: options?.threshold ?? 128,
          invert: options?.invert ?? false,
          size: { width: canvas.width, height: canvas.height },
        });

        resolve({ canvas, binaryData });
      } catch (error) {
        logger.error('imageReprocessor', 'Failed to reprocess image', error);
        reject(error);
      }
    };

    img.onerror = () => {
      const error = new Error('Failed to load original image');
      logger.error('imageReprocessor', 'Image load error', error);
      reject(error);
    };

    img.src = originalImageData;
  });
}

