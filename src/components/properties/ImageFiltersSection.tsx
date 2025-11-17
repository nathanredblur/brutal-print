/**
 * ImageFiltersSection - Complete image filters controls
 * Integrated within the properties panel
 */

import { memo, useState, useRef, useEffect, useCallback, type FC } from "react";
import type { ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sun, CircleOff } from "lucide-react";

// Constants outside component - no need for useMemo
const DITHER_METHODS = [
  { id: "threshold", name: "Threshold" },
  { id: "steinberg", name: "Floyd-Steinberg" },
  { id: "atkinson", name: "Atkinson" },
  { id: "bayer", name: "Bayer Matrix" },
  { id: "pattern", name: "Halftone" },
] as const;

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
    (value: string) => {
      reprocessWithUpdates({ ditherMethod: value });
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
        <Select value={layer.ditherMethod} onValueChange={handleDitherChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DITHER_METHODS.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Slider
            min={0}
            max={255}
            value={[threshold]}
            onValueChange={(values) => handleThresholdChange(values[0])}
            onValueCommit={handleThresholdRelease}
            className="w-full"
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
          <Slider
            min={2}
            max={16}
            value={[bayerMatrixSize]}
            onValueChange={(values) => handleBayerMatrixChange(values[0])}
            onValueCommit={handleBayerMatrixRelease}
            className="w-full"
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
          <Slider
            min={2}
            max={16}
            value={[halftoneCellSize]}
            onValueChange={(values) => handleHalftoneChange(values[0])}
            onValueCommit={handleHalftoneRelease}
            className="w-full"
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
        <Slider
          min={0}
          max={255}
          value={[brightness]}
          onValueChange={(values) => handleBrightnessChange(values[0])}
          onValueCommit={handleBrightnessRelease}
          className="w-full"
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
        <Slider
          min={0}
          max={200}
          value={[contrast]}
          onValueChange={(values) => handleContrastChange(values[0])}
          onValueCommit={handleContrastRelease}
          className="w-full"
        />
      </div>

      {/* Invert Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="invert-toggle"
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide cursor-pointer"
        >
          <CircleOff size={16} />
          <span>Invert Colors</span>
        </label>
        <Switch
          id="invert-toggle"
          checked={layer.invert}
          onCheckedChange={handleInvertToggle}
        />
      </div>
    </PropertySection>
  );
};

export default memo(ImageFiltersSection);
