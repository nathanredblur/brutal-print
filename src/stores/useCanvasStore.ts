/**
 * Zustand Store for Canvas Settings
 * Manages canvas configuration with persistence
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "../lib/logger";
import { markProjectDirty } from "../utils/markProjectDirty";

interface CanvasStore {
  canvasHeight: number;
  setCanvasHeight: (height: number) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      canvasHeight: 800,
      setCanvasHeight: (height) => {
        logger.info("useCanvasStore", "Canvas height changed", { height });
        set({ canvasHeight: height });
        markProjectDirty();
      },
    }),
    {
      name: "brutal-print-canvas-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
