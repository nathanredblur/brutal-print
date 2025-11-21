/**
 * Zustand Store for Layers Management
 * Global state management for canvas layers
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import type { Layer, LayerState, ImageLayer, TextLayer } from "../types/layer";
import type { DitherMethod } from "../lib/dithering";
import { logger } from "../lib/logger";
import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
  DEFAULT_THRESHOLD,
} from "../constants/imageDefaults";
import { markProjectDirty } from "../utils/markProjectDirty";
import { reprocessImage } from "../utils/imageReprocessor";
import { canvasToBase64, base64ToCanvas } from "../utils/imageConversion";

interface LayersStore extends LayerState {
  // Clipboard
  copiedLayer: Layer | null;

  // Actions
  copyLayer: (id?: string) => void;
  pasteLayer: (x?: number, y?: number) => void;
  duplicateLayer: (id?: string) => void;
  moveLayerUp: (id?: string) => void;
  moveLayerDown: (id?: string) => void;
  moveLayerToFront: (id?: string) => void;
  moveLayerToBack: (id?: string) => void;

  addImageLayer: (
    originalImageData: string,
    ditherMethod: DitherMethod,
    options?: Partial<ImageLayer> & {
      threshold?: number;
      invert?: boolean;
      brightness?: number;
      contrast?: number;
      bayerMatrixSize?: number;
      halftoneCellSize?: number;
    }
  ) => Promise<void>;

  addTextLayer: (text: string, options: Partial<TextLayer>) => void;

  removeLayer: (id: string) => void;

  toggleVisibility: (id: string) => void;

  toggleLock: (id: string) => void;

  selectLayer: (id: string | null) => void;

  moveLayer: (fromIndex: number, toIndex: number) => void;

  updateLayer: (id: string, updates: Partial<Layer>) => void;

  reprocessImageLayer: (
    id: string,
    updates: {
      ditherMethod?: string;
      threshold?: number;
      invert?: boolean;
      brightness?: number;
      contrast?: number;
      bayerMatrixSize?: number;
      halftoneCellSize?: number;
      width?: number;
      height?: number;
    }
  ) => Promise<void>;

  renameLayer: (id: string, name: string) => void;

  clearLayers: () => void;

  // Persistence
  loadState: (state: Partial<LayerState>) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// Custom IndexedDB storage for Zustand persist
const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      return null;
    }

    try {
      const value = await idbGet(name);
      return value || null;
    } catch (error) {
      logger.error("useLayersStore", "Failed to get from IndexedDB", error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      return;
    }

    try {
      await idbSet(name, value);
    } catch (error) {
      logger.error("useLayersStore", "Failed to set in IndexedDB", error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      return;
    }

    try {
      await idbDel(name);
    } catch (error) {
      logger.error("useLayersStore", "Failed to remove from IndexedDB", error);
    }
  },
};

export const useLayersStore = create<LayersStore>()(
  persist(
    (set, get) => ({
      // Initial state
      layers: [],
      selectedLayerId: null,
      nextId: 1,
      copiedLayer: null,

      // Copy/Paste Actions
      copyLayer: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to copy");
          return;
        }

        const layer = state.layers.find((l) => l.id === layerId);
        if (layer) {
          set({ copiedLayer: { ...layer } });
          logger.info("useLayersStore", "Layer copied to clipboard", {
            id: layer.id,
            name: layer.name,
          });
        }
      },

      pasteLayer: (x, y) => {
        const state = get();
        if (!state.copiedLayer) {
          logger.warn("useLayersStore", "No layer in clipboard to paste");
          return;
        }

        const newLayer = {
          ...state.copiedLayer,
          id: `layer-${state.nextId}`,
          name: `${state.copiedLayer.name} (Copy)`,
          x: x ?? state.copiedLayer.x + 20,
          y: y ?? state.copiedLayer.y + 20,
        };

        logger.info("useLayersStore", "Layer pasted", {
          originalId: state.copiedLayer.id,
          newId: newLayer.id,
          position: { x: newLayer.x, y: newLayer.y },
        });

        set({
          layers: [...state.layers, newLayer],
          selectedLayerId: newLayer.id,
          nextId: state.nextId + 1,
        });

        markProjectDirty();
      },

      duplicateLayer: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to duplicate");
          return;
        }

        const layer = state.layers.find((l) => l.id === layerId);
        if (!layer) return;

        const newLayer = {
          ...layer,
          id: `layer-${state.nextId}`,
          name: `${layer.name} (Copy)`,
          x: layer.x + 20,
          y: layer.y + 20,
        };

        logger.info("useLayersStore", "Layer duplicated", {
          originalId: layerId,
          newId: newLayer.id,
        });

        set({
          layers: [...state.layers, newLayer],
          selectedLayerId: newLayer.id,
          nextId: state.nextId + 1,
        });

        markProjectDirty();
      },

      moveLayerUp: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to move up");
          return;
        }

        const index = state.layers.findIndex((l) => l.id === layerId);
        if (index === -1 || index === state.layers.length - 1) return;

        const newLayers = [...state.layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.splice(index + 1, 0, layer);

        logger.debug("useLayersStore", "Layer moved up", { id: layerId });
        set({ layers: newLayers });

        markProjectDirty();
      },

      moveLayerDown: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to move down");
          return;
        }

        const index = state.layers.findIndex((l) => l.id === layerId);
        if (index === -1 || index === 0) return;

        const newLayers = [...state.layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.splice(index - 1, 0, layer);

        logger.debug("useLayersStore", "Layer moved down", { id: layerId });
        set({ layers: newLayers });

        markProjectDirty();
      },

      moveLayerToFront: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to move to front");
          return;
        }

        const index = state.layers.findIndex((l) => l.id === layerId);
        if (index === -1 || index === state.layers.length - 1) return;

        const newLayers = [...state.layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.push(layer);

        logger.debug("useLayersStore", "Layer moved to front", { id: layerId });
        set({ layers: newLayers });

        markProjectDirty();
      },

      moveLayerToBack: (id) => {
        const state = get();
        const layerId = id ?? state.selectedLayerId;
        if (!layerId) {
          logger.warn("useLayersStore", "No layer selected to move to back");
          return;
        }

        const index = state.layers.findIndex((l) => l.id === layerId);
        if (index === -1 || index === 0) return;

        const newLayers = [...state.layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.unshift(layer);

        logger.debug("useLayersStore", "Layer moved to back", { id: layerId });
        set({ layers: newLayers });

        markProjectDirty();
      },

      // Actions
      addImageLayer: async (originalImageData, ditherMethod, options) => {
        const state = get();

        logger.info("useLayersStore", "Processing image for new layer...", {
          ditherMethod,
          hasOptions: !!options,
        });

        try {
          // Process the image with the specified dither method and options
          const { canvas: processedCanvas } = await reprocessImage(
            originalImageData,
            ditherMethod,
            {
              threshold: options?.threshold ?? DEFAULT_THRESHOLD,
              brightness: options?.brightness ?? DEFAULT_BRIGHTNESS,
              contrast: options?.contrast ?? DEFAULT_CONTRAST,
              invert: options?.invert ?? false,
              bayerMatrixSize: options?.bayerMatrixSize ?? 4,
              halftoneCellSize: options?.halftoneCellSize ?? 4,
              // If width/height are provided (loading project), use them for processing
              width: options?.width,
              height: options?.height,
            }
          );

          const newLayer: ImageLayer = {
            id: options?.id || `layer-${state.nextId}`,
            type: "image",
            name: options?.name || `Image ${state.nextId}`,
            visible: options?.visible ?? true,
            locked: options?.locked ?? false,
            x: options?.x ?? 0,
            y: options?.y ?? 0,
            // Use processed canvas dimensions
            width: processedCanvas.width,
            height: processedCanvas.height,
            opacity: options?.opacity ?? 1,
            rotation: options?.rotation ?? 0,
            imageData: processedCanvas,
            originalImageData,
            ditherMethod,
            threshold: options?.threshold ?? DEFAULT_THRESHOLD,
            brightness: options?.brightness ?? DEFAULT_BRIGHTNESS,
            contrast: options?.contrast ?? DEFAULT_CONTRAST,
            invert: options?.invert ?? false,
            bayerMatrixSize: options?.bayerMatrixSize ?? 4,
            halftoneCellSize: options?.halftoneCellSize ?? 4,
          };

          logger.info("useLayersStore", "Image layer added", {
            id: newLayer.id,
            name: newLayer.name,
            size: { width: newLayer.width, height: newLayer.height },
            ditherMethod,
            threshold: newLayer.threshold,
            invert: newLayer.invert,
          });

          set({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id,
            nextId: state.nextId + 1,
          });

          markProjectDirty();
        } catch (error) {
          logger.error("useLayersStore", "Failed to add image layer", error);
          throw error;
        }
      },

      addTextLayer: (text, options) => {
        const state = get();
        const fontSize = options.fontSize || 24;
        const newLayer: TextLayer = {
          id: `layer-${state.nextId}`,
          type: "text",
          name: options.name || `Text ${state.nextId}`,
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

        logger.info("useLayersStore", "Text layer added", {
          id: newLayer.id,
          name: newLayer.name,
          text: text.substring(0, 20) + (text.length > 20 ? "..." : ""),
        });

        set({
          layers: [...state.layers, newLayer],
          selectedLayerId: newLayer.id,
          nextId: state.nextId + 1,
        });

        markProjectDirty();
      },

      removeLayer: (id) => {
        const state = get();
        const layer = state.layers.find((l) => l.id === id);

        logger.info("useLayersStore", "Layer removed", {
          id,
          name: layer?.name,
        });

        set({
          layers: state.layers.filter((l) => l.id !== id),
          selectedLayerId:
            state.selectedLayerId === id ? null : state.selectedLayerId,
        });

        markProjectDirty();
      },

      toggleVisibility: (id) => {
        const state = get();
        set({
          layers: state.layers.map((layer) =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
          ),
        });

        markProjectDirty();
      },

      toggleLock: (id) => {
        const state = get();
        const layer = state.layers.find((l) => l.id === id);
        const isLocking = layer && !layer.locked;
        const isUnlocking = layer && layer.locked;

        set({
          layers: state.layers.map((layer) =>
            layer.id === id ? { ...layer, locked: !layer.locked } : layer
          ),
          selectedLayerId:
            isLocking && state.selectedLayerId === id
              ? null
              : isUnlocking
              ? id
              : state.selectedLayerId,
        });

        markProjectDirty();
      },

      selectLayer: (id) => {
        set({ selectedLayerId: id });
      },

      moveLayer: (fromIndex, toIndex) => {
        const state = get();
        const newLayers = [...state.layers];
        const [removed] = newLayers.splice(fromIndex, 1);
        newLayers.splice(toIndex, 0, removed);

        logger.debug("useLayersStore", "Layer reordered", {
          from: fromIndex,
          to: toIndex,
          layerId: removed.id,
        });

        set({ layers: newLayers });

        markProjectDirty();
      },

      updateLayer: (id, updates) => {
        const state = get();
        set({
          layers: state.layers.map((layer) =>
            layer.id === id ? ({ ...layer, ...updates } as Layer) : layer
          ),
        });

        logger.debug("useLayersStore", "Layer updated", { id, updates });

        markProjectDirty();
      },

      reprocessImageLayer: async (id, updates) => {
        const state = get();
        const layer = state.layers.find(
          (l) => l.id === id && l.type === "image"
        ) as ImageLayer | undefined;

        if (!layer) {
          logger.warn(
            "useLayersStore",
            "Image layer not found for reprocessing",
            {
              id,
            }
          );
          return;
        }

        logger.info("useLayersStore", "Reprocessing image layer...", {
          id,
          updates,
        });

        try {
          // Merge updates with current layer values
          const params = {
            ditherMethod: updates.ditherMethod ?? layer.ditherMethod,
            threshold: updates.threshold ?? layer.threshold,
            invert: updates.invert ?? layer.invert,
            brightness:
              updates.brightness ?? layer.brightness ?? DEFAULT_BRIGHTNESS,
            contrast: updates.contrast ?? layer.contrast ?? DEFAULT_CONTRAST,
            bayerMatrixSize:
              updates.bayerMatrixSize ?? layer.bayerMatrixSize ?? 4,
            halftoneCellSize:
              updates.halftoneCellSize ?? layer.halftoneCellSize ?? 4,
            // Use updated dimensions if provided, otherwise keep current
            width: updates.width ?? layer.width,
            height: updates.height ?? layer.height,
          };

          // Reprocess the image from original
          const { canvas: processedCanvas } = await reprocessImage(
            layer.originalImageData,
            params.ditherMethod as any,
            params
          );

          // Update the layer with new processed image and parameters
          set({
            layers: state.layers.map((l) => {
              if (l.id === id && l.type === "image") {
                return {
                  ...l,
                  imageData: processedCanvas,
                  ditherMethod: params.ditherMethod,
                  threshold: params.threshold,
                  invert: params.invert,
                  brightness: params.brightness,
                  contrast: params.contrast,
                  bayerMatrixSize: params.bayerMatrixSize,
                  halftoneCellSize: params.halftoneCellSize,
                  width: processedCanvas.width,
                  height: processedCanvas.height,
                };
              }
              return l;
            }),
          });

          logger.success("useLayersStore", "Image layer reprocessed", {
            id,
            size: {
              width: processedCanvas.width,
              height: processedCanvas.height,
            },
          });

          markProjectDirty();
        } catch (error) {
          logger.error(
            "useLayersStore",
            "Failed to reprocess image layer",
            error
          );
          throw error;
        }
      },

      renameLayer: (id, name) => {
        const state = get();
        set({
          layers: state.layers.map((layer) =>
            layer.id === id ? { ...layer, name } : layer
          ),
        });

        markProjectDirty();
      },

      clearLayers: () => {
        logger.info("useLayersStore", "All layers cleared");
        set({
          layers: [],
          selectedLayerId: null,
          nextId: 1,
        });
      },

      loadState: (state) => {
        logger.info("useLayersStore", "State loaded", {
          layerCount: state.layers?.length || 0,
          nextId: state.nextId,
        });

        set({
          layers: state.layers || [],
          selectedLayerId: state.selectedLayerId || null,
          nextId: state.nextId || 1,
        });
      },

      // Hydration flag
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "brutal-print-layers-storage",
      storage: createJSONStorage(() => indexedDBStorage),

      // Serialize: Convert HTMLCanvasElement to base64 before saving
      partialize: (state) => ({
        layers: state.layers.map((layer) => {
          if (layer.type === "image") {
            const imageLayer = layer as ImageLayer;
            return {
              ...layer,
              imageData: canvasToBase64(imageLayer.imageData),
            };
          }
          return layer;
        }),
        selectedLayerId: state.selectedLayerId,
        nextId: state.nextId,
        copiedLayer: state.copiedLayer
          ? state.copiedLayer.type === "image"
            ? {
                ...state.copiedLayer,
                imageData: canvasToBase64(
                  (state.copiedLayer as ImageLayer).imageData
                ),
              }
            : state.copiedLayer
          : null,
      }),

      // Deserialize: Convert base64 back to HTMLCanvasElement after loading
      onRehydrateStorage: () => {
        logger.info("useLayersStore", "Starting hydration from IndexedDB...");

        return async (state, error) => {
          if (error) {
            logger.error("useLayersStore", "Hydration error", error);
            state?.setHasHydrated(true);
            return;
          }

          if (!state) {
            logger.warn("useLayersStore", "No state to hydrate");
            return;
          }

          try {
            // Convert base64 strings back to HTMLCanvasElement
            const restoredLayers = await Promise.all(
              state.layers.map(async (layer) => {
                if (layer.type === "image") {
                  const imageLayer = layer as any;

                  // Convert base64 back to canvas
                  const canvas = await base64ToCanvas(
                    imageLayer.imageData,
                    layer.width,
                    layer.height
                  );

                  return {
                    ...layer,
                    imageData: canvas,
                  };
                }
                return layer;
              })
            );

            // Restore copied layer if it exists
            let restoredCopiedLayer = state.copiedLayer;
            if (state.copiedLayer && state.copiedLayer.type === "image") {
              const copiedImageLayer = state.copiedLayer as any;
              const canvas = await base64ToCanvas(
                copiedImageLayer.imageData,
                state.copiedLayer.width,
                state.copiedLayer.height
              );
              restoredCopiedLayer = {
                ...state.copiedLayer,
                imageData: canvas,
              };
            }

            // Update state with restored layers
            state.layers = restoredLayers;
            state.copiedLayer = restoredCopiedLayer;

            logger.success("useLayersStore", "Hydration completed", {
              layersCount: restoredLayers.length,
            });
          } catch (error) {
            logger.error("useLayersStore", "Failed to restore layers", error);
          } finally {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

// ✅ Selector helper - Se ejecuta automáticamente cuando cambian layers o selectedLayerId
export const selectSelectedLayer = (state: LayersStore): Layer | null => {
  return state.layers.find((l) => l.id === state.selectedLayerId) || null;
};

// Selector para obtener el índice de la capa seleccionada
export const selectSelectedLayerIndex = (state: LayersStore): number => {
  return state.layers.findIndex((l) => l.id === state.selectedLayerId);
};
