/**
 * Image Reprocessor
 * 
 * Reprocesses images with different dithering methods
 * Maintains original image quality by using base64 stored data
 */

import { processImageForPrinter } from '../lib/dithering';
import type { DitherMethod } from '../lib/dithering';
import { logger } from '../lib/logger';

export async function reprocessImage(
  originalImageData: string,
  ditherMethod: DitherMethod,
  options?: {
    threshold?: number;
    brightness?: number;
    contrast?: number;
    invert?: boolean;
  }
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const { canvas } = processImageForPrinter(img, {
          ditherMethod,
          threshold: options?.threshold ?? 128,
          brightness: options?.brightness ?? 128,
          contrast: options?.contrast ?? 100,
          invert: options?.invert ?? false,
        });

        logger.info('imageReprocessor', 'Image reprocessed', {
          ditherMethod,
          size: { width: canvas.width, height: canvas.height },
        });

        resolve(canvas);
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

