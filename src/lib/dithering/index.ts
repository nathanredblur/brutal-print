// Dithering library main exports

export * from './types';
export * from './algorithms';
export * from './imageProcessing';

// Re-export commonly used functions
export {
  PRINTER_WIDTH,
  PRINTER_WIDTH_BYTES,
  MIN_DATA_BYTES,
  type DitherMethod,
  type ImageProcessingOptions,
  type PrintOptions,
} from './types';

export {
  thresholdDither,
  floydSteinbergDither,
  atkinsonDither,
  orderedDither,
  halftoneDither,
  applyDithering,
} from './algorithms';

export {
  adjustImageBrightness,
  invertImage,
  scaleImageToFit,
  rotateImage,
  processImageForPrinter,
  binaryDataToCanvas,
} from './imageProcessing';

