/**
 * LayersPanel Component - Figma-style layers panel
 * Always visible in the left sidebar
 */

import { memo, useMemo, useCallback } from "react";
import type { FC } from "react";
import type { Layer } from "../types/layer";
import { useConfirmDialogStore } from "../stores/useConfirmDialogStore";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Image,
  Type,
  Layers,
} from "lucide-react";
import {
  useLayersStore,
  selectSelectedLayer,
  selectSelectedLayerIndex,
} from "@/stores/useLayersStore";

const LayersPanel = () => {
  const layers = useLayersStore((state) => state.layers);
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const selectedLayer = useLayersStore(selectSelectedLayer);
  const selectedLayerIndex = useLayersStore(selectSelectedLayerIndex);

  const canMoveUp = selectedLayerIndex < layers.length - 1;
  const canMoveDown = selectedLayerIndex > 0;
  // Memoize reversed layers to avoid creating new array on each render
  const reversedLayers = useMemo(() => [...layers].reverse(), [layers]);

  // Actions
  const selectLayer = useLayersStore((state) => state.selectLayer);
  const toggleVisibility = useLayersStore((state) => state.toggleVisibility);
  const toggleLock = useLayersStore((state) => state.toggleLock);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const moveLayer = useLayersStore((state) => state.moveLayer);

  // Handle layer movement with direction (up/down)
  const onMoveLayer = (layerId: string, direction: "up" | "down") => {
    const currentIndex = layers.findIndex((l) => l.id === layerId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex < layers.length - 1) {
      moveLayer(currentIndex, currentIndex + 1);
    } else if (direction === "down" && currentIndex > 0) {
      moveLayer(currentIndex, currentIndex - 1);
    }
  };

  return (
    <div className="w-60 bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-r border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-700">
        <h2 className="text-[0.6875rem] font-bold tracking-widest text-slate-500 m-0">
          LAYERS
        </h2>
      </div>

      {/* Layer order controls - always visible, disabled when no selection */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-700 bg-purple-500/5">
        <Button
          variant="neuro-icon"
          size="icon-sm"
          onClick={() => selectedLayer && onMoveLayer(selectedLayer.id, "up")}
          disabled={!canMoveUp}
          title={
            !selectedLayer
              ? "Select a layer to reorder"
              : !canMoveUp
              ? "Layer is already at the top"
              : "Bring forward"
          }
        >
          <ChevronUp size={12} />
        </Button>
        <Button
          variant="neuro-icon"
          size="icon-sm"
          onClick={() => selectedLayer && onMoveLayer(selectedLayer.id, "down")}
          disabled={!canMoveDown}
          title={
            !selectedLayer
              ? "Select a layer to reorder"
              : !canMoveDown
              ? "Layer is already at the bottom"
              : "Send backward"
          }
        >
          <ChevronDown size={12} />
        </Button>
      </div>

      {/* Layers list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {layers.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No layers yet"
            description="Use the tools below to add content"
          />
        ) : (
          reversedLayers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={selectedLayerId === layer.id}
              onSelectLayer={selectLayer}
              onToggleVisibility={toggleVisibility}
              onToggleLock={toggleLock}
              onRemoveLayer={removeLayer}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Memoized LayerItem component to prevent unnecessary re-renders
interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
}

const LayerItem = memo<LayerItemProps>(
  ({
    layer,
    isSelected,
    onSelectLayer,
    onToggleVisibility,
    onToggleLock,
    onRemoveLayer,
  }) => {
    const confirmDialog = useConfirmDialogStore((state) => state.confirm);

    const handleSelect = useCallback(() => {
      onSelectLayer(layer.id);
    }, [layer.id, onSelectLayer]);

    const handleToggleVisibility = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleVisibility(layer.id);
      },
      [layer.id, onToggleVisibility]
    );

    const handleToggleLock = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleLock(layer.id);
      },
      [layer.id, onToggleLock]
    );

    const handleRemove = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmed = await confirmDialog(
          "Delete Layer?",
          `Are you sure you want to delete "${layer.name}"? This action cannot be undone.`,
          { confirmText: "Delete", cancelText: "Cancel" }
        );
        if (confirmed) {
          onRemoveLayer(layer.id);
        }
      },
      [layer.id, layer.name, onRemoveLayer, confirmDialog]
    );

    return (
      <div
        className={`
          group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all
          bg-slate-800 border border-slate-700
          hover:bg-purple-500/5 hover:border-purple-500/30
          ${
            isSelected
              ? "bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500 shadow-lg shadow-purple-500/25"
              : ""
          }
        `}
        onClick={handleSelect}
      >
        <div className="shrink-0 w-6 h-6 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-sm text-slate-400">
          {layer.type === "text" ? <Type size={14} /> : <Image size={14} />}
        </div>

        <span className="flex-1 text-xs font-medium text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
          {layer.name}
        </span>

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleVisibility}
            title={layer.visible ? "Hide" : "Show"}
            className="h-6 w-6"
          >
            {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleLock}
            title={layer.locked ? "Unlock" : "Lock"}
            className="h-6 w-6"
          >
            {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            title="Delete"
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    );
  }
);

LayerItem.displayName = "LayerItem";

export default memo(LayersPanel);
