/**
 * Zustand Store for Project Management
 * Handles save, open, and new project operations
 */

import { create } from "zustand";
import { useLayersStore } from "./useLayersStore";
import { useCanvasStore } from "./useCanvasStore";
import { logger } from "../lib/logger";
import type { Layer, ImageLayer } from "../types/layer";

// Serialized image layer (for saving to file)
// imageData is removed and will be regenerated from originalImageData on load
type SerializedImageLayer = Omit<ImageLayer, "imageData"> & {
  imageData?: never; // Explicitly mark as not present
};

type SerializedLayer = SerializedImageLayer | Exclude<Layer, ImageLayer>;

interface ProjectData {
  version: string;
  layers: SerializedLayer[];
  canvasHeight: number;
  savedAt: string;
}

interface ProjectStore {
  // State
  projectName: string | null;
  isDirty: boolean; // Has unsaved changes

  // Actions
  saveProject: () => Promise<void>;
  openProject: () => Promise<void>;
  newProject: () => Promise<void>;
  exportProject: () => Promise<void>;
  setProjectName: (name: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projectName: null,
  isDirty: false,

  // Save project to file
  saveProject: async () => {
    logger.separator("SAVE PROJECT");
    logger.info("useProjectStore", "Saving project...");

    try {
      const layersState = useLayersStore.getState();
      const canvasState = useCanvasStore.getState();

      // Serialize layers
      // For image layers, we only save the originalImageData (base64)
      // The processed imageData (HTMLCanvasElement) will be regenerated on load
      const serializedLayers: SerializedLayer[] = layersState.layers.map(
        (layer) => {
          if (layer.type === "image") {
            const imageLayer = layer as ImageLayer;
            // Create a serialized version without imageData
            const { imageData, ...layerWithoutImageData } = imageLayer;
            return layerWithoutImageData as SerializedImageLayer;
          }
          return layer;
        }
      );

      const projectData: ProjectData = {
        version: "1.0.0",
        layers: serializedLayers,
        canvasHeight: canvasState.canvasHeight,
        savedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(projectData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const state = get();
      const filename = state.projectName
        ? `${state.projectName}.thermal`
        : `thermal-project-${Date.now()}.thermal`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      set({ isDirty: false });

      // If no project name was set, extract it from filename
      if (!state.projectName) {
        const nameWithoutExtension = filename.replace(/\.thermal$/, "");
        set({ projectName: nameWithoutExtension });
      }

      logger.success("useProjectStore", "Project saved successfully", {
        filename,
        layersCount: projectData.layers.length,
      });
    } catch (error) {
      logger.error("useProjectStore", "Failed to save project", error);
      throw error;
    }
  },

  // Open project from file
  openProject: async () => {
    logger.separator("OPEN PROJECT");
    logger.info("useProjectStore", "Opening project...");

    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".thermal,application/json";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        try {
          const text = await file.text();
          const projectData: ProjectData = JSON.parse(text);

          logger.info("useProjectStore", "Project data loaded", {
            version: projectData.version,
            layersCount: projectData.layers.length,
            savedAt: projectData.savedAt,
          });

          // Validate project data
          if (!projectData.version || !Array.isArray(projectData.layers)) {
            throw new Error("Invalid project file format");
          }

          // Load data into stores
          const layersState = useLayersStore.getState();
          const canvasState = useCanvasStore.getState();

          // Clear current state
          layersState.clearLayers();

          // Load layers sequentially to maintain correct order
          // This is important because layers have z-index based on their order
          for (const layer of projectData.layers) {
            if (layer.type === "image") {
              // For image layers, we regenerate the processed imageData from originalImageData
              const imageLayer = layer as any;

              if (!imageLayer.originalImageData) {
                logger.warn(
                  "useProjectStore",
                  "Image layer missing originalImageData",
                  {
                    id: layer.id,
                    name: layer.name,
                  }
                );
                continue;
              }

              // addImageLayer now processes the image internally
              await layersState.addImageLayer(
                imageLayer.originalImageData,
                imageLayer.ditherMethod || "steinberg",
                {
                  id: layer.id,
                  name: layer.name,
                  x: layer.x,
                  y: layer.y,
                  width: layer.width,
                  height: layer.height,
                  visible: layer.visible,
                  locked: layer.locked,
                  opacity: layer.opacity,
                  rotation: layer.rotation,
                  flipX: layer.flipX,
                  flipY: layer.flipY,
                  threshold: imageLayer.threshold,
                  brightness: imageLayer.brightness,
                  contrast: imageLayer.contrast,
                  invert: imageLayer.invert,
                  bayerMatrixSize: imageLayer.bayerMatrixSize,
                  halftoneCellSize: imageLayer.halftoneCellSize,
                }
              );

              logger.debug("useProjectStore", "Image layer loaded", {
                id: layer.id,
                name: layer.name,
              });
            } else if (layer.type === "text") {
              // Text layers can be loaded synchronously
              layersState.addTextLayer((layer as any).text || "", {
                ...layer,
                id: layer.id,
                name: layer.name,
              });

              logger.debug("useProjectStore", "Text layer loaded", {
                id: layer.id,
                name: layer.name,
              });
            }
          }

          // Load canvas settings
          canvasState.setCanvasHeight(projectData.canvasHeight);

          // Set project name from filename
          const projectName = file.name.replace(/\.thermal$/, "");
          set({ projectName, isDirty: false });

          logger.success("useProjectStore", "Project opened successfully", {
            projectName,
          });

          resolve();
        } catch (error) {
          logger.error("useProjectStore", "Failed to open project", error);
          reject(error);
        }
      };

      input.click();
    });
  },

  // Create new project
  newProject: async () => {
    logger.separator("NEW PROJECT");
    logger.info("useProjectStore", "Creating new project...");

    try {
      const layersState = useLayersStore.getState();
      const canvasState = useCanvasStore.getState();

      // Clear all layers
      layersState.clearLayers();

      // Reset canvas to default
      canvasState.setCanvasHeight(800);

      // Reset project state
      set({ projectName: null, isDirty: false });

      logger.success("useProjectStore", "New project created");
    } catch (error) {
      logger.error("useProjectStore", "Failed to create new project", error);
      throw error;
    }
  },

  // Export project as image
  exportProject: async () => {
    logger.separator("EXPORT PROJECT");
    logger.info("useProjectStore", "Exporting project as image...");

    // This will be handled by CanvasManager as it needs access to the canvas ref
    // Just marking it here for completeness
    throw new Error("Export should be called from CanvasManager");
  },

  // Set project name
  setProjectName: (name) => {
    set({ projectName: name });
  },

  // Mark project as dirty (has unsaved changes)
  markDirty: () => {
    set({ isDirty: true });
  },

  // Mark project as clean (no unsaved changes)
  markClean: () => {
    set({ isDirty: false });
  },
}));
