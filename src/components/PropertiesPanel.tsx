/**
 * PropertiesPanel Component
 *
 * Displays editable properties for the selected layer
 * Supports text editing, image filters, and canvas settings
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { Layer, TextLayer, ImageLayer } from "../types/layer";
import { reprocessImage } from "../utils/imageReprocessor";
import type { DitherMethod } from "../lib/dithering";

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  canvasHeight: number;
  onUpdateTextLayer: (layerId: string, updates: Partial<TextLayer>) => void;
  onUpdateImageLayer: (layerId: string, updates: Partial<ImageLayer>) => void;
  onReprocessImageLayer: (
    layerId: string,
    newImageData: HTMLCanvasElement,
    updates: {
      ditherMethod?: string;
      threshold?: number;
      invert?: boolean;
      brightness?: number;
      contrast?: number;
      bayerMatrixSize?: number;
      halftoneCellSize?: number;
    }
  ) => void;
  onCanvasHeightChange: (height: number) => void;
}

export default function PropertiesPanel({
  selectedLayer,
  canvasHeight,
  onUpdateTextLayer,
  onUpdateImageLayer,
  onReprocessImageLayer,
  onCanvasHeightChange,
}: PropertiesPanelProps) {
  // Local state for form inputs
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [ditherMethod, setDitherMethod] = useState("steinberg");
  const [threshold, setThreshold] = useState(128);
  const [invertImage, setInvertImage] = useState(false);
  const [localCanvasHeight, setLocalCanvasHeight] = useState(canvasHeight);
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Additional parameters for different dithering methods
  const [bayerMatrixSize, setBayerMatrixSize] = useState(4);
  const [halftoneCellSize, setHalftoneCellSize] = useState(4);
  const [brightness, setBrightness] = useState(128);
  const [contrast, setContrast] = useState(100);

  // Throttle threshold changes for real-time feedback
  const thresholdThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const lastThresholdProcessRef = useRef<number>(0);
  const pendingThresholdRef = useRef<number | null>(null);

  // Update local state when selected layer changes
  useEffect(() => {
    if (selectedLayer?.type === "text") {
      const textLayer = selectedLayer as TextLayer;
      setText(textLayer.text);
      setFontSize(textLayer.fontSize);
      setFontFamily(textLayer.fontFamily);
      setBold(textLayer.bold);
      setItalic(textLayer.italic);
      setAlign(textLayer.align);
    } else if (selectedLayer?.type === "image") {
      const imageLayer = selectedLayer as ImageLayer;
      setDitherMethod(imageLayer.ditherMethod || "steinberg");
      setThreshold(imageLayer.threshold ?? 128);
      setInvertImage(imageLayer.invert ?? false);
      setBrightness(imageLayer.brightness ?? 128);
      setContrast(imageLayer.contrast ?? 100);
      setBayerMatrixSize(imageLayer.bayerMatrixSize ?? 4);
      setHalftoneCellSize(imageLayer.halftoneCellSize ?? 4);
    }
  }, [selectedLayer]);

  // Update local canvas height when prop changes
  useEffect(() => {
    setLocalCanvasHeight(canvasHeight);
  }, [canvasHeight]);

  // Cleanup throttle timeout on unmount
  useEffect(() => {
    return () => {
      if (thresholdThrottleRef.current) {
        clearTimeout(thresholdThrottleRef.current);
      }
    };
  }, []);

  // Handle text updates
  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { text: newText });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { fontSize: newSize });
    }
  };

  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { fontFamily: newFamily });
    }
  };

  const handleBoldToggle = () => {
    const newBold = !bold;
    setBold(newBold);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { bold: newBold });
    }
  };

  const handleItalicToggle = () => {
    const newItalic = !italic;
    setItalic(newItalic);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { italic: newItalic });
    }
  };

  const handleAlignChange = (newAlign: "left" | "center" | "right") => {
    setAlign(newAlign);
    if (selectedLayer?.type === "text") {
      onUpdateTextLayer(selectedLayer.id, { align: newAlign });
    }
  };

  const reprocessCurrentImage = useCallback(
    async (updates: {
      ditherMethod?: string;
      threshold?: number;
      invert?: boolean;
      brightness?: number;
      contrast?: number;
    }) => {
      if (selectedLayer?.type !== "image") return;

      const imageLayer = selectedLayer as ImageLayer;
      setIsReprocessing(true);

      try {
        // Reprocess image with new settings at current scaled dimensions
        const result = await reprocessImage(
          imageLayer.originalImageData,
          (updates.ditherMethod || imageLayer.ditherMethod) as DitherMethod,
          {
            threshold: updates.threshold ?? imageLayer.threshold,
            invert: updates.invert ?? imageLayer.invert,
            targetWidth: Math.round(selectedLayer.width),
            targetHeight: Math.round(selectedLayer.height),
            // Pass algorithm-specific parameters
            bayerMatrixSize,
            halftoneCellSize,
            brightness: updates.brightness ?? brightness,
            contrast: updates.contrast ?? contrast,
          }
        );

        // Update layer with new processed image
        onReprocessImageLayer(selectedLayer.id, result.canvas, {
          ditherMethod: updates.ditherMethod,
          threshold: updates.threshold,
          invert: updates.invert,
          brightness: updates.brightness ?? brightness,
          contrast: updates.contrast ?? contrast,
          bayerMatrixSize,
          halftoneCellSize,
        });
      } catch (error) {
        console.error("Failed to reprocess image:", error);
        alert("Failed to reprocess image. Please try again.");
        // Revert local state
        if (updates.ditherMethod) setDitherMethod(imageLayer.ditherMethod);
        if (updates.threshold !== undefined) setThreshold(imageLayer.threshold);
        if (updates.invert !== undefined) setInvertImage(imageLayer.invert);
      } finally {
        setIsReprocessing(false);
      }
    },
    [
      selectedLayer,
      onReprocessImageLayer,
      bayerMatrixSize,
      halftoneCellSize,
      brightness,
      contrast,
    ]
  );

  const handleDitherMethodChange = async (method: string) => {
    setDitherMethod(method);
    await reprocessCurrentImage({ ditherMethod: method });
  };

  const handleThresholdChange = (value: number) => {
    // Update visual immediately for smooth UX
    setThreshold(value);

    const now = Date.now();
    const timeSinceLastProcess = now - lastThresholdProcessRef.current;
    const THROTTLE_MS = 100; // Process every 100ms for smooth real-time feedback

    // Store the pending value
    pendingThresholdRef.current = value;

    // Don't wait for isReprocessing - let slider move freely
    if (timeSinceLastProcess >= THROTTLE_MS) {
      // Process immediately if enough time has passed
      lastThresholdProcessRef.current = now;
      reprocessCurrentImage({ threshold: value });
      pendingThresholdRef.current = null;
    } else {
      // Schedule processing for later
      if (thresholdThrottleRef.current) {
        clearTimeout(thresholdThrottleRef.current);
      }

      const delay = THROTTLE_MS - timeSinceLastProcess;
      thresholdThrottleRef.current = setTimeout(() => {
        if (pendingThresholdRef.current !== null) {
          lastThresholdProcessRef.current = Date.now();
          reprocessCurrentImage({ threshold: pendingThresholdRef.current });
          pendingThresholdRef.current = null;
        }
      }, delay);
    }
  };

  const handleThresholdRelease = () => {
    // When user releases slider, process final value if there's a pending one
    if (pendingThresholdRef.current !== null) {
      if (thresholdThrottleRef.current) {
        clearTimeout(thresholdThrottleRef.current);
      }
      reprocessCurrentImage({ threshold: pendingThresholdRef.current });
      pendingThresholdRef.current = null;
      lastThresholdProcessRef.current = Date.now();
    }
  };

  const handleInvertToggle = async () => {
    const newValue = !invertImage;
    setInvertImage(newValue);
    await reprocessCurrentImage({ invert: newValue });
  };

  const handleBayerMatrixSizeChange = (value: number) => {
    setBayerMatrixSize(value);
  };

  const handleBayerMatrixSizeRelease = () => {
    reprocessCurrentImage({ ditherMethod: "bayer" });
  };

  const handleHalftoneCellSizeChange = (value: number) => {
    setHalftoneCellSize(value);
  };

  const handleHalftoneCellSizeRelease = () => {
    reprocessCurrentImage({ ditherMethod: "pattern" });
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
  };

  const handleBrightnessRelease = () => {
    reprocessCurrentImage({ brightness });
  };

  const handleContrastChange = (value: number) => {
    setContrast(value);
  };

  const handleContrastRelease = () => {
    reprocessCurrentImage({ contrast });
  };

  const handleCanvasHeightChange = (height: number) => {
    setLocalCanvasHeight(height);
    onCanvasHeightChange(height);
  };

  return (
    <div className="properties-panel">
      <h3 className="panel-title">Properties</h3>

      {/* Canvas Settings - Always visible */}
      <div className="property-section">
        <h4 className="section-subtitle">Canvas</h4>

        <div className="property-group">
          <label className="property-label">Height (px)</label>
          <input
            type="number"
            className="property-input"
            value={localCanvasHeight}
            onChange={(e) => handleCanvasHeightChange(Number(e.target.value))}
            min={400}
            max={2000}
            step={100}
          />
        </div>

        <div className="property-info">
          <span className="info-label">Width:</span>
          <span className="info-value">384px (fixed)</span>
        </div>
      </div>

      {/* Layer Properties - Only when layer is selected */}
      {selectedLayer ? (
        <>
          <div className="property-section">
            <h4 className="section-subtitle">
              {selectedLayer.type === "text" ? "Text Layer" : "Image Layer"}
            </h4>

            {/* Common properties */}
            <div className="property-group">
              <label className="property-label">Layer Name</label>
              <div className="property-value">{selectedLayer.name}</div>
            </div>

            <div className="property-group">
              <label className="property-label">Position</label>
              <div className="property-value">
                X: {Math.round(selectedLayer.x)}px, Y:{" "}
                {Math.round(selectedLayer.y)}px
              </div>
            </div>

            <div className="property-group">
              <label className="property-label">Size</label>
              <div className="property-value">
                {Math.round(selectedLayer.width)} ×{" "}
                {Math.round(selectedLayer.height)}px
              </div>
            </div>

            <div className="property-group">
              <label className="property-label">Rotation</label>
              <div className="property-value">
                {Math.round(selectedLayer.rotation)}°
              </div>
            </div>
          </div>

          {/* Text-specific properties */}
          {selectedLayer.type === "text" && (
            <div className="property-section">
              <h4 className="section-subtitle">Text Content</h4>

              <div className="property-group">
                <label className="property-label">Text</label>
                <textarea
                  className="property-textarea"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={3}
                  placeholder="Enter text..."
                />
              </div>

              <div className="property-group">
                <label className="property-label">Font Size</label>
                <input
                  type="number"
                  className="property-input"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  min={8}
                  max={200}
                />
              </div>

              <div className="property-group">
                <label className="property-label">Font Family</label>
                <select
                  className="property-select"
                  value={fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

              <div className="property-group">
                <label className="property-label">Style</label>
                <div className="button-group">
                  <button
                    className={`style-btn ${bold ? "active" : ""}`}
                    onClick={handleBoldToggle}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    className={`style-btn ${italic ? "active" : ""}`}
                    onClick={handleItalicToggle}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                </div>
              </div>

              <div className="property-group">
                <label className="property-label">Align</label>
                <div className="button-group">
                  <button
                    className={`align-btn ${align === "left" ? "active" : ""}`}
                    onClick={() => handleAlignChange("left")}
                    title="Left"
                  >
                    ⬅
                  </button>
                  <button
                    className={`align-btn ${
                      align === "center" ? "active" : ""
                    }`}
                    onClick={() => handleAlignChange("center")}
                    title="Center"
                  >
                    ↔
                  </button>
                  <button
                    className={`align-btn ${align === "right" ? "active" : ""}`}
                    onClick={() => handleAlignChange("right")}
                    title="Right"
                  >
                    ➡
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image-specific properties */}
          {selectedLayer.type === "image" && (
            <div className="property-section">
              <h4 className="section-subtitle">Image Processing</h4>

              <div className="property-group">
                <label className="property-label">Dither Method</label>
                <select
                  className="property-select"
                  value={ditherMethod}
                  onChange={(e) => handleDitherMethodChange(e.target.value)}
                >
                  <option value="steinberg">Floyd-Steinberg</option>
                  <option value="atkinson">Atkinson</option>
                  <option value="bayer">Ordered (Bayer)</option>
                  <option value="pattern">Halftone Pattern</option>
                  <option value="threshold">Threshold</option>
                </select>
              </div>

              {/* Show threshold for methods that use it */}
              {(ditherMethod === "threshold" ||
                ditherMethod === "steinberg" ||
                ditherMethod === "atkinson") && (
                <div className="property-group">
                  <label className="property-label">
                    Threshold: {threshold}
                  </label>
                  <input
                    type="range"
                    className="property-slider"
                    value={threshold}
                    onChange={(e) =>
                      handleThresholdChange(Number(e.target.value))
                    }
                    onPointerUp={handleThresholdRelease}
                    onMouseUp={handleThresholdRelease}
                    onTouchEnd={handleThresholdRelease}
                    min={0}
                    max={255}
                    step={1}
                  />
                  <div className="property-info-inline">
                    <span className="info-text-small">
                      0 (black) ← {threshold} → 255 (white)
                    </span>
                  </div>
                </div>
              )}

              {/* Bayer matrix size control */}
              {ditherMethod === "bayer" && (
                <>
                  <div className="property-group">
                    <label className="property-label">
                      Threshold: {threshold}
                    </label>
                    <input
                      type="range"
                      className="property-slider"
                      value={threshold}
                      onChange={(e) =>
                        handleThresholdChange(Number(e.target.value))
                      }
                      onPointerUp={handleThresholdRelease}
                      onMouseUp={handleThresholdRelease}
                      onTouchEnd={handleThresholdRelease}
                      min={0}
                      max={255}
                      step={1}
                    />
                    <div className="property-info-inline">
                      <span className="info-text-small">
                        0 (black) ← {threshold} → 255 (white)
                      </span>
                    </div>
                  </div>
                  <div className="property-group">
                    <label className="property-label">
                      Matrix Size: {bayerMatrixSize}x{bayerMatrixSize}
                    </label>
                    <input
                      type="range"
                      className="property-slider"
                      value={bayerMatrixSize}
                      onChange={(e) =>
                        handleBayerMatrixSizeChange(Number(e.target.value))
                      }
                      onPointerUp={handleBayerMatrixSizeRelease}
                      onMouseUp={handleBayerMatrixSizeRelease}
                      onTouchEnd={handleBayerMatrixSizeRelease}
                      min={2}
                      max={16}
                      step={1}
                    />
                    <div className="property-info-inline">
                      <span className="info-text-small">
                        2 (coarse) ← {bayerMatrixSize} → 16 (fine)
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Halftone cell size control */}
              {ditherMethod === "pattern" && (
                <>
                  <div className="property-group">
                    <label className="property-label">
                      Cell Size: {halftoneCellSize}px
                    </label>
                    <input
                      type="range"
                      className="property-slider"
                      value={halftoneCellSize}
                      onChange={(e) =>
                        handleHalftoneCellSizeChange(Number(e.target.value))
                      }
                      onPointerUp={handleHalftoneCellSizeRelease}
                      onMouseUp={handleHalftoneCellSizeRelease}
                      onTouchEnd={handleHalftoneCellSizeRelease}
                      min={2}
                      max={16}
                      step={1}
                    />
                    <div className="property-info-inline">
                      <span className="info-text-small">
                        2 (fine) ← {halftoneCellSize} → 16 (bold)
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="property-group">
                <label className="property-label">Invert Colors</label>
                <button
                  className={`toggle-btn ${invertImage ? "active" : ""}`}
                  onClick={handleInvertToggle}
                >
                  {invertImage ? "ON" : "OFF"}
                </button>
              </div>

              {/* Brightness control */}
              <div className="property-group">
                <label className="property-label">
                  Brightness: {brightness}
                </label>
                <input
                  type="range"
                  className="property-slider"
                  value={brightness}
                  onChange={(e) =>
                    handleBrightnessChange(Number(e.target.value))
                  }
                  onPointerUp={handleBrightnessRelease}
                  onMouseUp={handleBrightnessRelease}
                  onTouchEnd={handleBrightnessRelease}
                  min={0}
                  max={255}
                  step={1}
                />
                <div className="property-info-inline">
                  <span className="info-text-small">
                    0 (dark) ← {brightness} → 255 (bright)
                  </span>
                </div>
              </div>

              {/* Contrast control */}
              <div className="property-group">
                <label className="property-label">Contrast: {contrast}%</label>
                <input
                  type="range"
                  className="property-slider"
                  value={contrast}
                  onChange={(e) => handleContrastChange(Number(e.target.value))}
                  onPointerUp={handleContrastRelease}
                  onMouseUp={handleContrastRelease}
                  onTouchEnd={handleContrastRelease}
                  min={0}
                  max={200}
                  step={1}
                />
                <div className="property-info-inline">
                  <span className="info-text-small">
                    0 (flat) ← {contrast} → 200 (high)
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-selection">
          <p>Select a layer to view and edit its properties</p>
        </div>
      )}

      <style>{`
        .properties-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
        }

        .property-section {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
        }

        .section-subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-purple-primary);
          margin: 0 0 0.75rem 0;
        }

        .property-group {
          margin-bottom: 0.75rem;
        }

        .property-group:last-child {
          margin-bottom: 0;
        }

        .property-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-muted);
          margin-bottom: 0.25rem;
        }

        .property-value {
          font-size: 0.875rem;
          color: var(--color-text-primary);
          padding: 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-sm);
        }

        .property-input,
        .property-select,
        .property-textarea {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.875rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          transition: all var(--transition-fast);
        }

        .property-input:focus,
        .property-select:focus,
        .property-textarea:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }

        .property-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .style-btn,
        .align-btn,
        .option-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.875rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .style-btn:hover,
        .align-btn:hover,
        .option-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .style-btn.active,
        .align-btn.active,
        .option-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .property-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: var(--radius-sm);
        }

        .property-info.processing {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .property-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(15, 23, 42, 0.8);
          outline: none;
          -webkit-appearance: none;
        }

        .property-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-purple-primary);
          cursor: pointer;
          border: 2px solid var(--color-bg-tertiary);
        }

        .property-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-purple-primary);
          cursor: pointer;
          border: 2px solid var(--color-bg-tertiary);
        }

        .property-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .property-info-inline {
          margin-top: 0.25rem;
          text-align: center;
        }

        .info-text-small {
          font-size: 0.625rem;
          color: var(--color-text-muted);
        }

        .toggle-btn {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toggle-btn:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .info-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .info-text {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .no-selection {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
