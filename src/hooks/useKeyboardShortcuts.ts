/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for the application
 */

import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  // Tool shortcuts
  onImageTool?: () => void;
  onTextTool?: () => void;

  // Element actions (amount is the number of pixels to move)
  onDeleteElement?: () => void;
  onMoveUp?: (amount: number) => void;
  onMoveDown?: (amount: number) => void;
  onMoveLeft?: (amount: number) => void;
  onMoveRight?: (amount: number) => void;

  // Document actions
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onNewCanvas?: () => void;
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = e;
      const cmdOrCtrl = ctrlKey || metaKey;

      // Tool shortcuts - only work when not typing
      if (!isTyping()) {
        // Image tool (I)
        if (key.toLowerCase() === "i" && !cmdOrCtrl) {
          e.preventDefault();
          handlers.onImageTool?.();
          return;
        }

        // Text tool (T)
        if (key.toLowerCase() === "t" && !cmdOrCtrl) {
          e.preventDefault();
          handlers.onTextTool?.();
          return;
        }

        // Delete element (Delete or Backspace)
        if (key === "Delete" || key === "Backspace") {
          e.preventDefault();
          handlers.onDeleteElement?.();
          return;
        }

        // Arrow keys for movement
        const moveAmount = shiftKey ? 10 : 1; // 10px with Shift, 1px without

        if (key === "ArrowUp") {
          e.preventDefault();
          handlers.onMoveUp?.(moveAmount);
          return;
        }

        if (key === "ArrowDown") {
          e.preventDefault();
          handlers.onMoveDown?.(moveAmount);
          return;
        }

        if (key === "ArrowLeft") {
          e.preventDefault();
          handlers.onMoveLeft?.(moveAmount);
          return;
        }

        if (key === "ArrowRight") {
          e.preventDefault();
          handlers.onMoveRight?.(moveAmount);
          return;
        }
      }

      // Document shortcuts - work even when typing (standard behavior)

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
        handlers.onSave?.();
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
        handlers.onNewCanvas?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlers]);
}
