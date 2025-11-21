/**
 * Canvas Styling Constants
 * Centralized constants for Fabric.js canvas appearance
 */

export const CANVAS_WIDTH = 384;

// Colors
export const SELECTION_COLOR = "rgba(167, 139, 250, 0.1)"; // purple-400 with 10% opacity
export const SELECTION_BORDER_COLOR = "#a78bfa"; // purple-400
export const HOVER_STROKE_COLOR = "#a78bfa"; // purple-400
export const CORNER_COLOR = "#a78bfa"; // purple-400

// Sizes
export const SELECTION_LINE_WIDTH = 2;
export const BORDER_SCALE_FACTOR = 2;
export const HOVER_STROKE_WIDTH = 2;
export const CORNER_SIZE = 10;

// Corner Style
export const CORNER_STYLE = "circle" as const;
export const TRANSPARENT_CORNERS = false;

/**
 * Helper function to get default border styling for Fabric.js objects
 * Apply this to all FabricImage and Textbox objects for consistent styling
 */
export function getDefaultObjectStyles() {
  return {
    borderColor: SELECTION_BORDER_COLOR,
    borderScaleFactor: BORDER_SCALE_FACTOR,
    cornerColor: CORNER_COLOR,
    cornerStyle: CORNER_STYLE,
    transparentCorners: TRANSPARENT_CORNERS,
    cornerSize: CORNER_SIZE,
    padding: HOVER_STROKE_WIDTH, // Prevent displacement on hover
  };
}
