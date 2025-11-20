/**
 * Zustand Store for UI State Management
 * Manages application-wide UI state like active tools, panels, and dialogs
 */

import { create } from "zustand";
import { logger } from "../lib/logger";

// Only one of these can be active at a time
export enum ActivePanel {
  ImagePanel = "imagePanel",
  TextPanel = "textPanel",
  CanvasSettings = "canvasSettings",
  PrintSettings = "printSettings",
}

type ActivePanelType = ActivePanel | null;

interface UIStore {
  // Active panel state (mutually exclusive)
  activePanel: ActivePanelType;

  // Dialog states
  showAboutDialog: boolean;

  // Selection type
  selectionType: "layer" | "canvas" | null;

  // Actions
  setActivePanel: (panel: ActivePanelType) => void;
  closeActivePanel: () => void;
  setShowAboutDialog: (show: boolean) => void;
  setSelectionType: (type: "layer" | "canvas" | null) => void;

  // Helper getters (computed values)
  isImagePanelOpen: () => boolean;
  isTextPanelOpen: () => boolean;
  isCanvasSettingsOpen: () => boolean;
  isPrintSettingsOpen: () => boolean;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  activePanel: null,
  showAboutDialog: false,
  selectionType: null,

  // Set active panel (closes any other panel)
  setActivePanel: (panel) => {
    const state = get();
    if (state.activePanel === panel) {
      logger.debug("useUIStore", "Panel already active", { panel });
      return;
    }

    logger.info("useUIStore", "Setting active panel", {
      from: state.activePanel,
      to: panel,
    });

    set({ activePanel: panel });
  },

  // Close active panel
  closeActivePanel: () => {
    const state = get();
    if (!state.activePanel) {
      logger.debug("useUIStore", "No active panel to close");
      return;
    }

    logger.info("useUIStore", "Closing active panel", {
      panel: state.activePanel,
    });

    set({ activePanel: null });
  },

  // Set about dialog visibility
  setShowAboutDialog: (show) => {
    logger.info("useUIStore", "Setting about dialog visibility", { show });
    set({ showAboutDialog: show });
  },

  // Set selection type
  setSelectionType: (type) => {
    set({ selectionType: type });
  },

  // Helper getters
  isImagePanelOpen: () => get().activePanel === ActivePanel.ImagePanel,
  isTextPanelOpen: () => get().activePanel === ActivePanel.TextPanel,
  isCanvasSettingsOpen: () => get().activePanel === ActivePanel.CanvasSettings,
  isPrintSettingsOpen: () => get().activePanel === ActivePanel.PrintSettings,
}));

// Selector helpers for better performance
export const selectActivePanel = (state: UIStore) => state.activePanel;
export const selectIsAnyPanelOpen = (state: UIStore) =>
  state.activePanel !== null;
export const selectShowAboutDialog = (state: UIStore) => state.showAboutDialog;
