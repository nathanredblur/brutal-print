/**
 * ImageFiltersSection - Complete image filters controls
 * Integrated within the properties panel
 */

import { useState, useRef, useEffect, type FC } from "react";
import type { ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";

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

  const ditherMethods = [
    { id: "threshold", name: "Threshold" },
    { id: "steinberg", name: "Floyd-Steinberg" },
    { id: "atkinson", name: "Atkinson" },
    { id: "bayer", name: "Bayer Matrix" },
    { id: "pattern", name: "Halftone" },
  ];

  // Helper to trigger reprocessing with updated parameters
  const reprocessWithUpdates = async (updates: any) => {
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
        updates.contrast !== undefined ? updates.contrast : layer.contrast ?? 100,
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
  };

  // Throttled processing
  const processThrottled = (updates: any) => {
    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTimeRef.current;
    const THROTTLE_MS = 100;

    if (timeSinceLastProcess >= THROTTLE_MS) {
      lastProcessTimeRef.current = now;
      reprocessWithUpdates(updates);
      if (updates.threshold !== undefined) pendingThresholdRef.current = null;
      if (updates.brightness !== undefined) pendingBrightnessRef.current = null;
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
  };

  const handleDitherChange = (method: string) => {
    reprocessWithUpdates({ ditherMethod: method });
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    pendingThresholdRef.current = value;
    processThrottled({ threshold: value });
  };

  const handleThresholdRelease = () => {
    if (pendingThresholdRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ threshold: pendingThresholdRef.current });
      pendingThresholdRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    pendingBrightnessRef.current = value;
    processThrottled({ brightness: value });
  };

  const handleBrightnessRelease = () => {
    if (pendingBrightnessRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ brightness: pendingBrightnessRef.current });
      pendingBrightnessRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  const handleContrastChange = (value: number) => {
    setContrast(value);
    pendingContrastRef.current = value;
    processThrottled({ contrast: value });
  };

  const handleContrastRelease = () => {
    if (pendingContrastRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ contrast: pendingContrastRef.current });
      pendingContrastRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  const handleBayerMatrixChange = (value: number) => {
    setBayerMatrixSize(value);
    pendingBayerMatrixRef.current = value;
    processThrottled({ bayerMatrixSize: value });
  };

  const handleBayerMatrixRelease = () => {
    if (pendingBayerMatrixRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ bayerMatrixSize: pendingBayerMatrixRef.current });
      pendingBayerMatrixRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  const handleHalftoneChange = (value: number) => {
    setHalftoneCellSize(value);
    pendingHalftoneRef.current = value;
    processThrottled({ halftoneCellSize: value });
  };

  const handleHalftoneRelease = () => {
    if (pendingHalftoneRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ halftoneCellSize: pendingHalftoneRef.current });
      pendingHalftoneRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  return (
    <PropertySection
      title="Filters"
      defaultExpanded={false}
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m5.2-13.2l-2.9 2.9m-2.6 2.6l-2.9 2.9m7.8 0l-2.9-2.9m-2.6-2.6l-2.9-2.9" />
        </svg>
      }
    >
      {/* Dither Method */}
      <div className="filter-group">
        <label className="filter-label-small">Dither Method</label>
        <select
          value={layer.ditherMethod}
          onChange={(e) => handleDitherChange(e.target.value)}
          className="filter-select"
        >
          {ditherMethods.map((method) => (
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
        <div className="filter-group">
          <label className="filter-label-small">
            Threshold
            <span className="filter-value-small">{threshold}</span>
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
            className="filter-slider"
          />
        </div>
      )}

      {/* Bayer matrix size */}
      {layer.ditherMethod === "bayer" && (
        <div className="filter-group">
          <label className="filter-label-small">
            Matrix Size
            <span className="filter-value-small">
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
            className="filter-slider"
          />
        </div>
      )}

      {/* Halftone cell size */}
      {layer.ditherMethod === "pattern" && (
        <div className="filter-group">
          <label className="filter-label-small">
            Cell Size
            <span className="filter-value-small">{halftoneCellSize}px</span>
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
            className="filter-slider"
          />
        </div>
      )}

      {/* Brightness */}
      <div className="filter-group">
        <label className="filter-label-small">
          Brightness
          <span className="filter-value-small">{brightness}</span>
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
          className="filter-slider"
        />
      </div>

      {/* Contrast */}
      <div className="filter-group">
        <label className="filter-label-small">
          Contrast
          <span className="filter-value-small">{contrast}%</span>
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
          className="filter-slider"
        />
      </div>

      {/* Invert Toggle */}
      <div className="filter-group">
        <button
          className="invert-toggle"
          onClick={() => reprocessWithUpdates({ invert: !layer.invert })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
          </svg>
          <span>Invert</span>
          <div className={`toggle-switch ${layer.invert ? "active" : ""}`}>
            <div className="toggle-handle" />
          </div>
        </button>
      </div>

      <style>{`
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label-small {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-value-small {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-purple-primary);
          background: rgba(167, 139, 250, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }

        .filter-select {
          width: 100%;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
        }

        .filter-select:hover {
          border-color: var(--color-purple-primary);
        }

        .filter-slider {
          width: 100%;
          height: 4px;
          background: var(--color-bg-secondary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .filter-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-slider::-webkit-slider-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.4);
        }

        .filter-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .filter-slider::-moz-range-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.4);
        }

        .invert-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .invert-toggle:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .toggle-switch {
          margin-left: auto;
          width: 32px;
          height: 16px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          position: relative;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active {
          background: linear-gradient(135deg, var(--color-purple-dark) 0%, var(--color-blue-dark) 100%);
          border-color: var(--color-purple-primary);
        }

        .toggle-handle {
          width: 10px;
          height: 10px;
          background: var(--color-text-primary);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active .toggle-handle {
          left: 18px;
        }
      `}</style>
    </PropertySection>
  );
};

export default ImageFiltersSection;

