/**
 * FilterPanel Component - Advanced image filter controls
 * Shown in left panel when clicking "Filters" button in context bar
 */

import { useState, useRef, useEffect } from "react";
import type { FC } from "react";
import type { ImageLayer } from "../types/layer";

interface FilterPanelProps {
  imageLayer: ImageLayer;
  onUpdateImageLayer: (layerId: string, updates: any) => void;
  onReprocessImageLayer: (
    layerId: string,
    newImageData: HTMLCanvasElement,
    updates: any
  ) => void;
}

const FilterPanel: FC<FilterPanelProps> = ({
  imageLayer,
  onUpdateImageLayer,
  onReprocessImageLayer,
}) => {
  // Local state for immediate UI feedback
  const [threshold, setThreshold] = useState(imageLayer.threshold || 128);
  const [brightness, setBrightness] = useState(imageLayer.brightness ?? 128);
  const [contrast, setContrast] = useState(imageLayer.contrast ?? 100);
  const [bayerMatrixSize, setBayerMatrixSize] = useState(
    imageLayer.bayerMatrixSize ?? 4
  );
  const [halftoneCellSize, setHalftoneCellSize] = useState(
    imageLayer.halftoneCellSize ?? 4
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
    setThreshold(imageLayer.threshold || 128);
    setBrightness(imageLayer.brightness ?? 128);
    setContrast(imageLayer.contrast ?? 100);
    setBayerMatrixSize(imageLayer.bayerMatrixSize ?? 4);
    setHalftoneCellSize(imageLayer.halftoneCellSize ?? 4);
    // Clear any pending values when switching images
    pendingThresholdRef.current = null;
    pendingBrightnessRef.current = null;
    pendingContrastRef.current = null;
    pendingBayerMatrixRef.current = null;
    pendingHalftoneRef.current = null;
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
  }, [imageLayer.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const ditherMethods = [
    { id: "threshold", name: "Threshold", description: "Simple black & white" },
    {
      id: "steinberg",
      name: "Floyd-Steinberg",
      description: "Classic dithering",
    },
    { id: "atkinson", name: "Atkinson", description: "Smooth gradients" },
    { id: "bayer", name: "Bayer", description: "Ordered pattern" },
    { id: "pattern", name: "Halftone", description: "Dot pattern" },
  ];

  // Helper to trigger reprocessing with updated parameters
  const reprocessWithUpdates = async (updates: any) => {
    // Import reprocessor
    const { reprocessImage } = await import("../utils/imageReprocessor");

    // Merge current values with updates
    const params = {
      ditherMethod: updates.ditherMethod || imageLayer.ditherMethod,
      threshold:
        updates.threshold !== undefined
          ? updates.threshold
          : imageLayer.threshold,
      invert: updates.invert !== undefined ? updates.invert : imageLayer.invert,
      brightness:
        updates.brightness !== undefined
          ? updates.brightness
          : imageLayer.brightness ?? 128,
      contrast:
        updates.contrast !== undefined
          ? updates.contrast
          : imageLayer.contrast ?? 100,
      bayerMatrixSize:
        updates.bayerMatrixSize !== undefined
          ? updates.bayerMatrixSize
          : imageLayer.bayerMatrixSize ?? 4,
      halftoneCellSize:
        updates.halftoneCellSize !== undefined
          ? updates.halftoneCellSize
          : imageLayer.halftoneCellSize ?? 4,
      targetWidth: imageLayer.width,
      targetHeight: imageLayer.height,
    };

    try {
      const result = await reprocessImage(
        imageLayer.originalImageData,
        params.ditherMethod as any,
        params
      );

      // Update the layer with new processed image
      onReprocessImageLayer(imageLayer.id, result.canvas, updates);
    } catch (error) {
      console.error("Failed to reprocess image:", error);
    }
  };

  const handleDitherChange = (method: string) => {
    reprocessWithUpdates({ ditherMethod: method });
  };

  // Throttled processing - processes updates every 100ms while dragging
  const processThrottled = (updates: any) => {
    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTimeRef.current;
    const THROTTLE_MS = 100; // Process every 100ms for smooth real-time feedback

    if (timeSinceLastProcess >= THROTTLE_MS) {
      // Process immediately if enough time has passed
      lastProcessTimeRef.current = now;
      reprocessWithUpdates(updates);
      // Clear pending value for this specific update
      if (updates.threshold !== undefined) pendingThresholdRef.current = null;
      if (updates.brightness !== undefined) pendingBrightnessRef.current = null;
      if (updates.contrast !== undefined) pendingContrastRef.current = null;
      if (updates.bayerMatrixSize !== undefined)
        pendingBayerMatrixRef.current = null;
      if (updates.halftoneCellSize !== undefined)
        pendingHalftoneRef.current = null;
    } else {
      // Schedule processing for later
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }

      const delay = THROTTLE_MS - timeSinceLastProcess;
      throttleTimerRef.current = setTimeout(() => {
        lastProcessTimeRef.current = Date.now();

        // Process all pending values
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

  // Threshold handlers - update UI immediately, throttle processing
  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    pendingThresholdRef.current = value;
    processThrottled({ threshold: value });
  };

  const handleThresholdRelease = () => {
    // Process final value immediately if pending
    if (pendingThresholdRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ threshold: pendingThresholdRef.current });
      pendingThresholdRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  // Brightness handlers - update UI immediately, throttle processing
  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    pendingBrightnessRef.current = value;
    processThrottled({ brightness: value });
  };

  const handleBrightnessRelease = () => {
    // Process final value immediately if pending
    if (pendingBrightnessRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ brightness: pendingBrightnessRef.current });
      pendingBrightnessRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  // Contrast handlers - update UI immediately, throttle processing
  const handleContrastChange = (value: number) => {
    setContrast(value);
    pendingContrastRef.current = value;
    processThrottled({ contrast: value });
  };

  const handleContrastRelease = () => {
    // Process final value immediately if pending
    if (pendingContrastRef.current !== null) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      reprocessWithUpdates({ contrast: pendingContrastRef.current });
      pendingContrastRef.current = null;
      lastProcessTimeRef.current = Date.now();
    }
  };

  // Bayer matrix size handlers
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

  // Halftone cell size handlers
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
    <div className="filter-panel">
      <div className="filter-section">
        <label className="filter-label">Dither Method</label>
        <div className="dither-list">
          {ditherMethods.map((method) => (
            <button
              key={method.id}
              className={`dither-item ${
                imageLayer.ditherMethod === method.id ? "active" : ""
              }`}
              onClick={() => handleDitherChange(method.id)}
            >
              <span className="dither-name">{method.name}</span>
              <span className="dither-desc">{method.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Show threshold for methods that use it */}
      {(imageLayer.ditherMethod === "threshold" ||
        imageLayer.ditherMethod === "steinberg" ||
        imageLayer.ditherMethod === "atkinson" ||
        imageLayer.ditherMethod === "bayer") && (
        <div className="filter-section">
          <label className="filter-label">
            Threshold
            <span className="filter-value">{threshold}</span>
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
          <div className="filter-info">
            <span className="info-text-small">
              0 (black) ← {threshold} → 255 (white)
            </span>
          </div>
        </div>
      )}

      {/* Bayer matrix size control */}
      {imageLayer.ditherMethod === "bayer" && (
        <div className="filter-section">
          <label className="filter-label">
            Matrix Size
            <span className="filter-value">
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
          <div className="filter-info">
            <span className="info-text-small">
              2 (coarse) ← {bayerMatrixSize} → 16 (fine)
            </span>
          </div>
        </div>
      )}

      {/* Halftone cell size control */}
      {imageLayer.ditherMethod === "pattern" && (
        <div className="filter-section">
          <label className="filter-label">
            Cell Size
            <span className="filter-value">{halftoneCellSize}px</span>
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
          <div className="filter-info">
            <span className="info-text-small">
              2 (fine) ← {halftoneCellSize} → 16 (bold)
            </span>
          </div>
        </div>
      )}

      <div className="filter-section">
        <label className="filter-label">
          Brightness
          <span className="filter-value">{brightness}</span>
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
        <div className="filter-info">
          <span className="info-text-small">
            0 (dark) ← {brightness} → 255 (bright)
          </span>
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">
          Contrast
          <span className="filter-value">{contrast}%</span>
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
        <div className="filter-info">
          <span className="info-text-small">
            0 (flat) ← {contrast} → 200 (high)
          </span>
        </div>
      </div>

      <div className="filter-section">
        <button
          className="filter-toggle"
          onClick={() => reprocessWithUpdates({ invert: !imageLayer.invert })}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
          </svg>
          <span>Invert Colors</span>
          <div className={`toggle-switch ${imageLayer.invert ? "active" : ""}`}>
            <div className="toggle-handle" />
          </div>
        </button>
      </div>

      <style>{`
        .filter-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .filter-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-purple-primary);
          background: rgba(167, 139, 250, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .dither-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dither-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .dither-item:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
        }

        .dither-item.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .dither-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dither-desc {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .filter-slider {
          width: 100%;
          height: 6px;
          background: var(--color-bg-secondary);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .filter-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-slider::-webkit-slider-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .filter-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .filter-slider::-moz-range-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .filter-info {
          margin-top: 0.25rem;
          text-align: center;
        }

        .info-text-small {
          font-size: 0.625rem;
          color: var(--color-text-muted);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-toggle:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .toggle-switch {
          margin-left: auto;
          width: 40px;
          height: 20px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          position: relative;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active {
          background: linear-gradient(135deg, var(--color-purple-dark) 0%, var(--color-blue-dark) 100%);
          border-color: var(--color-purple-primary);
        }

        .toggle-handle {
          width: 14px;
          height: 14px;
          background: var(--color-text-primary);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active .toggle-handle {
          left: 22px;
        }
      `}</style>
    </div>
  );
};

export default FilterPanel;
