/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for the application
 *
 * This hook consumes Zustand stores directly to avoid prop drilling.
 * Only export action needs to be passed (requires canvas ref access).
 */

import { useEffect } from "react";
import { useUIStore, ActivePanel } from "../stores/useUIStore";
import { useLayersStore } from "../stores/useLayersStore";
import { toast } from "sonner";
import {
  handleNewProject,
  handleOpenProject,
  handleSaveProject,
} from "../utils/projectActions";

interface KeyboardShortcutHandlers {
  // Only export needs canvas ref, so it must be passed from parent
  onExport?: () => void;
  // Undo/Redo for future implementation
  onUndo?: () => void;
  onRedo?: () => void;
}

/**
 * Check if the active element is an input/textarea/contenteditable
 */
const isTyping = (): boolean => {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isContentEditable =
    activeElement.getAttribute("contenteditable") === "true";

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    isContentEditable
  );
};

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  // Get store actions and state
  const setActivePanel = useUIStore((state) => state.setActivePanel);

  const layers = useLayersStore((state) => state.layers);
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const copiedLayer = useLayersStore((state) => state.copiedLayer);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const toggleVisibility = useLayersStore((state) => state.toggleVisibility);
  const toggleLock = useLayersStore((state) => state.toggleLock);
  const copyLayer = useLayersStore((state) => state.copyLayer);
  const pasteLayer = useLayersStore((state) => state.pasteLayer);
  const duplicateLayer = useLayersStore((state) => state.duplicateLayer);
  const updateLayer = useLayersStore((state) => state.updateLayer);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = e;
      const cmdOrCtrl = ctrlKey || metaKey;

      // Tool shortcuts - only work when not typing
      if (!isTyping()) {
        // Image tool (I)
        if (key.toLowerCase() === "i" && !cmdOrCtrl) {
          e.preventDefault();
          setActivePanel(ActivePanel.ImagePanel);
          return;
        }

        // Text tool (T)
        if (key.toLowerCase() === "t" && !cmdOrCtrl) {
          e.preventDefault();
          setActivePanel(ActivePanel.TextPanel);
          return;
        }

        // Delete element (Delete or Backspace)
        if (key === "Delete" || key === "Backspace") {
          e.preventDefault();
          if (selectedLayerId) {
            removeLayer(selectedLayerId);
            toast.success("Layer deleted");
          }
          return;
        }

        // Toggle visibility (H)
        if (key.toLowerCase() === "h" && !cmdOrCtrl) {
          e.preventDefault();
          if (selectedLayerId) {
            toggleVisibility(selectedLayerId);
          }
          return;
        }

        // Toggle lock (L)
        if (key.toLowerCase() === "l" && !cmdOrCtrl) {
          e.preventDefault();
          if (selectedLayerId) {
            toggleLock(selectedLayerId);
          }
          return;
        }

        // Arrow keys for movement
        const moveAmount = shiftKey ? 10 : 1; // 10px with Shift, 1px without

        if (key === "ArrowUp") {
          e.preventDefault();
          if (selectedLayerId) {
            const layer = layers.find((l) => l.id === selectedLayerId);
            if (layer) {
              updateLayer(selectedLayerId, { y: layer.y - moveAmount });
            }
          }
          return;
        }

        if (key === "ArrowDown") {
          e.preventDefault();
          if (selectedLayerId) {
            const layer = layers.find((l) => l.id === selectedLayerId);
            if (layer) {
              updateLayer(selectedLayerId, { y: layer.y + moveAmount });
            }
          }
          return;
        }

        if (key === "ArrowLeft") {
          e.preventDefault();
          if (selectedLayerId) {
            const layer = layers.find((l) => l.id === selectedLayerId);
            if (layer) {
              updateLayer(selectedLayerId, { x: layer.x - moveAmount });
            }
          }
          return;
        }

        if (key === "ArrowRight") {
          e.preventDefault();
          if (selectedLayerId) {
            const layer = layers.find((l) => l.id === selectedLayerId);
            if (layer) {
              updateLayer(selectedLayerId, { x: layer.x + moveAmount });
            }
          }
          return;
        }
      }

      // Document shortcuts - work even when not typing

      // Copy (Cmd/Ctrl + C)
      if (cmdOrCtrl && key.toLowerCase() === "c" && !isTyping()) {
        e.preventDefault();
        copyLayer();
        if (selectedLayerId) {
          toast.success("Layer copied", {
            description: "Press Cmd+V to paste",
          });
        }
        return;
      }

      // Paste (Cmd/Ctrl + V)
      if (cmdOrCtrl && key.toLowerCase() === "v" && !isTyping()) {
        e.preventDefault();
        if (copiedLayer) {
          pasteLayer();
          toast.success("Layer pasted");
        } else {
          toast.info("No layer to paste", {
            description: "Copy a layer first with Cmd+C",
          });
        }
        return;
      }

      // Duplicate (Cmd/Ctrl + D)
      if (cmdOrCtrl && key.toLowerCase() === "d" && !isTyping()) {
        e.preventDefault();
        duplicateLayer();
        if (selectedLayerId) {
          toast.success("Layer duplicated");
        }
        return;
      }

      // Undo (Cmd/Ctrl + Z)
      if (cmdOrCtrl && key.toLowerCase() === "z" && !shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Redo (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
      if (
        cmdOrCtrl &&
        ((key.toLowerCase() === "z" && shiftKey) || key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Save (Cmd/Ctrl + S)
      if (cmdOrCtrl && key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      // Open (Cmd/Ctrl + O)
      if (cmdOrCtrl && key.toLowerCase() === "o") {
        e.preventDefault();
        handleOpenProject();
        return;
      }

      // Export (Cmd/Ctrl + E)
      if (cmdOrCtrl && key.toLowerCase() === "e") {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      // New canvas (Cmd/Ctrl + N)
      if (cmdOrCtrl && key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewProject();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handlers,
    setActivePanel,
    layers,
    selectedLayerId,
    copiedLayer,
    removeLayer,
    toggleVisibility,
    toggleLock,
    copyLayer,
    pasteLayer,
    duplicateLayer,
    updateLayer,
  ]);
}
