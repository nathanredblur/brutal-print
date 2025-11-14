// Main canvas manager with all tools integrated
import { useState, useRef, useEffect, useCallback } from "react";
import { usePrinterContext } from "../contexts/PrinterContext";
import { useToastContext } from "../contexts/ToastContext";
import { useLayers } from "../hooks/useLayers";
import { useCanvasPersistence } from "../hooks/useCanvasPersistence";
import ImageUploader from "./ImageUploader";
import PrinterConnection from "./PrinterConnection";
import TextTool from "./TextTool";
import LayerPanel from "./LayerPanel";
import PropertiesPanel from "./PropertiesPanel";
import FabricCanvas, { type FabricCanvasRef } from "./FabricCanvas";
import { PRINTER_WIDTH } from "../lib/dithering";
import { logger } from "../lib/logger";
import type { Layer, ImageLayer } from "../types/layer";

type Tool = "select" | "image" | "text" | "draw" | "shape" | "icon";

// Helper function to load state from localStorage (outside component)
async function loadSavedState() {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem("thermal-print-studio-canvas-state");
    if (!stored) return null;

    const state = JSON.parse(stored);

    // Restore HTMLCanvasElement from base64 (must wait for images to load)
    const restoredLayers = await Promise.all(
      state.layers.map(async (layer: any) => {
        if (layer.type === "image") {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            logger.error(
              "loadSavedState",
              "Failed to get 2d context",
              layer.id
            );
            return layer;
          }

          // Wait for image to load
          const img = new Image();
          try {
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                logger.debug("loadSavedState", "Image loaded successfully", {
                  layerId: layer.id,
                  imgSize: `${img.naturalWidth}x${img.naturalHeight}`,
                  targetSize: `${layer.width}x${layer.height}`,
                });
                resolve();
              };
              img.onerror = (e) => {
                logger.error("loadSavedState", "Image load error", {
                  layerId: layer.id,
                  error: e,
                });
                reject(e);
              };
              img.src = layer.imageData;
            });

            canvas.width = layer.width;
            canvas.height = layer.height;
            ctx.drawImage(img, 0, 0, layer.width, layer.height);

            // Verify canvas has actual pixel data
            const testData = ctx.getImageData(0, 0, 1, 1);
            logger.debug("loadSavedState", "Canvas drawn", {
              layerId: layer.id,
              canvasSize: `${canvas.width}x${canvas.height}`,
              hasPixels: testData.data.some((v) => v > 0),
            });

            return {
              ...layer,
              imageData: canvas,
            };
          } catch (error) {
            logger.error("loadSavedState", "Failed to restore image layer", {
              layerId: layer.id,
              error,
            });
            return layer;
          }
        }
        return layer;
      })
    );

    logger.info("loadSavedState", "State loaded from localStorage", {
      layerCount: restoredLayers.length,
      canvasHeight: state.canvasHeight,
    });

    return {
      ...state,
      layers: restoredLayers,
    };
  } catch (error) {
    logger.error("loadSavedState", "Failed to load state", error);
    return null;
  }
}

export default function CanvasManager() {
  const fabricCanvasRef = useRef<FabricCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);

  // Keep a ref to always have fresh layers data
  const layersRef = useRef<Layer[]>([]);

  // Initialize with null to match server render, load after hydration
  const [savedState, setSavedState] = useState<any>(null);

  // Load saved state after component mounts (client-side only)
  useEffect(() => {
    loadSavedState().then((state) => {
      if (state) {
        setSavedState(state);
      }
    });
  }, []);

  // Canvas dimensions
  const CANVAS_WIDTH = PRINTER_WIDTH;
  const [canvasHeight, setCanvasHeight] = useState(800);

  // Update canvas height when saved state loads
  useEffect(() => {
    if (savedState?.canvasHeight) {
      setCanvasHeight(savedState.canvasHeight);
    }
  }, [savedState]);

  // Use shared printer context
  const { printCanvas, isConnected, isPrinting } = usePrinterContext();

  // Use toast notifications
  const toast = useToastContext();

  // Use layer system with initial state
  const {
    layers,
    selectedLayerId,
    selectedLayer,
    nextId,
    addImageLayer,
    addTextLayer,
    removeLayer,
    toggleVisibility,
    toggleLock,
    selectLayer,
    moveLayer,
    updateLayer,
    updateTextLayer,
    updateImageLayer,
    reprocessImageLayer,
    clearLayers,
  } = useLayers(savedState);

  // Keep layersRef updated with the latest layers
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Enable persistence (auto-save)
  const persistence = useCanvasPersistence(
    layers,
    canvasHeight,
    selectedLayerId,
    nextId
  );

  // Log printer state changes (only when they actually change)
  useEffect(() => {
    logger.logState("CanvasManager", "Printer connection state", {
      isConnected,
      isPrinting,
      source: "usePrinterContext (shared)",
    });
  }, [isConnected, isPrinting]);

  const handleImageProcessed = useCallback(
    (
      canvas: HTMLCanvasElement,
      binaryData: boolean[][],
      originalImageData: string,
      ditherMethod: string,
      threshold: number,
      invert: boolean
    ) => {
      // Add image as a new layer (non-destructive!)
      const layerName = `Image ${layers.length + 1}`;
      addImageLayer(
        canvas,
        originalImageData,
        ditherMethod,
        threshold,
        invert,
        {
          name: layerName,
          x: 0,
          y: 0,
        }
      );

      logger.success(
        "CanvasManager",
        "Image added as layer with original data"
      );
      // No toast notification - visual feedback is the layer appearing
      setShowImageUploader(false);
    },
    [addImageLayer, layers.length]
  );

  const handlePrint = useCallback(async () => {
    logger.separator("HANDLE PRINT");
    logger.info("CanvasManager", "handlePrint() called");

    // Export canvas from Fabric.js
    const canvas = fabricCanvasRef.current?.exportToCanvas();
    if (!canvas) {
      logger.error("CanvasManager", "Canvas not available");
      toast.error(
        "Canvas not available",
        "Please refresh the page and try again."
      );
      return;
    }

    logger.debug("CanvasManager", "Canvas exported from Fabric.js", {
      width: canvas.width,
      height: canvas.height,
    });

    logger.info("CanvasManager", "Checking connection status", {
      isConnected,
      isPrinting,
    });

    if (!isConnected) {
      logger.error(
        "CanvasManager",
        "Printer not connected! isConnected = false"
      );
      toast.warning(
        "Printer not connected",
        "Please connect to your thermal printer first."
      );
      return;
    }

    try {
      const printOptions = {
        dither: "steinberg" as const,
        brightness: 128,
        intensity: 93,
      };

      logger.info("CanvasManager", "Calling printCanvas()", printOptions);

      // Print the canvas directly using the official method
      await printCanvas(canvas, printOptions);

      logger.success("CanvasManager", "Print completed!");
      toast.success(
        "Print completed!",
        "Your design has been sent to the printer."
      );
    } catch (error) {
      logger.error("CanvasManager", "Print failed", error);
      toast.error("Print failed", (error as Error).message);
    }
  }, [isConnected, isPrinting, printCanvas, toast]);

  const handleToolSelect = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (tool === "image") {
      setShowImageUploader(true);
      setShowTextTool(false);
    } else if (tool === "text") {
      setShowTextTool(true);
      setShowImageUploader(false);
    }
  }, []);

  const handleAddText = useCallback(
    (text: string, options: any) => {
      // Add text as a new layer (non-destructive!)
      const layerName = `Text ${layers.length + 1}`;
      addTextLayer(text, {
        name: layerName,
        x: options.x || 50,
        y: options.y || 50,
        fontSize: options.fontSize || 24,
        fontFamily: options.fontFamily || "Inter",
        bold: options.bold || false,
        italic: options.italic || false,
        align: options.align || "left",
        color: "#000000",
      });

      logger.success("CanvasManager", "Text added as layer");
      toast.success(
        "Text added!",
        `${layerName} has been added to the canvas.`
      );
      setShowTextTool(false);
    },
    [addTextLayer, layers.length, toast]
  );

  // Handle layer updates from Fabric.js
  const handleLayerUpdate = useCallback(
    async (layerId: string, updates: any, wasScaled?: boolean) => {
      logger.info("CanvasManager", "🎯 handleLayerUpdate called", {
        layerId,
        wasScaled,
        updates,
        layersAvailable: layersRef.current.length,
      });

      // Always update position/rotation immediately for smooth interaction
      updateLayer(layerId, {
        x: updates.x,
        y: updates.y,
        rotation: updates.rotation,
      });

      // If an image was scaled, reprocess it asynchronously
      if (wasScaled) {
        logger.info(
          "CanvasManager",
          "✅ wasScaled is TRUE, checking layer type..."
        );

        // IMPORTANT: Use layersRef.current to get fresh data
        // The layers array in closure is stale
        const currentLayers = layersRef.current;
        logger.info("CanvasManager", "Current layers array (from ref):", {
          currentLayers,
          layersCount: currentLayers.length,
          searchingFor: layerId,
        });

        const layer = currentLayers.find((l) => l.id === layerId);
        logger.info("CanvasManager", "Layer found:", {
          layer,
          type: layer?.type,
          allLayerIds: currentLayers.map((l) => l.id),
        });

        if (layer?.type === "image") {
          const imageLayer = layer as ImageLayer;

          const targetWidth = Math.round(updates.width);
          const targetHeight = Math.round(updates.height);

          logger.info(
            "CanvasManager",
            "Image scaling completed, reprocesing...",
            {
              layerId,
              oldSize: { width: layer.width, height: layer.height },
              newSize: { width: targetWidth, height: targetHeight },
            }
          );

          try {
            // Show loading state with toast
            toast.info("Processing image...", "Applying dithering at new size");

            logger.info("CanvasManager", "🔄 Starting reprocess...", {
              layerId,
              targetSize: { width: targetWidth, height: targetHeight },
              originalImageData:
                imageLayer.originalImageData.substring(0, 50) + "...",
            });

            const { reprocessImage } = await import(
              "../utils/imageReprocessor"
            );
            const result = await reprocessImage(
              imageLayer.originalImageData,
              imageLayer.ditherMethod as any,
              {
                threshold: imageLayer.threshold,
                invert: imageLayer.invert,
                targetWidth,
                targetHeight,
              }
            );

            logger.info(
              "CanvasManager",
              "✅ Reprocess completed, updating layer...",
              {
                layerId,
                resultCanvasSize: {
                  width: result.canvas.width,
                  height: result.canvas.height,
                },
                canvasElement: result.canvas,
              }
            );

            // Update layer with reprocessed image
            // This will trigger Fabric to update with the new canvas at 1:1 scale
            reprocessImageLayer(layerId, result.canvas, {
              ditherMethod: imageLayer.ditherMethod,
              threshold: imageLayer.threshold,
              invert: imageLayer.invert,
            });

            logger.success(
              "CanvasManager",
              "✨ Layer updated with new canvas",
              {
                layerId,
                finalSize: {
                  width: result.canvas.width,
                  height: result.canvas.height,
                },
              }
            );

            toast.success("Image processed!", "Dithering applied at new size");
          } catch (error) {
            logger.error(
              "CanvasManager",
              "Failed to reprocess scaled image",
              error
            );
            toast.error("Processing failed", "Could not apply dithering");
            // Fallback: update with scaled dimensions
            updateLayer(layerId, {
              width: targetWidth,
              height: targetHeight,
            });
          }
          return;
        }
      }

      // For non-image layers or non-scaled updates, update dimensions normally
      if (updates.width !== undefined || updates.height !== undefined) {
        updateLayer(layerId, {
          width: updates.width,
          height: updates.height,
        });
      }
    },
    [updateLayer, reprocessImageLayer, toast] // Removed 'layers' - using layersRef instead
  );

  // Handle layer selection from Fabric.js
  const handleLayerSelect = useCallback(
    (layerId: string | null) => {
      selectLayer(layerId);
    },
    [selectLayer]
  );

  // Handle canvas height change
  const handleCanvasHeightChange = useCallback((height: number) => {
    setCanvasHeight(height);
    logger.info("CanvasManager", "Canvas height changed", { height });
  }, []);

  // Handle image reprocessing with new filter
  const handleReprocessImageLayer = useCallback(
    (
      layerId: string,
      newImageData: HTMLCanvasElement,
      updates: { ditherMethod?: string; threshold?: number; invert?: boolean }
    ) => {
      reprocessImageLayer(layerId, newImageData, updates);

      // Only show toast for method or invert changes, not threshold (too frequent)
      if (updates.ditherMethod || updates.invert !== undefined) {
        const changes = [];
        if (updates.ditherMethod)
          changes.push(`Dither: ${updates.ditherMethod}`);
        if (updates.invert !== undefined)
          changes.push(`Invert: ${updates.invert ? "ON" : "OFF"}`);

        toast.success("Image reprocessed!", changes.join(", "));
      }
    },
    [reprocessImageLayer, toast]
  );

  // Handle new canvas (clear all layers)
  const handleNewCanvas = useCallback(() => {
    if (layers.length === 0) {
      toast.info("Canvas is empty", "No layers to clear.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to start a new canvas? This will remove all layers."
    );
    if (confirmed) {
      clearLayers();
      persistence.clearSavedState();
      toast.success("New canvas created!", "All layers have been cleared.");
      logger.info("CanvasManager", "New canvas created - all layers cleared");
    }
  }, [layers.length, clearLayers, persistence, toast]);

  return (
    <div className="canvas-manager">
      {/* Toolbar */}
      <div className="toolbar-section">
        <h3 className="section-title">TOOLS</h3>

        <button
          className={`tool-btn ${activeTool === "select" ? "active" : ""}`}
          onClick={() => handleToolSelect("select")}
          title="Select (V)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
        </button>

        <button
          className={`tool-btn ${activeTool === "image" ? "active" : ""}`}
          onClick={() => handleToolSelect("image")}
          title="Image (I)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <button
          className={`tool-btn ${activeTool === "text" ? "active" : ""}`}
          onClick={() => handleToolSelect("text")}
          title="Text (T)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>
      </div>

      {/* Canvas */}
      <div className="canvas-section">
        <FabricCanvas
          ref={fabricCanvasRef}
          width={CANVAS_WIDTH}
          height={canvasHeight}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerUpdate={handleLayerUpdate}
          onLayerSelect={handleLayerSelect}
        />
      </div>

      {/* Sidebar */}
      <div className="sidebar-section">
        {/* Image Uploader (conditionally shown) */}
        {showImageUploader && (
          <div className="panel">
            <div className="panel-header">
              <h3>Image Upload</h3>
              <button
                className="close-btn"
                onClick={() => setShowImageUploader(false)}
              >
                ×
              </button>
            </div>
            <ImageUploader onImageProcessed={handleImageProcessed} />
          </div>
        )}

        {/* Text Tool (conditionally shown) */}
        {showTextTool && (
          <div className="panel">
            <TextTool
              onAddText={handleAddText}
              onClose={() => setShowTextTool(false)}
            />
          </div>
        )}

        {/* Properties Panel */}
        <div className="panel">
          <PropertiesPanel
            selectedLayer={selectedLayer}
            canvasHeight={canvasHeight}
            onUpdateTextLayer={updateTextLayer}
            onUpdateImageLayer={updateImageLayer}
            onReprocessImageLayer={handleReprocessImageLayer}
            onCanvasHeightChange={handleCanvasHeightChange}
          />
        </div>

        {/* Layer Panel */}
        <div className="panel">
          <LayerPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={selectLayer}
            onToggleVisibility={toggleVisibility}
            onToggleLock={toggleLock}
            onRemoveLayer={removeLayer}
            onMoveLayer={moveLayer}
          />
        </div>

        {/* Printer Connection */}
        <div className="panel">
          <h3 className="panel-title">Printer</h3>
          <PrinterConnection onPrint={handlePrint} />
        </div>

        {/* Canvas Actions */}
        <div className="panel">
          <h3 className="panel-title">Canvas</h3>
          <button
            className="action-btn new-canvas-btn"
            onClick={handleNewCanvas}
            title="Clear all layers and start fresh"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Canvas
          </button>
        </div>
      </div>

      <style>{`
        .canvas-manager {
          display: grid;
          grid-template-columns: 80px 1fr 400px;
          gap: 0;
          height: 100%;
          overflow: hidden;
        }

        .toolbar-section {
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--color-border);
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .tool-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .tool-btn:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          transform: translateY(-1px);
        }

        .tool-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
        }

        .tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .canvas-section {
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: 2rem;
        }

        .sidebar-section {
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-left: 1px solid var(--color-border);
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .panel-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn:hover {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(167, 139, 250, 0.2);
        }

        .new-canvas-btn svg {
          transition: transform var(--transition-fast);
        }

        .new-canvas-btn:hover svg {
          transform: rotate(90deg);
        }

      `}</style>
    </div>
  );
}
