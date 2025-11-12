/**
 * Layer Panel Component
 * 
 * Displays all canvas layers with controls for visibility, lock, and selection
 * Supports drag & drop to reorder layers
 */

import { useState } from 'react';
import type { Layer } from '../types/layer';
import ConfirmDialog from './ConfirmDialog';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRemoveLayer: (id: string) => void;
  onMoveLayer: (fromIndex: number, toIndex: number) => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
  onMoveLayer,
}: LayerPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; layer: Layer | null }>({
    isOpen: false,
    layer: null,
  });

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'image':
        return '📷';
      case 'text':
        return '🔤';
      case 'shape':
        return '⬜';
      default:
        return '📄';
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Since layers are displayed reversed, we need to calculate the actual indices
    const reversedLength = layers.length - 1;
    const fromIndex = reversedLength - draggedIndex;
    const toIndex = reversedLength - dropIndex;
    
    onMoveLayer(fromIndex, toIndex);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeleteClick = (layer: Layer) => {
    setDeleteConfirm({ isOpen: true, layer });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.layer) {
      onRemoveLayer(deleteConfirm.layer.id);
    }
    setDeleteConfirm({ isOpen: false, layer: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, layer: null });
  };

  return (
    <div className="layer-panel">
      <h3 className="panel-title">Layers ({layers.length})</h3>
      
      {layers.length === 0 ? (
        <div className="empty-state">
          <p>No layers yet</p>
          <p className="hint">Add images or text to start</p>
        </div>
      ) : (
        <div className="layers-list">
          {/* Render in reverse order (top layer first) */}
          {[...layers].reverse().map((layer, reversedIndex) => (
            <div
              key={layer.id}
              className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''} ${
                layer.locked ? 'locked' : ''
              } ${draggedIndex === reversedIndex ? 'dragging' : ''} ${
                dragOverIndex === reversedIndex ? 'drag-over' : ''
              }`}
              draggable={!layer.locked}
              onDragStart={(e) => handleDragStart(e, reversedIndex)}
              onDragOver={(e) => handleDragOver(e, reversedIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, reversedIndex)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="drag-handle" title="Drag to reorder">
                ⋮⋮
              </div>

              <div className="layer-controls">
                <button
                  className="layer-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? '👁' : '👁‍🗨'}
                </button>
                
                <button
                  className="layer-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>
              </div>

              <div className="layer-info">
                <span className="layer-icon">{getLayerIcon(layer.type)}</span>
                <span className="layer-name">{layer.name}</span>
              </div>

              <button
                className="layer-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(layer);
                }}
                title="Delete layer"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Layer"
        message={`Are you sure you want to delete "${deleteConfirm.layer?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <style>{`
        .layer-panel {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }

        .panel-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
          padding: 0 0 0.5rem 0;
          border-bottom: 1px solid var(--color-border);
        }

        .empty-state {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-muted);
        }

        .empty-state p {
          margin: 0.25rem 0;
        }

        .empty-state .hint {
          font-size: 0.75rem;
        }

        .layers-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: grab;
          transition: all var(--transition-normal);
        }

        .layer-item:hover {
          background: var(--color-panel-light);
          border-color: var(--color-border-light);
        }

        .layer-item.selected {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--color-blue-primary);
          box-shadow: 0 0 0 1px var(--color-blue-primary);
        }

        .layer-item.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .layer-item.dragging {
          opacity: 0.5;
          cursor: grabbing;
        }

        .layer-item.drag-over {
          border-color: var(--color-cyan);
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
        }

        .drag-handle {
          color: var(--color-text-muted);
          font-size: 0.75rem;
          cursor: grab;
          user-select: none;
          opacity: 0.4;
          transition: opacity var(--transition-normal);
        }

        .layer-item:hover .drag-handle {
          opacity: 1;
        }

        .layer-item.dragging .drag-handle {
          cursor: grabbing;
        }

        .layer-controls {
          display: flex;
          gap: 0.25rem;
        }

        .layer-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .layer-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .layer-name {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .layer-btn {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          font-size: 0.875rem;
          opacity: 0.6;
          transition: opacity var(--transition-normal);
          flex-shrink: 0;
        }

        .layer-btn:hover {
          opacity: 1;
        }

        .delete-btn {
          color: var(--color-text-muted);
        }

        .delete-btn:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

