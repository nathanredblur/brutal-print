/**
 * LayersPanel Component - Figma-style layers panel
 * Always visible in the left sidebar
 */

import { memo, useMemo, useCallback } from "react";
import type { FC } from "react";
import type { Layer } from "../types/layer";
import { Button } from "@/components/ui/button";
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

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onMoveLayer: (layerId: string, direction: "up" | "down") => void;
}

const LayersPanel: FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
  onMoveLayer,
}) => {
  // Memoize reversed layers to avoid creating new array on each render
  const reversedLayers = useMemo(() => [...layers].reverse(), [layers]);

  // Memoize selected layer info
  const { selectedLayer, selectedIndex, canMoveUp, canMoveDown } = useMemo(() => {
    const layer = layers.find((l) => l.id === selectedLayerId);
    const index = layer ? layers.findIndex((l) => l.id === selectedLayerId) : -1;
    return {
      selectedLayer: layer,
      selectedIndex: index,
      canMoveUp: layer && index < layers.length - 1,
      canMoveDown: layer && index > 0,
    };
  }, [layers, selectedLayerId]);

  return (
    <div className="layers-panel">
      <div className="layers-header">
        <h2 className="layers-title">LAYERS</h2>
      </div>

      {/* Layer order controls - always visible, disabled when no selection */}
      <div className="layer-order-actions">
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
      <div className="layers-list">
        {layers.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} />
            <p>No layers yet</p>
            <span className="hint">Use the tools below to add content</span>
          </div>
        ) : (
          reversedLayers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={selectedLayerId === layer.id}
              onSelectLayer={onSelectLayer}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onRemoveLayer={onRemoveLayer}
            />
          ))
        )}
      </div>

      <style>{`
        .layers-panel {
          width: 240px;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .layers-header {
          padding: 0.75rem 0.75rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .layers-title {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin: 0;
        }

        .layer-order-actions {
          display: flex;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid var(--color-border);
          background: rgba(167, 139, 250, 0.05);
        }

        .order-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .order-btn:hover {
          background: rgba(167, 139, 250, 0.15);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .layers-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .layers-list::-webkit-scrollbar {
          width: 6px;
        }

        .layers-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .layers-list::-webkit-scrollbar-thumb {
          background: var(--color-slate-dark);
          border-radius: 3px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 0.75rem;
          color: var(--color-text-muted);
          text-align: center;
        }

        .empty-state svg {
          opacity: 0.3;
        }

        .empty-state p {
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0;
          color: var(--color-text-secondary);
        }

        .empty-state .hint {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .layer-item:hover {
          background: rgba(167, 139, 250, 0.05);
          border-color: rgba(167, 139, 250, 0.3);
        }

        .layer-item.selected {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.25);
        }

        .layer-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
        }

        .layer-name {
          flex: 1;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .layer-actions {
          display: flex;
          gap: 0.125rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .layer-item:hover .layer-actions,
        .layer-item.selected .layer-actions {
          opacity: 1;
        }

        .layer-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .layer-action-btn:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border);
          color: var(--color-text-primary);
        }

        .layer-action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
      `}</style>
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

const LayerItem = memo<LayerItemProps>(({
  layer,
  isSelected,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
}) => {
  const handleSelect = useCallback(() => {
    onSelectLayer(layer.id);
  }, [layer.id, onSelectLayer]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(layer.id);
  }, [layer.id, onToggleVisibility]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock(layer.id);
  }, [layer.id, onToggleLock]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete layer "${layer.name}"?`)) {
      onRemoveLayer(layer.id);
    }
  }, [layer.id, layer.name, onRemoveLayer]);

  return (
    <div
      className={`layer-item ${isSelected ? "selected" : ""}`}
      onClick={handleSelect}
    >
      <div className="layer-icon">
        {layer.type === "text" ? <Type size={14} /> : <Image size={14} />}
      </div>

      <span className="layer-name">{layer.name}</span>

      <div className="layer-actions">
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
});

LayerItem.displayName = "LayerItem";

export default memo(LayersPanel);
