/**
 * Shared font families configuration
 * Used across TextTool and TypographySection to ensure consistency
 */

export interface FontFamily {
  value: string; // Full CSS font-family value with fallbacks
  label: string; // Display name
}

// Font families with proper CSS fallbacks
export const FONT_FAMILIES: readonly FontFamily[] = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Space Grotesk, sans-serif", label: "Space Grotesk" },
  { value: "IBM Plex Mono, monospace", label: "IBM Plex Mono" },
  { value: "Space Mono, monospace", label: "Space Mono" },
  { value: "Courier Prime, monospace", label: "Courier Prime" },
] as const;

// Default font family
export const DEFAULT_FONT_FAMILY = "Inter, sans-serif";
