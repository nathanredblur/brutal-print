// Image upload and processing component
import { useState, useRef, useCallback } from "react";
import { processImageForPrinter, binaryDataToCanvas } from "../lib/dithering";
import type { DitherMethod } from "../lib/dithering";

interface ImageUploaderProps {
  onImageProcessed?: (
    canvas: HTMLCanvasElement,
    binaryData: boolean[][]
  ) => void;
}

export default function ImageUploader({
  onImageProcessed,
}: ImageUploaderProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ditherMethod, setDitherMethod] = useState<DitherMethod>("steinberg");
  const [threshold, setThreshold] = useState(128);
  const [brightness, setBrightness] = useState(128);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processImage = useCallback(
    async (img: HTMLImageElement) => {
      if (!img) return;

      setIsProcessing(true);

      try {
        const { canvas, binaryData } = processImageForPrinter(img, {
          ditherMethod,
          threshold,
          brightness,
          contrast,
          invert,
        });

        // Create preview canvas
        const previewCanvas = binaryDataToCanvas(binaryData, 1);
        setPreview(previewCanvas.toDataURL());

        // Notify parent
        onImageProcessed?.(canvas, binaryData);
      } catch (error) {
        console.error("Failed to process image:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [ditherMethod, threshold, brightness, contrast, invert, onImageProcessed]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          processImage(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [processImage]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Re-process when settings change
  const handleSettingChange = useCallback(() => {
    if (image) {
      processImage(image);
    }
  }, [image, processImage]);

  return (
    <div className="image-uploader">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`drop-zone ${image ? "has-image" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />

        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            {isProcessing && (
              <div className="processing-overlay">
                <div className="spinner-large"></div>
                <span>Processing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="drop-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>Drop image here or click to upload</p>
            <span>Supports JPG, PNG, SVG</span>
          </div>
        )}
      </div>

      {/* Processing Controls */}
      {image && (
        <div className="processing-controls">
          <div className="control-group">
            <label>Dithering Method</label>
            <select
              value={ditherMethod}
              onChange={(e) => {
                setDitherMethod(e.target.value as DitherMethod);
                handleSettingChange();
              }}
            >
              <option value="steinberg">Floyd-Steinberg</option>
              <option value="atkinson">Atkinson</option>
              <option value="bayer">Ordered (Bayer)</option>
              <option value="pattern">Halftone/Pattern</option>
              <option value="threshold">Threshold</option>
            </select>
          </div>

          <div className="control-group">
            <label>Threshold: {threshold}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value));
                handleSettingChange();
              }}
            />
          </div>

          <div className="control-group">
            <label>Brightness: {brightness}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={brightness}
              onChange={(e) => {
                setBrightness(Number(e.target.value));
                handleSettingChange();
              }}
            />
          </div>

          <div className="control-group">
            <label>Contrast: {contrast}</label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => {
                setContrast(Number(e.target.value));
                handleSettingChange();
              }}
            />
          </div>

          <div className="control-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={invert}
                onChange={(e) => {
                  setInvert(e.target.checked);
                  handleSettingChange();
                }}
              />
              Invert Colors
            </label>
          </div>

          <button
            className="btn-secondary"
            onClick={() => {
              setImage(null);
              setPreview(null);
            }}
          >
            Remove Image
          </button>
        </div>
      )}

      <style>{`
        .image-uploader {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          background: var(--color-bg-secondary);
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-zone:hover {
          border-color: var(--color-purple-primary);
          background: rgba(167, 139, 250, 0.05);
        }

        .drop-zone.has-image {
          padding: 0;
          border: 1px solid var(--color-border);
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 500px;
          image-rendering: pixelated;
          border-radius: var(--radius-md);
        }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 14, 26, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          border-radius: var(--radius-lg);
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(167, 139, 250, 0.3);
          border-top-color: var(--color-purple-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .drop-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--color-text-secondary);
        }

        .drop-placeholder svg {
          color: var(--color-purple-primary);
        }

        .drop-placeholder p {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .drop-placeholder span {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .processing-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .control-group select,
        .control-group input[type="range"] {
          width: 100%;
        }

        .control-group select {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          font-size: 0.875rem;
        }

        .control-group input[type="range"] {
          height: 4px;
          background: var(--color-bg-secondary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .control-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
