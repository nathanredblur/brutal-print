/**
 * Image Processing Default Values
 * Centralized constants for image processing across the application
 */

// Dithering defaults
export const DEFAULT_DITHER_METHOD = "steinberg" as const;
export const DEFAULT_THRESHOLD = 128;

// Brightness and Contrast defaults
export const DEFAULT_BRIGHTNESS = 128; // Range: 0-255
export const DEFAULT_CONTRAST = 100; // Range: 0-200

// Brightness and Contrast ranges
export const BRIGHTNESS_MIN = 0;
export const BRIGHTNESS_MAX = 255;
export const CONTRAST_MIN = 0;
export const CONTRAST_MAX = 200;

// Threshold range
export const THRESHOLD_MIN = 0;
export const THRESHOLD_MAX = 255;
