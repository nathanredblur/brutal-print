/**
 * useLayers Hook
 *
 * Manages canvas layers (add, remove, reorder, select)
 * Provides non-destructive editing capabilities
 */

import { useState, useCallback, useEffect } from "react";
import type { Layer, LayerState, ImageLayer, TextLayer } from "../types/layer";
import { logger } from "../lib/logger";

export function useLayers(initialState?: Partial<LayerState>) {
  const [state, setState] = useState<LayerState>({
    layers: initialState?.layers || [],
    selectedLayerId: initialState?.selectedLayerId || null,
    nextId: initialState?.nextId || 1,
  });

  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Update state when initialState changes (for loading from localStorage after hydration)
  useEffect(() => {
    // Only load once when data becomes available and current state is empty
    if (
      !hasLoadedFromStorage &&
      initialState?.layers &&
      initialState.layers.length > 0 &&
      state.layers.length === 0
    ) {
      setState({
        layers: initialState.layers,
        selectedLayerId: initialState.selectedLayerId || null,
        nextId: initialState.nextId || 1,
      });

      setHasLoadedFromStorage(true);

      logger.info("useLayers", "State restored from localStorage", {
        layerCount: initialState.layers.length,
        nextId: initialState.nextId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialState, hasLoadedFromStorage]);

  // Add image layer
  const addImageLayer = useCallback(
    (
      imageData: HTMLCanvasElement,
      originalImageData: string,
      ditherMethod: string,
      threshold: number = 128,
      invert: boolean = false,
      options?: Partial<ImageLayer>
    ) => {
      setState((prev) => {
        const newLayer: ImageLayer = {
          id: `layer-${prev.nextId}`,
          type: "image",
          name: options?.name || `Image ${prev.nextId}`,
          visible: true,
          locked: false,
          x: options?.x ?? 0,
          y: options?.y ?? 0,
          width: imageData.width,
          height: imageData.height,
          opacity: 1,
          rotation: 0,
          imageData,
          originalImageData,
          ditherMethod,
          threshold,
          invert,
        };

        logger.info("useLayers", "Image layer added", {
          id: newLayer.id,
          name: newLayer.name,
          size: { width: newLayer.width, height: newLayer.height },
          ditherMethod,
          threshold,
          invert,
        });

        return {
          ...prev,
          layers: [...prev.layers, newLayer],
          selectedLayerId: newLayer.id,
          nextId: prev.nextId + 1,
        };
      });
    },
    []
  );

  // Add text layer
  const addTextLayer = useCallback(
    (text: string, options: Partial<TextLayer>) => {
      setState((prev) => {
        const fontSize = options.fontSize || 24;
        const newLayer: TextLayer = {
          id: `layer-${prev.nextId}`,
          type: "text",
          name: options.name || `Text ${prev.nextId}`,
          visible: true,
          locked: false,
          x: options.x ?? 50,
          y: options.y ?? 50,
          width: 200, // Approximate, will be calculated on render
          height: fontSize * 1.2,
          opacity: 1,
          rotation: 0,
          text,
          fontSize,
          fontFamily: options.fontFamily || "Inter",
          bold: options.bold ?? false,
          italic: options.italic ?? false,
          align: options.align || "left",
          color: options.color || "#000000",
        };

        logger.info("useLayers", "Text layer added", {
          id: newLayer.id,
          name: newLayer.name,
          text: text.substring(0, 20) + (text.length > 20 ? "..." : ""),
        });

        return {
          ...prev,
          layers: [...prev.layers, newLayer],
          selectedLayerId: newLayer.id,
          nextId: prev.nextId + 1,
        };
      });
    },
    []
  );

  // Remove layer
  const removeLayer = useCallback((id: string) => {
    setState((prev) => {
      const layer = prev.layers.find((l) => l.id === id);

      logger.info("useLayers", "Layer removed", {
        id,
        name: layer?.name,
      });

      return {
        ...prev,
        layers: prev.layers.filter((l) => l.id !== id),
        selectedLayerId:
          prev.selectedLayerId === id ? null : prev.selectedLayerId,
      };
    });
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  }, []);

  // Toggle lock
  const toggleLock = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      ),
    }));
  }, []);

  // Select layer
  const selectLayer = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedLayerId: id,
    }));
  }, []);

  // Move layer (reorder)
  const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newLayers = [...prev.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);

      logger.debug("useLayers", "Layer reordered", {
        from: fromIndex,
        to: toIndex,
        layerId: removed.id,
      });

      return {
        ...prev,
        layers: newLayers,
      };
    });
  }, []);

  // Update layer position
  const updateLayerPosition = useCallback(
    (id: string, x: number, y: number) => {
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((layer) =>
          layer.id === id ? { ...layer, x, y } : layer
        ),
      }));
    },
    []
  );

  // Update layer properties (for Fabric.js integration)
  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    }));

    logger.debug("useLayers", "Layer updated", { id, updates });
  }, []);

  // Update text layer content and style
  const updateTextLayer = useCallback(
    (id: string, updates: Partial<TextLayer>) => {
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((layer) => {
          if (layer.id === id && layer.type === "text") {
            return { ...layer, ...updates };
          }
          return layer;
        }),
      }));

      logger.debug("useLayers", "Text layer updated", { id, updates });
    },
    []
  );

  // Update image layer properties
  const updateImageLayer = useCallback(
    (id: string, updates: Partial<ImageLayer>) => {
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((layer) => {
          if (layer.id === id && layer.type === "image") {
            return { ...layer, ...updates };
          }
          return layer;
        }),
      }));

      logger.debug("useLayers", "Image layer updated", { id, updates });
    },
    []
  );

  // Reprocess image layer with new settings
  const reprocessImageLayer = useCallback(
    async (
      id: string,
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
      logger.info("useLayers", "🔧 Reprocessing layer...", {
        id,
        newCanvasSize: {
          width: newImageData.width,
          height: newImageData.height,
        },
        updates,
      });

      setState((prev) => {
        const oldLayer = prev.layers.find(
          (l) => l.id === id && l.type === "image"
        ) as ImageLayer | undefined;

        if (oldLayer) {
          logger.info("useLayers", "📊 Layer state BEFORE update", {
            id,
            oldDimensions: { width: oldLayer.width, height: oldLayer.height },
            oldCanvas: {
              width: oldLayer.imageData.width,
              height: oldLayer.imageData.height,
            },
            oldCanvasElement: oldLayer.imageData,
          });
        }

        return {
          ...prev,
          layers: prev.layers.map((layer) => {
            if (layer.id === id && layer.type === "image") {
              const imageLayer = layer as ImageLayer;
              const updatedLayer = {
                ...layer,
                imageData: newImageData,
                ditherMethod: updates.ditherMethod ?? imageLayer.ditherMethod,
                threshold: updates.threshold ?? imageLayer.threshold,
                invert: updates.invert ?? imageLayer.invert,
                brightness: updates.brightness ?? imageLayer.brightness ?? 128,
                contrast: updates.contrast ?? imageLayer.contrast ?? 100,
                bayerMatrixSize:
                  updates.bayerMatrixSize ?? imageLayer.bayerMatrixSize ?? 4,
                halftoneCellSize:
                  updates.halftoneCellSize ?? imageLayer.halftoneCellSize ?? 4,
                // Update to match the new canvas dimensions (already scaled during reprocessing)
                width: newImageData.width,
                height: newImageData.height,
              };

              logger.info("useLayers", "📊 Layer state AFTER update", {
                id,
                newDimensions: {
                  width: updatedLayer.width,
                  height: updatedLayer.height,
                },
                newCanvas: {
                  width: newImageData.width,
                  height: newImageData.height,
                },
                newCanvasElement: newImageData,
                canvasChanged: (layer as ImageLayer).imageData !== newImageData,
              });

              return updatedLayer;
            }
            return layer;
          }),
        };
      });

      logger.success(
        "useLayers",
        "✅ Image layer reprocessed and state updated",
        {
          id,
          finalSize: { width: newImageData.width, height: newImageData.height },
        }
      );
    },
    []
  );

  // Rename layer
  const renameLayer = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, name } : layer
      ),
    }));
  }, []);

  // Clear all layers
  const clearLayers = useCallback(() => {
    logger.info("useLayers", "All layers cleared");
    setState({
      layers: [],
      selectedLayerId: null,
      nextId: 1,
    });
  }, []);

  // Get selected layer
  const getSelectedLayer = useCallback(() => {
    return state.layers.find((l) => l.id === state.selectedLayerId) || null;
  }, [state.layers, state.selectedLayerId]);

  // Get next ID (useful for persistence)
  const getNextId = useCallback(() => state.nextId, [state.nextId]);

  return {
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    selectedLayer: getSelectedLayer(),
    nextId: state.nextId,
    addImageLayer,
    addTextLayer,
    removeLayer,
    toggleVisibility,
    toggleLock,
    selectLayer,
    moveLayer,
    updateLayerPosition,
    updateLayer,
    updateTextLayer,
    updateImageLayer,
    reprocessImageLayer,
    renameLayer,
    clearLayers,
    getNextId,
  };
}
