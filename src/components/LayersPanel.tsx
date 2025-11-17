/**
 * LayersPanel Component - Figma-style layers panel
 * Always visible in the left sidebar
 */

import type { FC } from "react";
import type { Layer } from "../types/layer";
import { Button } from "@/components/ui/button";

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
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="layers-panel">
      <div className="layers-header">
        <h2 className="layers-title">LAYERS</h2>
      </div>

      {/* Layer order controls - inline with header when selected */}
      {selectedLayer && (
        <div className="layer-order-actions">
          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={() => onMoveLayer(selectedLayer.id, "up")}
            title="Bring forward"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </Button>
          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={() => onMoveLayer(selectedLayer.id, "down")}
            title="Send backward"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Button>
        </div>
      )}

      {/* Layers list */}
      <div className="layers-list">
        {layers.length === 0 ? (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p>No layers yet</p>
            <span className="hint">Use the tools below to add content</span>
          </div>
        ) : (
          [...layers].reverse().map((layer, index) => (
            <div
              key={layer.id}
              className={`layer-item ${
                selectedLayerId === layer.id ? "selected" : ""
              }`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="layer-icon">
                {layer.type === "text" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>

              <span className="layer-name">{layer.name}</span>

              <div className="layer-actions">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? "Hide" : "Show"}
                  className="h-6 w-6"
                >
                  {layer.visible ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                  title={layer.locked ? "Unlock" : "Lock"}
                  className="h-6 w-6"
                >
                  {layer.locked ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete layer "${layer.name}"?`)) {
                      onRemoveLayer(layer.id);
                    }
                  }}
                  title="Delete"
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
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

export default LayersPanel;
