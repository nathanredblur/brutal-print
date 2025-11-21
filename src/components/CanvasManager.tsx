// Main canvas manager with all tools integrated
import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { usePrinterStore } from "../stores/usePrinterStore";
import { useLayersStore } from "../stores/useLayersStore";
import { useCanvasStore } from "../stores/useCanvasStore";
import { useUIStore, ActivePanel } from "../stores/useUIStore";
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
import { logger } from "../lib/logger";
import type { Layer, ImageLayer } from "../types/layer";
import { Panel } from "@/components/ui/panel";
import { DEFAULT_FONT_FAMILY } from "../constants/fonts";

export default function CanvasManager() {
  const fabricCanvasRef = useRef<FabricCanvasRef>(null);

  // Canvas dimensions
  const canvasHeight = useCanvasStore((state) => state.canvasHeight);
  const setCanvasHeight = useCanvasStore((state) => state.setCanvasHeight);

  // UI Store
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const closeActivePanel = useUIStore((state) => state.closeActivePanel);
  const showAboutDialog = useUIStore((state) => state.showAboutDialog);
  const setShowAboutDialog = useUIStore((state) => state.setShowAboutDialog);

  // Use printer store
  const printCanvas = usePrinterStore((state) => state.printCanvas);
  const isConnected = usePrinterStore((state) => state.isConnected);
  const isPrinting = usePrinterStore((state) => state.isPrinting);

  // Use Zustand store for layers
  const hasHydrated = useLayersStore((state) => state._hasHydrated);
  const layers = useLayersStore((state) => state.layers);
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const addImageLayer = useLayersStore((state) => state.addImageLayer);
  const addTextLayer = useLayersStore((state) => state.addTextLayer);
  const selectLayer = useLayersStore((state) => state.selectLayer);

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
      try {
        // addImageLayer now processes the image internally
        await addImageLayer(imageDataUrl, DEFAULT_DITHER_METHOD, {
          name: `Image ${layers.length + 1}`,
          x: 0,
          y: 0,
          threshold: DEFAULT_THRESHOLD,
          brightness: DEFAULT_BRIGHTNESS,
          contrast: DEFAULT_CONTRAST,
          invert: false,
        });

        logger.success(
          "CanvasManager",
          "Image added as layer with dithering applied"
        );
        closeActivePanel();
      } catch (error) {
        logger.error("CanvasManager", "Failed to add image layer", error);
        toast.error("Failed to add image", {
          description: "Please try again with a different image.",
        });
      }
    },
    [addImageLayer, layers.length, closeActivePanel]
  );

  const handlePrint = useCallback(async () => {
    logger.separator("HANDLE PRINT");
    logger.info("CanvasManager", "handlePrint() called");

    // If printer not connected, open printer panel
    if (!isConnected) {
      logger.info("CanvasManager", "Opening printer connection panel");
      setActivePanel(ActivePanel.PrintSettings);
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
  }, [isConnected, printCanvas, toast, setActivePanel]);

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

  // Handle canvas height change
  const handleCanvasHeightChange = useCallback((height: number) => {
    setCanvasHeight(height);
    logger.info("CanvasManager", "Canvas height changed", { height });
  }, []);

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

  // Keyboard shortcuts
  // Keyboard shortcuts - now consuming stores directly
  useKeyboardShortcuts({
    // Only export needs canvas ref access
    onExport: handleExport,
    // Undo/Redo for future implementation
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
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Header
        onExport={handleExport}
        onPrint={handlePrint}
        canUndo={false}
        canRedo={false}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Always shows Layers */}
        <LayersPanel />

        {/* Additional left panels - appear conditionally */}
        {activePanel && (
          <div className="w-[280px] bg-linear-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-r border-slate-700 p-3 overflow-y-auto flex flex-col gap-3">
            {/* Printer Panel */}
            {activePanel === ActivePanel.PrintSettings && (
              <Panel title="Printer" onClose={closeActivePanel}>
                <PrinterConnection onPrint={handlePrint} />
              </Panel>
            )}

            {/* Canvas Settings Panel */}
            {activePanel === ActivePanel.CanvasSettings && (
              <Panel title="Canvas Settings" onClose={closeActivePanel}>
                <CanvasSettingsPanel
                  canvasHeight={canvasHeight}
                  onCanvasHeightChange={handleCanvasHeightChange}
                />
              </Panel>
            )}

            {/* Image Uploader */}
            {activePanel === ActivePanel.ImagePanel && (
              <Panel title="Upload Image" onClose={closeActivePanel}>
                <ImageUploader onImageUploaded={handleImageUploaded} />
              </Panel>
            )}

            {/* Text Gallery Panel */}
            {activePanel === ActivePanel.TextPanel && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-md p-3">
                <TextGalleryPanel
                  onAddText={handleAddText}
                  onClose={closeActivePanel}
                />
              </div>
            )}
          </div>
        )}

        {/* Canvas Section */}
        <div className="flex-1 bg-slate-800 flex items-center justify-center overflow-auto p-6">
          {hasHydrated ? (
            <FabricCanvas ref={fabricCanvasRef} height={canvasHeight} />
          ) : (
            <div className="flex items-center justify-center text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-sm">Loading canvas...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Properties */}
        <PropertiesPanel />
      </div>

      {/* Floating Tools Bar */}
      <ToolsBar />

      {/* About Dialog */}
      <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />

      {/* Global Confirmation Dialog */}
      <GlobalConfirmDialog />
    </div>
  );
}
