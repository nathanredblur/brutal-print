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

interface FabricCanvasProps {
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
    { width, height, layers, selectedLayerId, onLayerUpdate, onLayerSelect },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const layerObjectsRef = useRef<Map<string, fabric.FabricObject>>(new Map());

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

      // Handle object modifications (drag, resize, rotate)
      fabricCanvas.on("object:modified", (e: any) => {
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

          // Detect scaling by checking if scale is not 1:1
          // This is more reliable than checking transform.action
          const wasScaled = obj.scaleX !== 1 || obj.scaleY !== 1;

          logger.info("FabricCanvas", "🔍 Object modified EVENT [v2]", {
            layerId: obj.data.layerId,
            wasScaled,
            scaleValues: {
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              isScaled: obj.scaleX !== 1 || obj.scaleY !== 1,
            },
            objectDimensions: {
              width: obj.width,
              height: obj.height,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
            },
            finalDimensions: {
              width: finalWidth,
              height: finalHeight,
            },
            updates,
          });

          onLayerUpdate?.(obj.data.layerId, updates, wasScaled);
        }
      });

      return () => {
        fabricCanvas.dispose();
        fabricRef.current = null;
      };
    }, []); // Only initialize once

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
            fabricCanvas.remove(existingObj);
            fabricCanvas.insertAt(index, existingObj);
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
        const text = new fabric.FabricText(textLayer.text, {
          left: layer.x,
          top: layer.y,
          fontSize: textLayer.fontSize,
          fontFamily: textLayer.fontFamily,
          fontWeight: textLayer.bold ? "bold" : "normal",
          fontStyle: textLayer.italic ? "italic" : "normal",
          textAlign: textLayer.align,
          fill: textLayer.color,
          angle: layer.rotation,
          selectable: !layer.locked,
          opacity: layer.opacity,
        }) as FabricObjectWithData;
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

          obj.setElement(imageLayer.imageData);
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
          logger.debug("FabricCanvas", "No reprocess, just updating props", {
            layerId: layer.id,
          });
          // Just update position/rotation/visibility
          obj.set({
            left: layer.x,
            top: layer.y,
            angle: layer.rotation,
            selectable: !layer.locked,
            visible: layer.visible,
            opacity: layer.opacity,
          });
          obj.setCoords();
        }
      } else if (layer.type === "text" && obj instanceof fabric.FabricText) {
        const textLayer = layer as TextLayer;
        obj.set({
          left: layer.x,
          top: layer.y,
          angle: layer.rotation,
          text: textLayer.text,
          fontSize: textLayer.fontSize,
          fontFamily: textLayer.fontFamily,
          fontWeight: textLayer.bold ? "bold" : "normal",
          fontStyle: textLayer.italic ? "italic" : "normal",
          textAlign: textLayer.align,
          fill: textLayer.color,
          selectable: !layer.locked,
          visible: layer.visible,
          opacity: layer.opacity,
        });
        obj.setCoords();
      } else {
        // Other types
        obj.set({
          left: layer.x,
          top: layer.y,
          angle: layer.rotation,
          selectable: !layer.locked,
          visible: layer.visible,
          opacity: layer.opacity,
        });
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

        const textObj = new fabric.FabricText(text, {
          left: options.x || 50,
          top: options.y || 50,
          fontSize: options.fontSize || 24,
          fontFamily: options.fontFamily || "Inter",
          fontWeight: options.bold ? "bold" : "normal",
          fontStyle: options.italic ? "italic" : "normal",
          fill: options.color || "#000000",
          selectable: true,
        }) as FabricObjectWithData;
        textObj.data = { layerId };
        fabricCanvas.add(textObj);
        layerObjectsRef.current.set(layerId, textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
      },
    }));

    return (
      <div className="fabric-canvas-container">
        <canvas ref={canvasRef} />

        <style>{`
          .fabric-canvas-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }

          .fabric-canvas-container canvas {
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--color-border);
            border-radius: var(--radius-sm);
          }
        `}</style>
      </div>
    );
  }
);

FabricCanvas.displayName = "FabricCanvas";

export default FabricCanvas;
