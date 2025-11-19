/**
 * Zustand Store for Layers Management
 * Global state management for canvas layers
 */

import { create } from "zustand";
import type { Layer, LayerState, ImageLayer, TextLayer } from "../types/layer";
import { logger } from "../lib/logger";
import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
  DEFAULT_THRESHOLD,
} from "../constants/imageDefaults";

interface LayersStore extends LayerState {
  // Actions
  addImageLayer: (
    imageData: HTMLCanvasElement,
    originalImageData: string,
    ditherMethod: string,
    threshold?: number,
    invert?: boolean,
    options?: Partial<ImageLayer>
  ) => void;

  addTextLayer: (text: string, options: Partial<TextLayer>) => void;

  removeLayer: (id: string) => void;

  toggleVisibility: (id: string) => void;

  toggleLock: (id: string) => void;

  selectLayer: (id: string | null) => void;

  moveLayer: (fromIndex: number, toIndex: number) => void;

  updateLayer: (id: string, updates: Partial<Layer>) => void;

  reprocessImageLayer: (
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
  ) => void;

  renameLayer: (id: string, name: string) => void;

  clearLayers: () => void;

  // Persistence
  loadState: (state: Partial<LayerState>) => void;
}

export const useLayersStore = create<LayersStore>((set, get) => ({
  // Initial state
  layers: [],
  selectedLayerId: null,
  nextId: 1,

  // Actions
  addImageLayer: (
    imageData,
    originalImageData,
    ditherMethod,
    threshold = DEFAULT_THRESHOLD,
    invert = false,
    options
  ) => {
    const state = get();
    const newLayer: ImageLayer = {
      id: `layer-${state.nextId}`,
      type: "image",
      name: options?.name || `Image ${state.nextId}`,
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
      brightness: DEFAULT_BRIGHTNESS,
      contrast: DEFAULT_CONTRAST,
      invert,
    };

    logger.info("useLayersStore", "Image layer added", {
      id: newLayer.id,
      name: newLayer.name,
      size: { width: newLayer.width, height: newLayer.height },
      ditherMethod,
      threshold,
      invert,
    });

    set({
      layers: [...state.layers, newLayer],
      selectedLayerId: newLayer.id,
      nextId: state.nextId + 1,
    });
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
  },

  toggleVisibility: (id) => {
    const state = get();
    set({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    });
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
  },

  updateLayer: (id, updates) => {
    const state = get();
    set({
      layers: state.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...updates } as Layer) : layer
      ),
    });

    logger.debug("useLayersStore", "Layer updated", { id, updates });
  },

  reprocessImageLayer: (id, newImageData, updates) => {
    const state = get();
    const oldLayer = state.layers.find(
      (l) => l.id === id && l.type === "image"
    ) as ImageLayer | undefined;

    if (oldLayer) {
      logger.info("useLayersStore", "📊 Layer state BEFORE update", {
        id,
        oldDimensions: { width: oldLayer.width, height: oldLayer.height },
        oldCanvas: {
          width: oldLayer.imageData.width,
          height: oldLayer.imageData.height,
        },
        oldCanvasElement: oldLayer.imageData,
      });
    }

    set({
      layers: state.layers.map((layer) => {
        if (layer.id === id && layer.type === "image") {
          const imageLayer = layer as ImageLayer;
          const updatedLayer = {
            ...layer,
            imageData: newImageData,
            ditherMethod: updates.ditherMethod ?? imageLayer.ditherMethod,
            threshold: updates.threshold ?? imageLayer.threshold,
            invert: updates.invert ?? imageLayer.invert,
            brightness:
              updates.brightness ?? imageLayer.brightness ?? DEFAULT_BRIGHTNESS,
            contrast:
              updates.contrast ?? imageLayer.contrast ?? DEFAULT_CONTRAST,
            bayerMatrixSize:
              updates.bayerMatrixSize ?? imageLayer.bayerMatrixSize ?? 4,
            halftoneCellSize:
              updates.halftoneCellSize ?? imageLayer.halftoneCellSize ?? 4,
            width: newImageData.width,
            height: newImageData.height,
          };

          logger.info("useLayersStore", "📊 Layer state AFTER update", {
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
    });

    logger.success(
      "useLayersStore",
      "✅ Image layer reprocessed and state updated",
      {
        id,
        finalSize: { width: newImageData.width, height: newImageData.height },
      }
    );
  },

  renameLayer: (id, name) => {
    const state = get();
    set({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, name } : layer
      ),
    });
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
}));

// ✅ Selector helper - Se ejecuta automáticamente cuando cambian layers o selectedLayerId
export const selectSelectedLayer = (state: LayersStore): Layer | null => {
  return state.layers.find((l) => l.id === state.selectedLayerId) || null;
};

// Selector para obtener el índice de la capa seleccionada
export const selectSelectedLayerIndex = (state: LayersStore): number => {
  return state.layers.findIndex((l) => l.id === state.selectedLayerId);
};
