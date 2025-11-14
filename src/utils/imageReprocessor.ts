/**
 * Image Reprocessor
 *
 * Reprocesses images with different dithering methods
 * Maintains original image quality by using base64 stored data
 */

import { processImageForPrinter, binaryDataToCanvas } from "../lib/dithering";
import type { DitherMethod } from "../lib/dithering";
import { logger } from "../lib/logger";

export interface ReprocessOptions {
  threshold?: number;
  brightness?: number;
  contrast?: number;
  invert?: boolean;
  targetWidth?: number;
  targetHeight?: number;
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
        // Scale image to target dimensions if provided
        if (options?.targetWidth && options?.targetHeight) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = options.targetWidth;
          tempCanvas.height = options.targetHeight;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) {
            reject(new Error("Failed to get 2d context"));
            return;
          }

          // Draw with high quality scaling
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = "high";
          tempCtx.drawImage(
            img,
            0,
            0,
            options.targetWidth,
            options.targetHeight
          );

          // Create a new image from the scaled canvas
          const scaledImg = new Image();
          scaledImg.onload = () => {
            processImageWithDither(
              scaledImg,
              options.targetWidth,
              options.targetHeight
            );
          };
          scaledImg.onerror = () => {
            reject(new Error("Failed to scale image"));
          };
          scaledImg.src = tempCanvas.toDataURL();
        } else {
          processImageWithDither(img);
        }
      } catch (error) {
        logger.error("imageReprocessor", "Failed to reprocess image", error);
        reject(error);
      }
    };

    function processImageWithDither(
      imgToProcess: HTMLImageElement,
      expectedWidth?: number,
      expectedHeight?: number
    ) {
      try {
        const { binaryData } = processImageForPrinter(imgToProcess, {
          ditherMethod,
          threshold: options?.threshold ?? 128,
          brightness: options?.brightness ?? 128,
          contrast: options?.contrast ?? 100,
          invert: options?.invert ?? false,
        });

        // Create 1-bit dithered canvas for display
        const canvas = binaryDataToCanvas(binaryData, 1);

        // Verify the canvas has the expected dimensions
        if (expectedWidth && expectedHeight) {
          if (
            canvas.width !== expectedWidth ||
            canvas.height !== expectedHeight
          ) {
            logger.warn("imageReprocessor", "Canvas size mismatch, resizing", {
              expected: `${expectedWidth}x${expectedHeight}`,
              actual: `${canvas.width}x${canvas.height}`,
            });

            // Ensure exact dimensions by resizing if needed
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = expectedWidth;
            finalCanvas.height = expectedHeight;
            const ctx = finalCanvas.getContext("2d");
            if (ctx) {
              ctx.imageSmoothingEnabled = false; // Keep pixel-perfect for 1-bit images
              ctx.drawImage(canvas, 0, 0, expectedWidth, expectedHeight);

              logger.info("imageReprocessor", "Image reprocessed and resized", {
                ditherMethod,
                threshold: options?.threshold ?? 128,
                invert: options?.invert ?? false,
                size: { width: finalCanvas.width, height: finalCanvas.height },
              });

              resolve({ canvas: finalCanvas, binaryData });
              return;
            }
          }
        }

        logger.info("imageReprocessor", "Image reprocessed", {
          ditherMethod,
          threshold: options?.threshold ?? 128,
          invert: options?.invert ?? false,
          size: { width: canvas.width, height: canvas.height },
          scaled: options?.targetWidth ? true : false,
        });

        resolve({ canvas, binaryData });
      } catch (error) {
        logger.error(
          "imageReprocessor",
          "Failed to process image with dither",
          error
        );
        reject(error);
      }
    }

    img.onerror = () => {
      const error = new Error("Failed to load original image");
      logger.error("imageReprocessor", "Image load error", error);
      reject(error);
    };

    img.src = originalImageData;
  });
}
