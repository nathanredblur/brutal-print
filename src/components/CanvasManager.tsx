// Main canvas manager with all tools integrated
import { useState, useRef, useEffect, useCallback } from "react";
import { usePrinterContext } from "../contexts/PrinterContext";
import { useToastContext } from "../contexts/ToastContext";
import { useLayers } from "../hooks/useLayers";
import { useCanvasPersistence } from "../hooks/useCanvasPersistence";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ContextBar from "./ContextBar";
import FontPanel from "./FontPanel";
import FilterPanel from "./FilterPanel";
import PositionLayersPanel from "./PositionLayersPanel";
import CanvasSettingsPanel from "./CanvasSettingsPanel";
import ImageUploader from "./ImageUploader";
import PrinterConnection from "./PrinterConnection";
import TextTool from "./TextTool";
import FabricCanvas, { type FabricCanvasRef } from "./FabricCanvas";
import { PRINTER_WIDTH } from "../lib/dithering";
import { logger } from "../lib/logger";
import type { Layer, ImageLayer, TextLayer } from "../types/layer";

type Tool = "image" | "text";
type AdvancedPanel =
  | "font"
  | "filter"
  | "position"
  | "printer"
  | "canvas"
  | null;

// Special selection state for canvas itself
type SelectionType = "layer" | "canvas" | null;

// Helper function to load state from localStorage (outside component)
async function loadSavedState() {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Load from localStorage
    const stored = localStorage.getItem("thermal-print-studio-canvas-state");
    if (!stored) return null;

    const state = JSON.parse(stored);
    if (!state.layers || state.layers.length === 0) return null;

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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  const [advancedPanel, setAdvancedPanel] = useState<AdvancedPanel>(null);
  const [selectionType, setSelectionType] = useState<SelectionType>(null);

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

    // If printer not connected, open printer panel
    if (!isConnected) {
      logger.info("CanvasManager", "Opening printer connection panel");
      setAdvancedPanel("printer");
      setActiveTool(null);
      setShowImageUploader(false);
      setShowTextTool(false);
      toast.info(
        "Connect printer",
        "Please connect your thermal printer first."
      );
      return;
    }

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
        "¡Impresión completada!",
        "Tu diseño ha sido enviado a la impresora."
      );
    } catch (error) {
      logger.error("CanvasManager", "Print failed", error);
      toast.error("Impresión fallida", (error as Error).message);
    }
  }, [isConnected, isPrinting, printCanvas, toast]);

  const handleToolSelect = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (tool === "image") {
      setShowImageUploader(true);
      setShowTextTool(false);
      setAdvancedPanel(null);
    } else if (tool === "text") {
      setShowTextTool(true);
      setShowImageUploader(false);
      setAdvancedPanel(null);
    } else if (tool === "select") {
      setShowImageUploader(false);
      setShowTextTool(false);
      setAdvancedPanel(null);
    }
  }, []);

  // Handle opening advanced panels from context bar
  const handleOpenAdvancedPanel = useCallback((panelType: AdvancedPanel) => {
    setAdvancedPanel(panelType);
  }, []);

  // Handle opening canvas settings
  const handleOpenCanvasSettings = useCallback(() => {
    setAdvancedPanel("canvas");
    setActiveTool(null);
    setShowImageUploader(false);
    setShowTextTool(false);
  }, []);

  // Handle layer movement with direction (up/down)
  const handleMoveLayerByDirection = useCallback(
    (layerId: string, direction: "up" | "down") => {
      const currentIndex = layers.findIndex((l) => l.id === layerId);
      if (currentIndex === -1) return;

      if (direction === "up" && currentIndex < layers.length - 1) {
        moveLayer(currentIndex, currentIndex + 1);
      } else if (direction === "down" && currentIndex > 0) {
        moveLayer(currentIndex, currentIndex - 1);
      }
    },
    [layers, moveLayer]
  );

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

      // Always update position/rotation/dimensions immediately for smooth interaction
      updateLayer(layerId, updates);

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
                brightness: imageLayer.brightness ?? 128,
                contrast: imageLayer.contrast ?? 100,
                bayerMatrixSize: imageLayer.bayerMatrixSize ?? 4,
                halftoneCellSize: imageLayer.halftoneCellSize ?? 4,
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
          } catch (error) {
            logger.error(
              "CanvasManager",
              "Failed to reprocess scaled image",
              error
            );
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
      updates: {
        ditherMethod?: string;
        threshold?: number;
        invert?: boolean;
        brightness?: number;
        contrast?: number;
        bayerMatrixSize?: number;
        halftoneCellSize?: number;
      }
    ) => {
      reprocessImageLayer(layerId, newImageData, updates);
      // No toasts - keep UI clean and non-intrusive
    },
    [reprocessImageLayer]
  );

  // Handle new canvas (clear all layers)
  const handleNewCanvas = useCallback(() => {
    if (layers.length === 0) {
      toast.info("Empty canvas", "There are no layers to clear.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to create a new canvas? This will delete all layers."
    );
    if (confirmed) {
      clearLayers();
      persistence.clearSavedState();
      toast.success("New canvas created!", "All layers have been deleted.");
      logger.info("CanvasManager", "New canvas created - all layers cleared");
    }
  }, [layers.length, clearLayers, persistence, toast]);

  // Handle save
  const handleSave = useCallback(() => {
    // Save is automatic via persistence, just show confirmation
    toast.success("Saved!", "Your work is automatically saved.");
    logger.info("CanvasManager", "Manual save triggered");
  }, [toast]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      // Deselect any active element before exporting
      const wasSelected = selectedLayerId;
      if (wasSelected) {
        selectLayer(null);
        logger.info("CanvasManager", "Deselected layer before export");
        // Wait a bit for the deselection to take effect
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const canvas = fabricCanvasRef.current?.exportToCanvas();
      if (!canvas) {
        toast.error("Export error", "Canvas not available.");
        return;
      }

      // Export as PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Export error", "Could not create image.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `thermal-print-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Exported!", "Your design has been downloaded.");
        logger.info("CanvasManager", "Canvas exported as PNG");

        // Restore selection if needed
        if (wasSelected) {
          setTimeout(() => selectLayer(wasSelected), 200);
        }
      });
    } catch (error) {
      logger.error("CanvasManager", "Export failed", error);
      toast.error("Export error", (error as Error).message);
    }
  }, [toast, selectedLayerId, selectLayer]);

  // Handle delete element
  const handleDeleteElement = useCallback(() => {
    if (!selectedLayerId) {
      return;
    }
    removeLayer(selectedLayerId);
    toast.info("Element deleted", "The selected element has been removed.");
    logger.info("CanvasManager", "Element deleted via keyboard shortcut", {
      layerId: selectedLayerId,
    });
  }, [selectedLayerId, removeLayer, toast]);

  // Handle element movement with arrow keys
  const handleMoveElement = useCallback(
    (direction: "up" | "down" | "left" | "right", amount: number = 1) => {
      if (!selectedLayerId || !selectedLayer) {
        return;
      }

      const updates: Partial<Layer> = {};

      switch (direction) {
        case "up":
          updates.y = selectedLayer.y - amount;
          break;
        case "down":
          updates.y = selectedLayer.y + amount;
          break;
        case "left":
          updates.x = selectedLayer.x - amount;
          break;
        case "right":
          updates.x = selectedLayer.x + amount;
          break;
      }

      updateLayer(selectedLayerId, updates);
    },
    [selectedLayerId, selectedLayer, updateLayer]
  );

  // Handle canvas selection (when clicking on empty canvas area)
  const handleCanvasSelect = useCallback(() => {
    selectLayer(null);
    setSelectionType("canvas");
    setActiveTool(null);
    setShowImageUploader(false);
    setShowTextTool(false);
    setAdvancedPanel(null);
    logger.info("CanvasManager", "Canvas selected");
  }, [selectLayer]);

  // Handle click outside canvas (deselect everything)
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const canvasContainer = canvasContainerRef.current;

      // Check if click is outside the canvas container
      if (canvasContainer && !canvasContainer.contains(target)) {
        // Also check if it's not in a sidebar/panel/header
        const isInPanel = target.closest(
          ".sidebar, .left-panel-container, .header, .context-bar"
        );
        if (!isInPanel) {
          selectLayer(null);
          setSelectionType(null);
          logger.info("CanvasManager", "Clicked outside - deselected");
        }
      }
    },
    [selectLayer]
  );

  // Setup click outside listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    // Tool shortcuts (removed onSelectTool - selection is always available)
    onImageTool: () => {
      setActiveTool("image");
      setShowImageUploader(true);
      setShowTextTool(false);
      setAdvancedPanel(null);
      setSelectionType(null);
    },
    onTextTool: () => {
      setActiveTool("text");
      setShowImageUploader(false);
      setShowTextTool(true);
      setAdvancedPanel(null);
      setSelectionType(null);
    },

    // Element actions
    onDeleteElement: handleDeleteElement,
    onMoveUp: (amount) => handleMoveElement("up", amount),
    onMoveDown: (amount) => handleMoveElement("down", amount),
    onMoveLeft: (amount) => handleMoveElement("left", amount),
    onMoveRight: (amount) => handleMoveElement("right", amount),

    // Document actions
    onUndo: () => {
      // TODO: Implement undo/redo system
      toast.info("Coming soon", "Undo/Redo will be available soon.");
    },
    onRedo: () => {
      // TODO: Implement undo/redo system
      toast.info("Coming soon", "Undo/Redo will be available soon.");
    },
    onSave: handleSave,
    onExport: handleExport,
    onNewCanvas: handleNewCanvas,
  });

  return (
    <div className="canvas-manager-wrapper">
      {/* Header */}
      <Header
        onNewCanvas={handleNewCanvas}
        onSave={handleSave}
        onExport={handleExport}
        onPrint={handlePrint}
        canUndo={false}
        canRedo={false}
        isPrinting={isPrinting}
        isConnected={isConnected}
      />

      <div className="canvas-manager">
        {/* Left Sidebar - Canva style */}
        <Sidebar
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          onOpenCanvasSettings={handleOpenCanvasSettings}
        />

        {/* Left Panel - Dynamic content based on active tool and context */}
        <div className="left-panel-container">
          {/* Advanced panel from context bar */}
          {advancedPanel === "font" && selectedLayer?.type === "text" && (
            <div className="panel">
              <div className="panel-header">
                <h3>Fuente</h3>
                <button
                  className="close-btn"
                  onClick={() => setAdvancedPanel(null)}
                >
                  ×
                </button>
              </div>
              <FontPanel
                textLayer={selectedLayer as TextLayer}
                onUpdateTextLayer={updateTextLayer}
              />
            </div>
          )}

          {advancedPanel === "filter" && selectedLayer?.type === "image" && (
            <div className="panel">
              <div className="panel-header">
                <h3>Filtros</h3>
                <button
                  className="close-btn"
                  onClick={() => setAdvancedPanel(null)}
                >
                  ×
                </button>
              </div>
              <FilterPanel
                imageLayer={selectedLayer as ImageLayer}
                onUpdateImageLayer={updateImageLayer}
                onReprocessImageLayer={handleReprocessImageLayer}
              />
            </div>
          )}

          {advancedPanel === "position" && selectedLayer && (
            <div className="panel">
              <div className="panel-header">
                <h3>Posición y Capas</h3>
                <button
                  className="close-btn"
                  onClick={() => setAdvancedPanel(null)}
                >
                  ×
                </button>
              </div>
              <PositionLayersPanel
                selectedLayer={selectedLayer}
                layers={layers}
                onUpdateLayer={updateLayer}
                onSelectLayer={selectLayer}
                onToggleVisibility={toggleVisibility}
                onToggleLock={toggleLock}
                onRemoveLayer={removeLayer}
                onMoveLayer={handleMoveLayerByDirection}
              />
            </div>
          )}

          {advancedPanel === "printer" && (
            <div className="panel">
              <div className="panel-header">
                <h3>Printer</h3>
                <button
                  className="close-btn"
                  onClick={() => setAdvancedPanel(null)}
                >
                  ×
                </button>
              </div>
              <PrinterConnection onPrint={handlePrint} />
            </div>
          )}

          {advancedPanel === "canvas" && (
            <div className="panel">
              <div className="panel-header">
                <h3>Canvas Settings</h3>
                <button
                  className="close-btn"
                  onClick={() => setAdvancedPanel(null)}
                >
                  ×
                </button>
              </div>
              <CanvasSettingsPanel
                canvasHeight={canvasHeight}
                onCanvasHeightChange={handleCanvasHeightChange}
              />
            </div>
          )}

          {/* Image Uploader (when image tool is active) */}
          {showImageUploader && !advancedPanel && (
            <div className="panel">
              <div className="panel-header">
                <h3>Subir Imagen</h3>
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

          {/* Text Tool (when text tool is active) */}
          {showTextTool && !advancedPanel && (
            <div className="panel">
              <TextTool
                onAddText={handleAddText}
                onClose={() => setShowTextTool(false)}
              />
            </div>
          )}
        </div>

        {/* Canvas Section with Context Bar */}
        <div className="canvas-container">
          {/* Context Bar - appears when element is selected */}
          <ContextBar
            selectedLayer={selectedLayer}
            selectionType={selectionType}
            onUpdateLayer={updateLayer}
            onUpdateTextLayer={updateTextLayer}
            onUpdateImageLayer={updateImageLayer}
            onOpenAdvancedPanel={handleOpenAdvancedPanel}
          />

          {/* Canvas */}
          <div className="canvas-section" ref={canvasContainerRef}>
            <FabricCanvas
              ref={fabricCanvasRef}
              width={CANVAS_WIDTH}
              height={canvasHeight}
              layers={layers}
              selectedLayerId={selectedLayerId}
              onLayerUpdate={handleLayerUpdate}
              onLayerSelect={handleLayerSelect}
              onCanvasSelect={handleCanvasSelect}
            />
          </div>
        </div>
      </div>

      <style>{`
        .canvas-manager-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .canvas-manager {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .left-panel-container {
          width: 360px;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--color-border);
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .canvas-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .canvas-section {
          flex: 1;
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: 2rem;
        }

        .canvas-section > div {
          display: flex;
          justify-content: center;
          align-items: center;
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
