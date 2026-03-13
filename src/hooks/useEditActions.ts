/**
 * useEditActions Hook
 * Centralized edit actions (copy, paste, duplicate) shared across
 * keyboard shortcuts, context menu, and header menu.
 */

import { useCallback } from "react";
import { useLayersStore } from "@/stores/useLayersStore";
import { toast } from "sonner";
import {
  getImageFromPasteEvent,
  getImageFromClipboard,
  pasteImageAsLayer,
  markClipboardAsLayerCopy,
} from "@/utils/clipboardImage";

export function useEditActions() {
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const copiedLayer = useLayersStore((state) => state.copiedLayer);
  const storeCopy = useLayersStore((state) => state.copyLayer);
  const storePaste = useLayersStore((state) => state.pasteLayer);
  const duplicateLayer = useLayersStore((state) => state.duplicateLayer);

  /** Copy the selected (or specified) layer and mark the system clipboard */
  const copy = useCallback(
    (layerId?: string) => {
      const id = layerId ?? selectedLayerId;
      if (!id) return;
      storeCopy(id);
      markClipboardAsLayerCopy();
      toast.success("Layer copied", {
        description: "Press Cmd+V to paste",
      });
    },
    [selectedLayerId, storeCopy]
  );

  /**
   * Paste from a ClipboardEvent (keyboard Cmd+V).
   * Image in clipboard → new image layer. Otherwise → internal layer paste.
   */
  const pasteFromEvent = useCallback(
    async (e: ClipboardEvent) => {
      const imageDataUrl = getImageFromPasteEvent(e);
      if (imageDataUrl) {
        try {
          await pasteImageAsLayer(await imageDataUrl);
          toast.success("Image pasted as new layer");
        } catch {
          toast.error("Failed to paste image");
        }
        return;
      }

      if (copiedLayer) {
        storePaste();
        toast.success("Layer pasted");
      }
    },
    [copiedLayer, storePaste]
  );

  /**
   * Paste using the Clipboard API (context menu / header menu).
   * Reads clipboard with permission prompt. Position is optional.
   */
  const pasteFromClipboard = useCallback(
    async (position?: { x: number; y: number }) => {
      try {
        const dataUrl = await getImageFromClipboard();
        if (dataUrl) {
          await pasteImageAsLayer(dataUrl, position);
          toast.success("Image pasted as new layer");
          return;
        }
      } catch {
        toast.error("Failed to paste from clipboard");
        return;
      }

      if (copiedLayer) {
        storePaste(position?.x, position?.y);
        toast.success("Layer pasted");
      }
    },
    [copiedLayer, storePaste]
  );

  /** Duplicate the selected (or specified) layer */
  const duplicate = useCallback(
    (layerId?: string) => {
      const id = layerId ?? selectedLayerId;
      if (!id) return;
      duplicateLayer(id);
      toast.success("Layer duplicated");
    },
    [selectedLayerId, duplicateLayer]
  );

  return {
    copy,
    pasteFromEvent,
    pasteFromClipboard,
    duplicate,
    canPaste: !!copiedLayer,
  };
}
