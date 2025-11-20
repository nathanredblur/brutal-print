// Main canvas manager with all tools integrated
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { usePrinterStore } from "../stores/usePrinterStore";
import { useLayersStore, selectSelectedLayer } from "../stores/useLayersStore";
import { useCanvasPersistence } from "../hooks/useCanvasPersistence";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useConfirmDialogStore } from "../stores/useConfirmDialogStore";
import {
  DEFAULT_DITHER_METHOD,
  DEFAULT_THRESHOLD,
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
} from "../constants/imageDefaults";
import Header from "./Header";
import LayersPanel from "./LayersPanel";
import PropertiesPanel from "./PropertiesPanel";
import ToolsBar from "./ToolsBar";
import CanvasSettingsPanel from "./CanvasSettingsPanel";
import AboutDialog from "./AboutDialog";
import ImageUploader from "./ImageUploader";
import PrinterConnection from "./PrinterConnection";
import TextGalleryPanel from "./TextGalleryPanel";
import GlobalConfirmDialog from "./GlobalConfirmDialog";
import FabricCanvas, { type FabricCanvasRef } from "./FabricCanvas";
import { PRINTER_WIDTH } from "../lib/dithering";
import { logger } from "../lib/logger";
import type { Layer, ImageLayer } from "../types/layer";
import { Panel } from "@/components/ui/panel";
import { DEFAULT_FONT_FAMILY } from "../constants/fonts";

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

export default function CanvasManager() {
  const fabricCanvasRef = useRef<FabricCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  const [advancedPanel, setAdvancedPanel] = useState<AdvancedPanel>(null);
  const [selectionType, setSelectionType] = useState<SelectionType>(null);
  const [showAboutDialog, setShowAboutDialog] = useState(false);

  // Keep a ref to always have fresh layers data
  const layersRef = useRef<Layer[]>([]);

  // Canvas dimensions
  const CANVAS_WIDTH = PRINTER_WIDTH;
  const [canvasHeight, setCanvasHeight] = useState(800);

  // Use printer store
  const printCanvas = usePrinterStore((state) => state.printCanvas);
  const isConnected = usePrinterStore((state) => state.isConnected);
  const isPrinting = usePrinterStore((state) => state.isPrinting);

  // Use confirm dialog store
  const confirmDialog = useConfirmDialogStore((state) => state.confirm);

  // Use Zustand store for layers
  const layers = useLayersStore((state) => state.layers);
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const selectedLayer = useLayersStore(selectSelectedLayer);
  const addImageLayer = useLayersStore((state) => state.addImageLayer);
  const addTextLayer = useLayersStore((state) => state.addTextLayer);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const toggleVisibility = useLayersStore((state) => state.toggleVisibility);
  const toggleLock = useLayersStore((state) => state.toggleLock);
  const selectLayer = useLayersStore((state) => state.selectLayer);
  const moveLayer = useLayersStore((state) => state.moveLayer);
  const updateLayer = useLayersStore((state) => state.updateLayer);
  const reprocessImageLayer = useLayersStore(
    (state) => state.reprocessImageLayer
  );
  const clearLayers = useLayersStore((state) => state.clearLayers);
  const copyLayer = useLayersStore((state) => state.copyLayer);
  const pasteLayer = useLayersStore((state) => state.pasteLayer);
  const duplicateLayer = useLayersStore((state) => state.duplicateLayer);
  const copiedLayer = useLayersStore((state) => state.copiedLayer);

  // Keep layersRef updated with the latest layers
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Enable persistence (auto-save)
  const persistence = useCanvasPersistence(canvasHeight);

  // Load saved state after component mounts (client-side only)
  useEffect(() => {
    persistence.loadState().then((state) => {
      if (state) {
        setCanvasHeight(state.canvasHeight || 800);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log printer state changes (only when they actually change)
  useEffect(() => {
    logger.logState("CanvasManager", "Printer connection state", {
      isConnected,
      isPrinting,
      source: "usePrinterStore (Zustand)",
    });
  }, [isConnected, isPrinting]);

  const handleImageUploaded = useCallback(
    async (imageDataUrl: string) => {
      // Process image and add as a new layer
      const layerName = `Image ${layers.length + 1}`;

      // Load image and process it
      const img = new Image();
      img.onload = async () => {
        const { processImageForPrinter, binaryDataToCanvas } = await import(
          "../lib/dithering"
        );

        // Process with default settings
        const { binaryData } = processImageForPrinter(img, {
          ditherMethod: DEFAULT_DITHER_METHOD,
          threshold: DEFAULT_THRESHOLD,
          brightness: DEFAULT_BRIGHTNESS,
          contrast: DEFAULT_CONTRAST,
          invert: false,
        });

        // Convert binary data to B&W canvas
        const processedCanvas = binaryDataToCanvas(binaryData, 1);

        addImageLayer(
          processedCanvas,
          imageDataUrl,
          DEFAULT_DITHER_METHOD,
          DEFAULT_THRESHOLD,
          false,
          {
            name: layerName,
            x: 0,
            y: 0,
          }
        );

        logger.success(
          "CanvasManager",
          "Image added as layer with dithering applied"
        );
        setShowImageUploader(false);
      };
      img.src = imageDataUrl;
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
      toast.info("Connect printer", {
        description: "Please connect your thermal printer first.",
      });
      return;
    }

    // Export canvas from Fabric.js
    const canvas = fabricCanvasRef.current?.exportToCanvas();
    if (!canvas) {
      logger.error("CanvasManager", "Canvas not available");
      toast.error("Canvas not available", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    logger.debug("CanvasManager", "Canvas exported from Fabric.js", {
      width: canvas.width,
      height: canvas.height,
    });

    try {
      const printOptions = {
        dither: DEFAULT_DITHER_METHOD,
        brightness: DEFAULT_BRIGHTNESS,
        intensity: 93,
      };

      logger.info("CanvasManager", "Calling printCanvas()", printOptions);

      // Print the canvas directly using the official method
      await printCanvas(canvas, printOptions);

      logger.success("CanvasManager", "Print completed!");
      toast.success("¡Impresión completada!", {
        description: "Tu diseño ha sido enviado a la impresora.",
      });
    } catch (error) {
      logger.error("CanvasManager", "Print failed", error);
      toast.error("Impresión fallida", {
        description: (error as Error).message,
      });
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

  // Handle opening advanced panels
  const handleOpenAdvancedPanel = useCallback((panelType: AdvancedPanel) => {
    setAdvancedPanel(panelType);
    // Close tools when opening advanced panels
    setShowImageUploader(false);
    setShowTextTool(false);
  }, []);

  // Handle opening canvas settings from toolbar
  const handleOpenCanvasSettings = useCallback(() => {
    setAdvancedPanel("canvas");
    setActiveTool(null);
    setShowImageUploader(false);
    setShowTextTool(false);
  }, []);

  // Handle opening printer panel from toolbar
  const handleOpenPrinterPanel = useCallback(() => {
    setAdvancedPanel("printer");
    setActiveTool(null);
    setShowImageUploader(false);
    setShowTextTool(false);
  }, []);

  // Handle opening about dialog
  const handleOpenAbout = useCallback(() => {
    setShowAboutDialog(true);
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
        fontFamily: options.fontFamily || DEFAULT_FONT_FAMILY,
        bold: options.bold || false,
        italic: options.italic || false,
        align: options.align || "left",
        color: "#000000",
      });

      logger.success("CanvasManager", "Text added as layer");
      toast.success("Text added!", {
        description: `${layerName} has been added to the canvas.`,
      });
      // Panel stays open to allow adding multiple text elements
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
                brightness: imageLayer.brightness ?? DEFAULT_BRIGHTNESS,
                contrast: imageLayer.contrast ?? DEFAULT_CONTRAST,
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
  const handleNewCanvas = useCallback(async () => {
    if (layers.length === 0) {
      toast.info("Empty canvas", {
        description: "There are no layers to clear.",
      });
      return;
    }

    const confirmed = await confirmDialog(
      "Create New Canvas?",
      "Are you sure you want to create a new canvas? This will delete all layers.",
      { confirmText: "Yes, clear all", cancelText: "Cancel" }
    );

    if (confirmed) {
      clearLayers();
      persistence.clearSavedState();
      toast.success("New canvas created!", {
        description: "All layers have been deleted.",
      });
      logger.info("CanvasManager", "New canvas created - all layers cleared");
    }
  }, [layers.length, clearLayers, persistence, toast, confirmDialog]);

  // Handle save
  const handleSave = useCallback(() => {
    // Save is automatic via persistence, just show confirmation
    toast.success("Saved!", {
      description: "Your work is automatically saved.",
    });
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
        toast.error("Export error", {
          description: "Canvas not available.",
        });
        return;
      }

      // Export as PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Export error", {
            description: "Could not create image.",
          });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `thermal-print-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Exported!", {
          description: "Your design has been downloaded.",
        });
        logger.info("CanvasManager", "Canvas exported as PNG");

        // Restore selection if needed
        if (wasSelected) {
          setTimeout(() => selectLayer(wasSelected), 200);
        }
      });
    } catch (error) {
      logger.error("CanvasManager", "Export failed", error);
      toast.error("Export error", {
        description: (error as Error).message,
      });
    }
  }, [toast, selectedLayerId, selectLayer]);

  // Handle delete element
  const handleDeleteElement = useCallback(() => {
    if (!selectedLayerId) {
      return;
    }
    removeLayer(selectedLayerId);
    toast.info("Element deleted", {
      description: "The selected element has been removed.",
    });
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
    logger.info("CanvasManager", "Canvas container clicked - deselecting");
  }, [selectLayer]);

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

    // Layer actions
    onToggleVisibility: () => {
      if (selectedLayerId) {
        toggleVisibility(selectedLayerId);
      }
    },
    onToggleLock: () => {
      if (selectedLayerId) {
        toggleLock(selectedLayerId);
      }
    },
    onCopyLayer: () => {
      copyLayer();
      if (selectedLayerId) {
        toast.success("Layer copied", {
          description: "Press Cmd+V to paste",
        });
      }
    },
    onPasteLayer: () => {
      if (copiedLayer) {
        pasteLayer();
        toast.success("Layer pasted");
      } else {
        toast.info("No layer to paste", {
          description: "Copy a layer first with Cmd+C",
        });
      }
    },
    onDuplicateLayer: () => {
      duplicateLayer();
      if (selectedLayerId) {
        toast.success("Layer duplicated");
      }
    },

    // Document actions
    onUndo: () => {
      // TODO: Implement undo/redo system
      toast.info("Coming soon", {
        description: "Undo/Redo will be available soon.",
      });
    },
    onRedo: () => {
      // TODO: Implement undo/redo system
      toast.info("Coming soon", {
        description: "Undo/Redo will be available soon.",
      });
    },
    onSave: handleSave,
    onExport: handleExport,
    onNewCanvas: handleNewCanvas,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Header
        onNewCanvas={handleNewCanvas}
        onSave={handleSave}
        onExport={handleExport}
        onPrint={handlePrint}
        canUndo={false}
        canRedo={false}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Always shows Layers */}
        <LayersPanel />

        {/* Additional left panels - appear conditionally */}
        {(showImageUploader || showTextTool || advancedPanel) && (
          <div className="w-[280px] bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-r border-slate-700 p-3 overflow-y-auto flex flex-col gap-3">
            {/* Printer Panel */}
            {advancedPanel === "printer" && (
              <Panel title="Printer" onClose={() => setAdvancedPanel(null)}>
                <PrinterConnection onPrint={handlePrint} />
              </Panel>
            )}

            {/* Canvas Settings Panel */}
            {advancedPanel === "canvas" && (
              <Panel
                title="Canvas Settings"
                onClose={() => setAdvancedPanel(null)}
              >
                <CanvasSettingsPanel
                  canvasHeight={canvasHeight}
                  onCanvasHeightChange={handleCanvasHeightChange}
                />
              </Panel>
            )}

            {/* Image Uploader */}
            {showImageUploader && !advancedPanel && (
              <Panel
                title="Upload Image"
                onClose={() => setShowImageUploader(false)}
              >
                <ImageUploader onImageUploaded={handleImageUploaded} />
              </Panel>
            )}

            {/* Text Gallery Panel */}
            {showTextTool && !advancedPanel && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-md p-3">
                <TextGalleryPanel
                  onAddText={handleAddText}
                  onClose={() => setShowTextTool(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Canvas Section */}
        <div className="flex-1 bg-slate-800 flex items-center justify-center overflow-auto p-6">
          <FabricCanvas
            ref={fabricCanvasRef}
            width={CANVAS_WIDTH}
            height={canvasHeight}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerUpdate={handleLayerUpdate}
            onLayerSelect={handleLayerSelect}
            onCanvasSelect={handleCanvasSelect}
            onToggleVisibility={toggleVisibility}
            onToggleLock={toggleLock}
            onRemoveLayer={removeLayer}
            onCopyLayer={(layerId) => {
              copyLayer(layerId);
              toast.success("Layer copied", {
                description: "Press Cmd+V to paste",
              });
            }}
            onPasteLayer={(x, y) => {
              pasteLayer(x, y);
              toast.success("Layer pasted");
            }}
            hasCopiedLayer={!!copiedLayer}
          />
        </div>

        {/* Right Panel - Properties */}
        <PropertiesPanel />
      </div>

      {/* Floating Tools Bar */}
      <ToolsBar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        onOpenCanvasSettings={handleOpenCanvasSettings}
        onOpenPrinterPanel={handleOpenPrinterPanel}
        onOpenAbout={handleOpenAbout}
      />

      {/* About Dialog */}
      <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />

      {/* Global Confirmation Dialog */}
      <GlobalConfirmDialog />
    </div>
  );
}
