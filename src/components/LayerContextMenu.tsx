/**
 * LayerContextMenu Component
 *
 * Context menu for layer operations (copy, paste, visibility, lock, delete)
 * Consumes useLayersStore directly to avoid prop drilling
 */

import { useCallback, useState, type ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Clipboard,
} from "lucide-react";
import { useLayersStore } from "@/stores/useLayersStore";
import { useConfirmDialogStore } from "@/stores/useConfirmDialogStore";
import { toast } from "sonner";
import { canPasteFromClipboard } from "@/utils/clipboardImage";
import { useEditActions } from "@/hooks/useEditActions";

interface LayerContextMenuProps {
  children: ReactNode;
  contextMenuLayerId: string | null;
  contextMenuPosition: { x: number; y: number } | null;
  onOpenChange?: (open: boolean) => void;
}

export function LayerContextMenu({
  children,
  contextMenuLayerId,
  contextMenuPosition,
  onOpenChange,
}: LayerContextMenuProps) {
  const layers = useLayersStore((state) => state.layers);
  const toggleVisibility = useLayersStore((state) => state.toggleVisibility);
  const toggleLock = useLayersStore((state) => state.toggleLock);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const confirmDialog = useConfirmDialogStore((state) => state.confirm);

  const { copy, pasteFromClipboard, canPaste: hasInternalCopy } = useEditActions();
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  // Get context menu layer
  const contextMenuLayer = layers.find((l) => l.id === contextMenuLayerId);

  const handleContextMenuVisibility = useCallback(() => {
    if (contextMenuLayerId) {
      toggleVisibility(contextMenuLayerId);
    }
  }, [contextMenuLayerId, toggleVisibility]);

  const handleContextMenuLock = useCallback(() => {
    if (contextMenuLayerId) {
      toggleLock(contextMenuLayerId);
    }
  }, [contextMenuLayerId, toggleLock]);

  const handleContextMenuDelete = useCallback(async () => {
    if (!contextMenuLayerId) return;

    const layer = layers.find((l) => l.id === contextMenuLayerId);
    if (!layer) return;

    const confirmed = await confirmDialog(
      "Delete Layer?",
      `Are you sure you want to delete "${layer.name}"? This action cannot be undone.`,
      { confirmText: "Delete", cancelText: "Cancel" }
    );

    if (confirmed) {
      removeLayer(contextMenuLayerId);
      toast.success("Layer deleted", {
        description: `"${layer.name}" has been removed.`,
      });
    }
  }, [contextMenuLayerId, layers, removeLayer, confirmDialog]);

  const handlePaste = useCallback(() => {
    pasteFromClipboard(contextMenuPosition ?? undefined);
  }, [pasteFromClipboard, contextMenuPosition]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        canPasteFromClipboard()
          .then(setHasClipboardContent)
          .catch(() => setHasClipboardContent(false));
      }
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent
        className="w-64"
        key={`${contextMenuLayerId || "canvas"}-${contextMenuPosition?.x}-${
          contextMenuPosition?.y
        }`}
      >
        {contextMenuLayer ? (
          <>
            <ContextMenuItem onClick={() => copy(contextMenuLayerId!)}>
              <Copy size={16} />
              <span>Copy Layer</span>
              <Kbd className="ml-auto">Ctrl+C</Kbd>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem onClick={handleContextMenuVisibility}>
              {contextMenuLayer.visible ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
              <span>
                {contextMenuLayer.visible ? "Hide Layer" : "Show Layer"}
              </span>
              <Kbd className="ml-auto">H</Kbd>
            </ContextMenuItem>

            <ContextMenuItem onClick={handleContextMenuLock}>
              {contextMenuLayer.locked ? (
                <Unlock size={16} />
              ) : (
                <Lock size={16} />
              )}
              <span>
                {contextMenuLayer.locked ? "Unlock Layer" : "Lock Layer"}
              </span>
              <Kbd className="ml-auto">L</Kbd>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              variant="destructive"
              onClick={handleContextMenuDelete}
            >
              <Trash2 size={16} />
              <span>Delete Layer</span>
              <Kbd className="ml-auto">Del</Kbd>
            </ContextMenuItem>
          </>
        ) : (
          <ContextMenuItem
            onClick={handlePaste}
            disabled={!hasInternalCopy && !hasClipboardContent}
          >
            <Clipboard size={16} />
            <span>Paste</span>
            <Kbd className="ml-auto">Ctrl+V</Kbd>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
