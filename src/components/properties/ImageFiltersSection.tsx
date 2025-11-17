/**
 * ImageFiltersSection - Complete image filters controls
 * Integrated within the properties panel
 */

import { memo, useState, useRef, useEffect, useCallback, type FC } from "react";
import type { ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Button } from "@/components/ui/button";
import { Sun, CircleOff } from "lucide-react";

// Constants outside component - no need for useMemo
const DITHER_METHODS = [
  { id: "threshold", name: "Threshold" },
  { id: "steinberg", name: "Floyd-Steinberg" },
  { id: "atkinson", name: "Atkinson" },
  { id: "bayer", name: "Bayer Matrix" },
  { id: "pattern", name: "Halftone" },
] as const;

// Shared slider className - defined once, used multiple times
const SLIDER_CLASS_NAME =
  "w-full h-1 bg-bg-secondary rounded-sm outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-purple-accent [&::-webkit-slider-thumb]:hover:shadow-[0_0_8px_rgba(167,139,250,0.4)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-purple-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:bg-purple-accent [&::-moz-range-thumb]:hover:shadow-[0_0_8px_rgba(167,139,250,0.4)]";

interface ImageFiltersSectionProps {
  layer: ImageLayer;
  onReprocessImageLayer: (
    layerId: string,
    newImageData: HTMLCanvasElement,
    updates: any
  ) => void;
}

const ImageFiltersSection: FC<ImageFiltersSectionProps> = ({
  layer,
  onReprocessImageLayer,
}) => {
  // Local state for immediate UI feedback
  const [threshold, setThreshold] = useState(layer.threshold || 128);
  const [brightness, setBrightness] = useState(layer.brightness ?? 128);
  const [contrast, setContrast] = useState(layer.contrast ?? 100);
  const [bayerMatrixSize, setBayerMatrixSize] = useState(
    layer.bayerMatrixSize ?? 4
  );
  const [halftoneCellSize, setHalftoneCellSize] = useState(
    layer.halftoneCellSize ?? 4
  );

  // Throttle refs to process every 100ms while dragging
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessTimeRef = useRef<number>(0);
  const pendingThresholdRef = useRef<number | null>(null);
  const pendingBrightnessRef = useRef<number | null>(null);
  const pendingContrastRef = useRef<number | null>(null);
  const pendingBayerMatrixRef = useRef<number | null>(null);
  const pendingHalftoneRef = useRef<number | null>(null);

  // Update local state when switching to a different image
  useEffect(() => {
    setThreshold(layer.threshold || 128);
    setBrightness(layer.brightness ?? 128);
    setContrast(layer.contrast ?? 100);
    setBayerMatrixSize(layer.bayerMatrixSize ?? 4);
    setHalftoneCellSize(layer.halftoneCellSize ?? 4);
    // Clear any pending values when switching images
    pendingThresholdRef.current = null;
    pendingBrightnessRef.current = null;
    pendingContrastRef.current = null;
    pendingBayerMatrixRef.current = null;
    pendingHalftoneRef.current = null;
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
  }, [layer.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  // Helper to trigger reprocessing with updated parameters
  const reprocessWithUpdates = useCallback(
    async (updates: any) => {
      const { reprocessImage } = await import("../../utils/imageReprocessor");

      const params = {
        ditherMethod: updates.ditherMethod || layer.ditherMethod,
        threshold:
          updates.threshold !== undefined ? updates.threshold : layer.threshold,
        invert: updates.invert !== undefined ? updates.invert : layer.invert,
        brightness:
          updates.brightness !== undefined
            ? updates.brightness
            : layer.brightness ?? 128,
        contrast:
          updates.contrast !== undefined
            ? updates.contrast
            : layer.contrast ?? 100,
        bayerMatrixSize:
          updates.bayerMatrixSize !== undefined
            ? updates.bayerMatrixSize
            : layer.bayerMatrixSize ?? 4,
        halftoneCellSize:
          updates.halftoneCellSize !== undefined
            ? updates.halftoneCellSize
            : layer.halftoneCellSize ?? 4,
        targetWidth: layer.width,
        targetHeight: layer.height,
      };

      try {
        const result = await reprocessImage(
          layer.originalImageData,
          params.ditherMethod as any,
          params
        );

        onReprocessImageLayer(layer.id, result.canvas, updates);
      } catch (error) {
        console.error("Failed to reprocess image:", error);
      }
    },
    [layer, onReprocessImageLayer]
  );

  // Throttled processing
  const processThrottled = useCallback(
    (updates: any) => {
      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTimeRef.current;
      const THROTTLE_MS = 100;

      if (timeSinceLastProcess >= THROTTLE_MS) {
        lastProcessTimeRef.current = now;
        reprocessWithUpdates(updates);
        if (updates.threshold !== undefined) pendingThresholdRef.current = null;
        if (updates.brightness !== undefined)
          pendingBrightnessRef.current = null;
        if (updates.contrast !== undefined) pendingContrastRef.current = null;
        if (updates.bayerMatrixSize !== undefined)
          pendingBayerMatrixRef.current = null;
        if (updates.halftoneCellSize !== undefined)
          pendingHalftoneRef.current = null;
      } else {
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
        }

        const delay = THROTTLE_MS - timeSinceLastProcess;
        throttleTimerRef.current = setTimeout(() => {
          lastProcessTimeRef.current = Date.now();

          const pendingUpdates: any = {};
          if (pendingThresholdRef.current !== null) {
            pendingUpdates.threshold = pendingThresholdRef.current;
            pendingThresholdRef.current = null;
          }
          if (pendingBrightnessRef.current !== null) {
            pendingUpdates.brightness = pendingBrightnessRef.current;
            pendingBrightnessRef.current = null;
          }
          if (pendingContrastRef.current !== null) {
            pendingUpdates.contrast = pendingContrastRef.current;
            pendingContrastRef.current = null;
          }
          if (pendingBayerMatrixRef.current !== null) {
            pendingUpdates.bayerMatrixSize = pendingBayerMatrixRef.current;
            pendingBayerMatrixRef.current = null;
          }
          if (pendingHalftoneRef.current !== null) {
            pendingUpdates.halftoneCellSize = pendingHalftoneRef.current;
            pendingHalftoneRef.current = null;
          }

          if (Object.keys(pendingUpdates).length > 0) {
            reprocessWithUpdates(pendingUpdates);
          }
        }, delay);
      }
    },
    [reprocessWithUpdates]
  );

  const handleDitherChange = useCallback(
    (method: string) => {
      reprocessWithUpdates({ ditherMethod: method });
    },
    [reprocessWithUpdates]
  );

  const handleThresholdChange = useCallback(
    (value: number) => {
      setThreshold(value);
      pendingThresholdRef.current = value;
      processThrottled({ threshold: value });
    },
    [processThrottled]
  );

  const handleThresholdRelease = useCallback(() => {
    if (pendingThresholdRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ threshold: pendingThresholdRef.current });
      pendingThresholdRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  }, [reprocessWithUpdates]);

  const handleBrightnessChange = useCallback(
    (value: number) => {
      setBrightness(value);
      pendingBrightnessRef.current = value;
      processThrottled({ brightness: value });
    },
    [processThrottled]
  );

  const handleBrightnessRelease = useCallback(() => {
    if (pendingBrightnessRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ brightness: pendingBrightnessRef.current });
      pendingBrightnessRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  }, [reprocessWithUpdates]);

  const handleContrastChange = useCallback(
    (value: number) => {
      setContrast(value);
      pendingContrastRef.current = value;
      processThrottled({ contrast: value });
    },
    [processThrottled]
  );

  const handleContrastRelease = useCallback(() => {
    if (pendingContrastRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ contrast: pendingContrastRef.current });
      pendingContrastRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  }, [reprocessWithUpdates]);

  const handleBayerMatrixChange = useCallback(
    (value: number) => {
      setBayerMatrixSize(value);
      pendingBayerMatrixRef.current = value;
      processThrottled({ bayerMatrixSize: value });
    },
    [processThrottled]
  );

  const handleBayerMatrixRelease = useCallback(() => {
    if (pendingBayerMatrixRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ bayerMatrixSize: pendingBayerMatrixRef.current });
      pendingBayerMatrixRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  }, [reprocessWithUpdates]);

  const handleHalftoneChange = useCallback(
    (value: number) => {
      setHalftoneCellSize(value);
      pendingHalftoneRef.current = value;
      processThrottled({ halftoneCellSize: value });
    },
    [processThrottled]
  );

  const handleHalftoneRelease = useCallback(() => {
    if (pendingHalftoneRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ halftoneCellSize: pendingHalftoneRef.current });
      pendingHalftoneRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  }, [reprocessWithUpdates]);

  const handleInvertToggle = useCallback(() => {
    reprocessWithUpdates({ invert: !layer.invert });
  }, [layer.invert, reprocessWithUpdates]);

  return (
    <PropertySection title="Filters" value="filters" icon={<Sun size={14} />}>
      {/* Dither Method */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          Dither Method
        </label>
        <select
          value={layer.ditherMethod}
          onChange={(e) => handleDitherChange(e.target.value)}
          className="w-full px-2 py-2 bg-bg-tertiary border border-border rounded-sm text-text-primary text-sm font-medium cursor-pointer transition-all duration-200 hover:border-purple-primary focus:outline-none focus:border-purple-primary focus:ring-2 focus:ring-purple-500/20"
        >
          {DITHER_METHODS.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* Threshold - for methods that use it */}
      {(layer.ditherMethod === "threshold" ||
        layer.ditherMethod === "steinberg" ||
        layer.ditherMethod === "atkinson" ||
        layer.ditherMethod === "bayer") && (
        <div className="flex flex-col gap-2">
          <label className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <span>Threshold</span>
            <span className="text-xs font-semibold text-purple-primary bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
              {threshold}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={threshold}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
            onPointerUp={handleThresholdRelease}
            onMouseUp={handleThresholdRelease}
            onTouchEnd={handleThresholdRelease}
            className={SLIDER_CLASS_NAME}
          />
        </div>
      )}

      {/* Bayer matrix size */}
      {layer.ditherMethod === "bayer" && (
        <div className="flex flex-col gap-2">
          <label className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <span>Matrix Size</span>
            <span className="text-xs font-semibold text-purple-primary bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
              {bayerMatrixSize}×{bayerMatrixSize}
            </span>
          </label>
          <input
            type="range"
            min="2"
            max="16"
            value={bayerMatrixSize}
            onChange={(e) => handleBayerMatrixChange(parseInt(e.target.value))}
            onPointerUp={handleBayerMatrixRelease}
            onMouseUp={handleBayerMatrixRelease}
            onTouchEnd={handleBayerMatrixRelease}
            className={SLIDER_CLASS_NAME}
          />
        </div>
      )}

      {/* Halftone cell size */}
      {layer.ditherMethod === "pattern" && (
        <div className="flex flex-col gap-2">
          <label className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <span>Cell Size</span>
            <span className="text-xs font-semibold text-purple-primary bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
              {halftoneCellSize}px
            </span>
          </label>
          <input
            type="range"
            min="2"
            max="16"
            value={halftoneCellSize}
            onChange={(e) => handleHalftoneChange(parseInt(e.target.value))}
            onPointerUp={handleHalftoneRelease}
            onMouseUp={handleHalftoneRelease}
            onTouchEnd={handleHalftoneRelease}
            className={SLIDER_CLASS_NAME}
          />
        </div>
      )}

      {/* Brightness */}
      <div className="flex flex-col gap-2">
        <label className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-wide">
          <span>Brightness</span>
          <span className="text-xs font-semibold text-purple-primary bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
            {brightness}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="255"
          value={brightness}
          onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
          onPointerUp={handleBrightnessRelease}
          onMouseUp={handleBrightnessRelease}
          onTouchEnd={handleBrightnessRelease}
          className={SLIDER_CLASS_NAME}
        />
      </div>

      {/* Contrast */}
      <div className="flex flex-col gap-2">
        <label className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-wide">
          <span>Contrast</span>
          <span className="text-xs font-semibold text-purple-primary bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
            {contrast}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={contrast}
          onChange={(e) => handleContrastChange(parseInt(e.target.value))}
          onPointerUp={handleContrastRelease}
          onMouseUp={handleContrastRelease}
          onTouchEnd={handleContrastRelease}
          className={SLIDER_CLASS_NAME}
        />
      </div>

      {/* Invert Toggle */}
      <div className="flex flex-col gap-2">
        <Button
          variant="neuro-ghost"
          className="w-full justify-start text-xs"
          onClick={handleInvertToggle}
        >
          <CircleOff size={16} />
          <span>Invert</span>
          <div
            className={`ml-auto w-8 h-4 rounded-full relative transition-all duration-200 ${
              layer.invert
                ? "bg-linear-to-br from-purple-dark to-blue-dark border-purple-primary"
                : "bg-bg-secondary border border-border"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 bg-text-primary rounded-full absolute top-0.5 transition-all duration-200 ${
                layer.invert ? "left-[18px]" : "left-0.5"
              }`}
            />
          </div>
        </Button>
      </div>
    </PropertySection>
  );
};

export default memo(ImageFiltersSection);
