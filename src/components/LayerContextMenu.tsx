/**
 * LayerContextMenu Component
 *
 * Context menu for layer operations (copy, paste, visibility, lock, delete)
 * Consumes useLayersStore directly to avoid prop drilling
 */

import { useCallback, type ReactNode } from "react";
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
  // Consume store directly
  const layers = useLayersStore((state) => state.layers);
  const copiedLayer = useLayersStore((state) => state.copiedLayer);
  const toggleVisibility = useLayersStore((state) => state.toggleVisibility);
  const toggleLock = useLayersStore((state) => state.toggleLock);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const copyLayer = useLayersStore((state) => state.copyLayer);
  const pasteLayer = useLayersStore((state) => state.pasteLayer);
  const confirmDialog = useConfirmDialogStore((state) => state.confirm);

  // Get context menu layer
  const contextMenuLayer = layers.find((l) => l.id === contextMenuLayerId);

  // Context menu handlers
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

  const handleContextMenuCopy = useCallback(() => {
    if (contextMenuLayerId) {
      copyLayer(contextMenuLayerId);
      toast.success("Layer copied", {
        description: "Press Cmd+V to paste",
      });
    }
  }, [contextMenuLayerId, copyLayer]);

  const handleContextMenuPaste = useCallback(() => {
    if (contextMenuPosition) {
      pasteLayer(contextMenuPosition.x, contextMenuPosition.y);
      toast.success("Layer pasted");
    }
  }, [pasteLayer, contextMenuPosition]);

  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent
        className="w-64"
        key={`${contextMenuLayerId || "canvas"}-${contextMenuPosition?.x}-${
          contextMenuPosition?.y
        }`}
      >
        {contextMenuLayer ? (
          <>
            <ContextMenuItem onClick={handleContextMenuCopy}>
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
            onClick={handleContextMenuPaste}
            disabled={!copiedLayer}
          >
            <Clipboard size={16} />
            <span>Paste Here</span>
            <Kbd className="ml-auto">Ctrl+V</Kbd>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
