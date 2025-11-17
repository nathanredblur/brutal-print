/**
 * FabricCanvas Component
 *
 * Interactive canvas with drag, resize, rotate, and selection capabilities
 * Uses Fabric.js for advanced canvas manipulation
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as fabric from "fabric";
import type { Layer, ImageLayer, TextLayer } from "../types/layer";
import { logger } from "../lib/logger";
import { cn } from "../lib/utils";
import { DEFAULT_FONT_FAMILY } from "../constants/fonts";

interface FabricCanvasProps {
  className?: string;
  width: number;
  height: number;
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerUpdate?: (
    layerId: string,
    updates: Partial<Layer>,
    wasScaled?: boolean
  ) => void;
  onLayerSelect?: (layerId: string | null) => void;
  onCanvasSelect?: () => void;
}

export interface FabricCanvasRef {
  getFabricCanvas: () => fabric.Canvas | null;
  exportToCanvas: () => HTMLCanvasElement | null;
  addImageFromCanvas: (imageCanvas: HTMLCanvasElement, layerId: string) => void;
  addText: (text: string, layerId: string, options: any) => void;
}

// Helper type for Fabric objects with custom data
interface FabricObjectWithData extends fabric.FabricObject {
  data?: { layerId: string };
}

const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(
  (
    {
      className,
      width,
      height,
      layers,
      selectedLayerId,
      onLayerUpdate,
      onLayerSelect,
      onCanvasSelect,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const layerObjectsRef = useRef<Map<string, fabric.FabricObject>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    // Throttling refs for real-time scaling
    const scalingThrottleRef = useRef<NodeJS.Timeout | null>(null);
    const lastScaleProcessRef = useRef<number>(0);
    const pendingScaleRef = useRef<{
      layerId: string;
      updates: Partial<Layer>;
      wasScaled: boolean;
    } | null>(null);

    // Initialize Fabric canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
        // Disable image smoothing globally for pixel-perfect 1-bit rendering
        enableRetinaScaling: false,
        imageSmoothingEnabled: false,
      });

      fabricRef.current = fabricCanvas;

      // Clear any stale object references from previous instance (e.g., after HMR)
      layerObjectsRef.current.clear();

      logger.info("FabricCanvas", "Fabric.js canvas initialized", {
        width,
        height,
      });

      // Handle object selection
      fabricCanvas.on("selection:created", (e: any) => {
        const selected = e.selected?.[0] as FabricObjectWithData;
        if (selected?.data?.layerId) {
          onLayerSelect?.(selected.data.layerId);
        }
      });

      fabricCanvas.on("selection:updated", (e: any) => {
        const selected = e.selected?.[0] as FabricObjectWithData;
        if (selected?.data?.layerId) {
          onLayerSelect?.(selected.data.layerId);
        }
      });

      fabricCanvas.on("selection:cleared", () => {
        onLayerSelect?.(null);
      });

      // Handle real-time scaling (while dragging)
      fabricCanvas.on("object:scaling", (e: any) => {
        const obj = e.target as FabricObjectWithData;
        if (obj?.data?.layerId) {
          const finalWidth = (obj.width || 0) * (obj.scaleX || 1);
          const finalHeight = (obj.height || 0) * (obj.scaleY || 1);

          const updates: Partial<Layer> = {
            x: obj.left || 0,
            y: obj.top || 0,
            width: finalWidth,
            height: finalHeight,
            rotation: obj.angle || 0,
          };

          const wasScaled = obj.scaleX !== 1 || obj.scaleY !== 1;

          // Throttle the processing
          const now = Date.now();
          const timeSinceLastProcess = now - lastScaleProcessRef.current;
          const THROTTLE_MS = 150; // Process at most every 150ms

          pendingScaleRef.current = {
            layerId: obj.data.layerId,
            updates,
            wasScaled,
          };

          if (timeSinceLastProcess >= THROTTLE_MS) {
            lastScaleProcessRef.current = now;
            onLayerUpdate?.(obj.data.layerId, updates, wasScaled);
            pendingScaleRef.current = null;
          } else {
            if (scalingThrottleRef.current) {
              clearTimeout(scalingThrottleRef.current);
            }

            const delay = THROTTLE_MS - timeSinceLastProcess;
            scalingThrottleRef.current = setTimeout(() => {
              if (pendingScaleRef.current) {
                lastScaleProcessRef.current = Date.now();
                onLayerUpdate?.(
                  pendingScaleRef.current.layerId,
                  pendingScaleRef.current.updates,
                  pendingScaleRef.current.wasScaled
                );
                pendingScaleRef.current = null;
              }
            }, delay);
          }
        }
      });

      // Handle text editing
      fabricCanvas.on("text:changed", (e: any) => {
        const obj = e.target as FabricObjectWithData;
        const layerId = obj?.data?.layerId;
        if (layerId && obj instanceof fabric.Textbox) {
          const newText = obj.text || "";

          logger.info("FabricCanvas", "📝 Text changed in canvas", {
            layerId,
            newText,
          });

          // Update the layer with new text content
          onLayerUpdate?.(layerId, { text: newText } as any);
        }
      });

      // Handle object modifications (drag, resize, rotate) - FINAL value
      fabricCanvas.on("object:modified", (e: any) => {
        const obj = e.target as FabricObjectWithData;
        if (obj?.data?.layerId) {
          // Clear any pending scaling throttle
          if (scalingThrottleRef.current) {
            clearTimeout(scalingThrottleRef.current);
            scalingThrottleRef.current = null;
          }

          // Detect scaling by checking if scale is not 1:1
          const wasScaled = obj.scaleX !== 1 || obj.scaleY !== 1;

          const layerId = (obj as FabricObjectWithData).data?.layerId;
          if (!layerId) return;

          // For text: reset scale to 1 and keep dimensions as box size
          // This allows resizing the text box without changing font size
          if (obj instanceof fabric.Textbox && wasScaled) {
            const finalWidth = (obj.width || 0) * (obj.scaleX || 1);

            // Update textbox width and reset scale
            obj.set({
              width: finalWidth,
              scaleX: 1,
              scaleY: 1,
            });
            obj.setCoords();
            fabricCanvas.renderAll();

            logger.info("FabricCanvas", "📝 Text box resized - width updated", {
              layerId,
              newWidth: finalWidth,
              fontSize: obj.fontSize,
            });
          }

          // Calculate final dimensions AFTER scale reset
          const finalWidth = (obj.width || 0) * (obj.scaleX || 1);
          const finalHeight = (obj.height || 0) * (obj.scaleY || 1);

          const updates: Partial<Layer> = {
            x: obj.left || 0,
            y: obj.top || 0,
            width: finalWidth,
            height: finalHeight,
            rotation: obj.angle || 0,
          };

          // Add fontSize to updates for text layers (unchanged)
          if (obj instanceof fabric.Textbox) {
            (updates as any).fontSize = obj.fontSize;
          }

          logger.info("FabricCanvas", "🔍 Object modified EVENT [FINAL]", {
            layerId,
            wasScaled,
            type: obj.type,
            scaleValues: {
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
            },
            finalDimensions: {
              width: finalWidth,
              height: finalHeight,
            },
            fontSize: obj instanceof fabric.Textbox ? obj.fontSize : undefined,
          });

          // Process the final value
          lastScaleProcessRef.current = Date.now();
          onLayerUpdate?.(layerId, updates, wasScaled);
          pendingScaleRef.current = null;
        }
      });

      return () => {
        // Clean up throttle timers
        if (scalingThrottleRef.current) {
          clearTimeout(scalingThrottleRef.current);
        }
        fabricCanvas.dispose();
        fabricRef.current = null;
      };
    }, []); // Only initialize once

    // Handle click on canvas container (deselect when clicking on gray area)
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const container = containerRef.current;

        // Check if click is inside the fabric canvas container
        const isInsideContainer = container && container.contains(target);
        // But NOT on the actual canvas element
        const isCanvas = target.tagName === "CANVAS";

        // Deselect if clicking on the gray area (not on canvas itself)
        if (isInsideContainer && !isCanvas) {
          onCanvasSelect?.();
          logger.info(
            "FabricCanvas",
            "Clicked on canvas container (not on canvas) - deselecting"
          );
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [onCanvasSelect]);

    // Update canvas dimensions when they change
    useEffect(() => {
      const fabricCanvas = fabricRef.current;
      if (!fabricCanvas) return;

      fabricCanvas.setDimensions({ width, height });
      fabricCanvas.renderAll();

      logger.debug("FabricCanvas", "Canvas dimensions updated", {
        width,
        height,
      });
    }, [width, height]);

    // Sync layers with Fabric objects
    useEffect(() => {
      const fabricCanvas = fabricRef.current;
      if (!fabricCanvas) return;

      const currentLayerIds = new Set(layers.map((l) => l.id));
      const fabricLayerIds = new Set(layerObjectsRef.current.keys());

      // Remove objects that no longer have layers
      for (const [layerId, obj] of layerObjectsRef.current.entries()) {
        if (!currentLayerIds.has(layerId)) {
          fabricCanvas.remove(obj);
          layerObjectsRef.current.delete(layerId);
          logger.debug("FabricCanvas", "Removed object", { layerId });
        }
      }

      // Add or update objects for each layer
      layers.forEach((layer, index) => {
        const existingObj = layerObjectsRef.current.get(layer.id);

        if (existingObj) {
          // Update existing object
          updateFabricObject(existingObj, layer);

          // Reorder object - move to correct z-index position
          const currentIndex = fabricCanvas.getObjects().indexOf(existingObj);
          if (currentIndex !== -1 && currentIndex !== index) {
            // Preserve selection state during reordering
            const wasSelected = fabricCanvas.getActiveObject() === existingObj;

            fabricCanvas.remove(existingObj);
            fabricCanvas.insertAt(index, existingObj);

            // Restore selection if object was selected
            if (wasSelected) {
              fabricCanvas.setActiveObject(existingObj);
            }
          }
        } else {
          // Create new object at specific index
          createFabricObject(layer, fabricCanvas, index);
        }
      });

      fabricCanvas.renderAll();
    }, [layers]);

    // Sync selection
    useEffect(() => {
      const fabricCanvas = fabricRef.current;
      if (!fabricCanvas) return;

      if (selectedLayerId) {
        const obj = layerObjectsRef.current.get(selectedLayerId);
        if (obj && fabricCanvas.getActiveObject() !== obj) {
          fabricCanvas.setActiveObject(obj);
          fabricCanvas.renderAll();
        }
      } else {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    }, [selectedLayerId]);

    // Create Fabric object from layer
    const createFabricObject = (
      layer: Layer,
      fabricCanvas: fabric.Canvas,
      index?: number
    ) => {
      let obj: FabricObjectWithData | null = null;

      if (layer.type === "image") {
        const imageLayer = layer as ImageLayer;

        // Create image from canvas element (1-bit processed image)
        const canvasElement = imageLayer.imageData;

        // The canvas has been processed at the exact dimensions we want to display
        // So we use 1:1 scale for pixel-perfect rendering
        // Note: layer.width/height should match canvasElement.width/height after reprocessing
        const scaleX = layer.width / canvasElement.width;
        const scaleY = layer.height / canvasElement.height;

        // Create Fabric image with proper image smoothing disabled for pixel-perfect 1-bit rendering
        const img = new fabric.FabricImage(canvasElement, {
          left: layer.x,
          top: layer.y,
          scaleX: scaleX,
          scaleY: scaleY,
          angle: layer.rotation,
          selectable: !layer.locked,
          opacity: layer.opacity,
          // Disable image smoothing for crisp 1-bit rendering
          imageSmoothing: false,
        }) as FabricObjectWithData;

        logger.debug("FabricCanvas", "Image object created", {
          layerId: layer.id,
          canvasSize: `${canvasElement.width}x${canvasElement.height}`,
          layerSize: `${layer.width}x${layer.height}`,
          scale: `${scaleX}x${scaleY}`,
        });

        obj = img;
      } else if (layer.type === "text") {
        const textLayer = layer as TextLayer;
        const text = new fabric.Textbox(textLayer.text, {
          left: layer.x,
          top: layer.y,
          width: layer.width,
          fontSize: textLayer.fontSize,
          fontFamily: textLayer.fontFamily,
          fontWeight: textLayer.bold ? "bold" : "normal",
          fontStyle: textLayer.italic ? "italic" : "normal",
          textAlign: textLayer.align,
          fill: textLayer.color,
          angle: layer.rotation,
          selectable: !layer.locked,
          editable: !layer.locked,
          opacity: layer.opacity,
        }) as FabricObjectWithData;

        // Disable top and bottom middle controls
        text.setControlVisible("mt", false);
        text.setControlVisible("mb", false);

        obj = text;
      }

      if (obj) {
        obj.data = { layerId: layer.id };
        obj.visible = layer.visible;

        // Add at specific index if provided, otherwise add to top
        if (index !== undefined) {
          fabricCanvas.insertAt(index, obj);
        } else {
          fabricCanvas.add(obj);
        }

        layerObjectsRef.current.set(layer.id, obj);
        logger.debug("FabricCanvas", "Created object", {
          layerId: layer.id,
          type: layer.type,
          index,
        });
      }
    };

    // Update existing Fabric object
    const updateFabricObject = (obj: fabric.FabricObject, layer: Layer) => {
      if (layer.type === "image" && obj instanceof fabric.FabricImage) {
        const imageLayer = layer as ImageLayer;
        const currentElement = obj.getElement();

        // Safety check: currentElement might be undefined during hydration/loading
        if (!currentElement || !imageLayer.imageData) {
          logger.warn("FabricCanvas", "Skipping update - element not ready", {
            layerId: layer.id,
            hasCurrentElement: !!currentElement,
            hasImageData: !!imageLayer.imageData,
          });
          return;
        }

        // Check if image canvas was reprocessed (different canvas element)
        const wasReprocessed = currentElement !== imageLayer.imageData;

        logger.info("FabricCanvas", "🔍 updateFabricObject called", {
          layerId: layer.id,
          wasReprocessed,
          currentObjState: {
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            canvasSize: `${currentElement.width}x${currentElement.height}`,
          },
          newLayerState: {
            width: layer.width,
            height: layer.height,
            canvasSize: `${imageLayer.imageData.width}x${imageLayer.imageData.height}`,
          },
          currentCanvas: currentElement,
          newCanvas: imageLayer.imageData,
        });

        if (wasReprocessed) {
          // Image reprocessed - update element and FORCE 1:1 scale
          logger.info(
            "FabricCanvas",
            "🎨 REPROCESSED! Updating element and forcing 1:1...",
            {
              layerId: layer.id,
              oldCanvasSize: `${currentElement.width}x${currentElement.height}`,
              newCanvasSize: `${imageLayer.imageData.width}x${imageLayer.imageData.height}`,
              layerSize: `${layer.width}x${layer.height}`,
            }
          );

          // Check if rotation changed
          const rotationChanged =
            Math.abs((obj.angle || 0) - layer.rotation) > 0.01;

          obj.setElement(imageLayer.imageData);

          if (rotationChanged) {
            // For rotation changes, maintain center position
            const center = obj.getCenterPoint();

            obj.set({
              angle: layer.rotation,
              scaleX: 1,
              scaleY: 1,
              width: imageLayer.imageData.width,
              height: imageLayer.imageData.height,
              selectable: !layer.locked,
              visible: layer.visible,
              opacity: layer.opacity,
              dirty: true, // Force Fabric to re-render
            });

            // Restore center position
            obj.setPositionByOrigin(center, "center", "center");

            // Update layer state with new coordinates (after rotation adjustment)
            const newX = obj.left || 0;
            const newY = obj.top || 0;
            if (
              Math.abs(newX - layer.x) > 0.01 ||
              Math.abs(newY - layer.y) > 0.01
            ) {
              onLayerUpdate?.(layer.id, { x: newX, y: newY });
            }
          } else {
            obj.set({
              left: layer.x,
              top: layer.y,
              angle: layer.rotation,
              scaleX: 1,
              scaleY: 1,
              width: imageLayer.imageData.width,
              height: imageLayer.imageData.height,
              selectable: !layer.locked,
              visible: layer.visible,
              opacity: layer.opacity,
              dirty: true, // Force Fabric to re-render
            });
          }

          // Force update coordinates
          obj.setCoords();

          logger.success(
            "FabricCanvas",
            "✅ Fabric object updated to 1:1 scale!",
            {
              layerId: layer.id,
              finalState: {
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                width: obj.width,
                height: obj.height,
              },
            }
          );
        } else {
          logger.debug(
            "FabricCanvas",
            "No reprocess, updating props and scale",
            {
              layerId: layer.id,
              currentSize: { width: obj.width, height: obj.height },
              targetSize: { width: layer.width, height: layer.height },
            }
          );

          // Calculate scale to match target size
          const targetScaleX = layer.width / (obj.width || 1);
          const targetScaleY = layer.height / (obj.height || 1);

          // Check if rotation changed
          const rotationChanged =
            Math.abs((obj.angle || 0) - layer.rotation) > 0.01;

          if (rotationChanged) {
            // For rotation changes, maintain center position
            // Get current center
            const center = obj.getCenterPoint();

            // Update properties
            obj.set({
              angle: layer.rotation,
              scaleX: targetScaleX,
              scaleY: targetScaleY,
              selectable: !layer.locked,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            // Restore center position (this will adjust left/top)
            obj.setPositionByOrigin(center, "center", "center");

            // Update layer state with new coordinates (after rotation adjustment)
            const newX = obj.left || 0;
            const newY = obj.top || 0;
            if (
              Math.abs(newX - layer.x) > 0.01 ||
              Math.abs(newY - layer.y) > 0.01
            ) {
              onLayerUpdate?.(layer.id, { x: newX, y: newY });
            }
          } else {
            // For other changes, use direct position
            obj.set({
              left: layer.x,
              top: layer.y,
              angle: layer.rotation,
              scaleX: targetScaleX,
              scaleY: targetScaleY,
              selectable: !layer.locked,
              visible: layer.visible,
              opacity: layer.opacity,
            });
          }

          obj.setCoords();
        }
      } else if (layer.type === "text" && obj instanceof fabric.Textbox) {
        const textLayer = layer as TextLayer;

        // Check if rotation changed
        const rotationChanged =
          Math.abs((obj.angle || 0) - layer.rotation) > 0.01;

        if (rotationChanged) {
          // For rotation changes, maintain center position
          const center = obj.getCenterPoint();

          obj.set({
            angle: layer.rotation,
            text: textLayer.text,
            width: layer.width,
            fontSize: textLayer.fontSize,
            fontFamily: textLayer.fontFamily,
            fontWeight: textLayer.bold ? "bold" : "normal",
            fontStyle: textLayer.italic ? "italic" : "normal",
            textAlign: textLayer.align,
            fill: textLayer.color,
            scaleX: 1,
            scaleY: 1,
            selectable: !layer.locked,
            editable: !layer.locked,
            visible: layer.visible,
            opacity: layer.opacity,
          });

          // Restore center position
          obj.setPositionByOrigin(center, "center", "center");

          // Update layer state with new coordinates (after rotation adjustment)
          const newX = obj.left || 0;
          const newY = obj.top || 0;
          if (
            Math.abs(newX - layer.x) > 0.01 ||
            Math.abs(newY - layer.y) > 0.01
          ) {
            onLayerUpdate?.(layer.id, { x: newX, y: newY });
          }
        } else {
          obj.set({
            left: layer.x,
            top: layer.y,
            angle: layer.rotation,
            text: textLayer.text,
            width: layer.width,
            fontSize: textLayer.fontSize,
            fontFamily: textLayer.fontFamily,
            fontWeight: textLayer.bold ? "bold" : "normal",
            fontStyle: textLayer.italic ? "italic" : "normal",
            textAlign: textLayer.align,
            fill: textLayer.color,
            scaleX: 1,
            scaleY: 1,
            selectable: !layer.locked,
            editable: !layer.locked,
            visible: layer.visible,
            opacity: layer.opacity,
          });
        }

        obj.setCoords();
      } else {
        // Other types
        const currentWidth = obj.width || 1;
        const currentHeight = obj.height || 1;
        const targetScaleX = layer.width / currentWidth;
        const targetScaleY = layer.height / currentHeight;

        // Check if rotation changed
        const rotationChanged =
          Math.abs((obj.angle || 0) - layer.rotation) > 0.01;

        if (rotationChanged) {
          // For rotation changes, maintain center position
          const center = obj.getCenterPoint();

          obj.set({
            angle: layer.rotation,
            scaleX: targetScaleX,
            scaleY: targetScaleY,
            selectable: !layer.locked,
            visible: layer.visible,
            opacity: layer.opacity,
          });

          // Restore center position
          obj.setPositionByOrigin(center, "center", "center");

          // Update layer state with new coordinates (after rotation adjustment)
          const newX = obj.left || 0;
          const newY = obj.top || 0;
          if (
            Math.abs(newX - layer.x) > 0.01 ||
            Math.abs(newY - layer.y) > 0.01
          ) {
            onLayerUpdate?.(layer.id, { x: newX, y: newY });
          }
        } else {
          obj.set({
            left: layer.x,
            top: layer.y,
            angle: layer.rotation,
            scaleX: targetScaleX,
            scaleY: targetScaleY,
            selectable: !layer.locked,
            visible: layer.visible,
            opacity: layer.opacity,
          });
        }

        obj.setCoords();
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getFabricCanvas: () => fabricRef.current,

      exportToCanvas: () => {
        const fabricCanvas = fabricRef.current;
        if (!fabricCanvas) return null;

        // Create a new canvas with the same content
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = width;
        exportCanvas.height = height;
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return null;

        // Draw white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Draw the fabric canvas content
        const fabricElement = fabricCanvas.getElement();
        ctx.drawImage(fabricElement, 0, 0);

        return exportCanvas;
      },

      addImageFromCanvas: (imageCanvas: HTMLCanvasElement, layerId: string) => {
        const fabricCanvas = fabricRef.current;
        if (!fabricCanvas) return;

        const img = new fabric.FabricImage(imageCanvas, {
          left: 0,
          top: 0,
          selectable: true,
          imageSmoothing: false, // Crisp 1-bit rendering
        }) as FabricObjectWithData;
        img.data = { layerId };
        fabricCanvas.add(img);
        layerObjectsRef.current.set(layerId, img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      },

      addText: (text: string, layerId: string, options: any) => {
        const fabricCanvas = fabricRef.current;
        if (!fabricCanvas) return;

        const textObj = new fabric.Textbox(text, {
          left: options.x || 50,
          top: options.y || 50,
          width: 200, // Default width for textbox
          fontSize: options.fontSize || 24,
          fontFamily: options.fontFamily || DEFAULT_FONT_FAMILY,
          fontWeight: options.bold ? "bold" : "normal",
          fontStyle: options.italic ? "italic" : "normal",
          textAlign: options.align || "left",
          fill: options.color || "#000000",
          selectable: true,
          editable: true,
        }) as FabricObjectWithData;

        // Disable top and bottom middle controls
        textObj.setControlVisible("mt", false);
        textObj.setControlVisible("mb", false);

        textObj.data = { layerId };
        fabricCanvas.add(textObj);
        layerObjectsRef.current.set(layerId, textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
      },
    }));

    return (
      <div
        className={cn(
          "fabric-canvas-container",
          "flex flex-1 justify-center items-center w-full h-full",
          className
        )}
        ref={containerRef}
      >
        <canvas className="shadow-lg rounded-sm" ref={canvasRef} />
      </div>
    );
  }
);

FabricCanvas.displayName = "FabricCanvas";

export default FabricCanvas;
