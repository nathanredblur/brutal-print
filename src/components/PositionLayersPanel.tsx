/**
 * PositionLayersPanel Component - Combined position controls and layer management
 * Shown in left panel when clicking "Position" button in context bar
 * Inspired by Canva's position panel
 */

import type { FC } from 'react';
import type { Layer } from '../types/layer';

interface PositionLayersPanelProps {
  selectedLayer: Layer | null;
  layers: Layer[];
  onUpdateLayer: (layerId: string, updates: any) => void;
  onSelectLayer: (layerId: string | null) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
}

const PositionLayersPanel: FC<PositionLayersPanelProps> = ({
  selectedLayer,
  layers,
  onUpdateLayer,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
  onMoveLayer,
}) => {
  return (
    <div className="position-layers-panel">
      {/* Position Section */}
      {selectedLayer && (
        <>
          <div className="panel-section">
            <h4 className="section-title">Organizar</h4>
            <div className="organize-grid">
              <button
                className="organize-btn"
                onClick={() => onMoveLayer(selectedLayer.id, 'up')}
                title="Traer al frente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8l-6-6-6 6M12 2v14" />
                </svg>
                <span>Al frente</span>
              </button>

              <button
                className="organize-btn"
                onClick={() => onMoveLayer(selectedLayer.id, 'down')}
                title="Enviar atrás"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 16l6 6 6-6M12 22V8" />
                </svg>
                <span>Atrás</span>
              </button>
            </div>
          </div>

          <div className="panel-section">
            <h4 className="section-title">Alinear a la página</h4>
            <div className="align-grid">
              <button className="align-btn" title="Arriba">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <rect x="8" y="10" width="8" height="10" rx="1" />
                </svg>
              </button>

              <button className="align-btn" title="Izquierda">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="4" x2="6" y2="20" />
                  <rect x="10" y="8" width="10" height="8" rx="1" />
                </svg>
              </button>

              <button className="align-btn" title="Centro horizontal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="4" x2="12" y2="20" />
                  <rect x="7" y="8" width="10" height="8" rx="1" />
                </svg>
              </button>

              <button className="align-btn" title="Centro vertical">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <rect x="8" y="7" width="8" height="10" rx="1" />
                </svg>
              </button>

              <button className="align-btn" title="Derecha">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="4" x2="18" y2="20" />
                  <rect x="4" y="8" width="10" height="8" rx="1" />
                </svg>
              </button>

              <button className="align-btn" title="Abajo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <rect x="8" y="4" width="8" height="10" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="panel-section">
            <h4 className="section-title">Avanzado</h4>
            <div className="advanced-controls">
              <div className="control-group">
                <label className="control-label">X</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.x)}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { x: parseInt(e.target.value) || 0 })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.y)}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { y: parseInt(e.target.value) || 0 })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Ancho</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.width)}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { width: parseInt(e.target.value) || 1 })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Alto</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.height)}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { height: parseInt(e.target.value) || 1 })}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Rotar</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.rotation || 0)}
                  onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) || 0 })}
                  className="control-input"
                />
                <span className="control-unit">°</span>
              </div>
            </div>
          </div>

          <div className="divider" />
        </>
      )}

      {/* Layers Section */}
      <div className="panel-section">
        <h4 className="section-title">Capas</h4>
        <div className="layers-list">
          {layers.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <p>No hay capas</p>
            </div>
          ) : (
            [...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                className={`layer-item ${selectedLayer?.id === layer.id ? 'selected' : ''}`}
                onClick={() => onSelectLayer(layer.id)}
              >
                <div className="layer-preview">
                  {layer.type === 'text' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 7 4 4 20 4 20 7" />
                      <line x1="9" y1="20" x2="15" y2="20" />
                      <line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                </div>

                <div className="layer-info">
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-type">{layer.type}</span>
                </div>

                <div className="layer-actions">
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    title={layer.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {layer.visible ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>

                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    title={layer.locked ? 'Desbloquear' : 'Bloquear'}
                  >
                    {layer.locked ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                    )}
                  </button>

                  <button
                    className="layer-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar capa "${layer.name}"?`)) {
                        onRemoveLayer(layer.id);
                      }
                    }}
                    title="Eliminar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .position-layers-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .organize-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .organize-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .organize-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .align-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .align-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .align-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .advanced-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
        }

        .control-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .control-input {
          padding: 0.5rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all var(--transition-fast);
        }

        .control-input:focus {
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
        }

        .control-unit {
          position: absolute;
          right: 0.5rem;
          bottom: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .divider {
          height: 1px;
          background: var(--color-border);
          margin: 0.5rem 0;
        }

        .layers-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          color: var(--color-text-muted);
        }

        .empty-state svg {
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 0.875rem;
          margin: 0;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .layer-item:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
        }

        .layer-item.selected {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .layer-preview {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
        }

        .layer-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .layer-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .layer-type {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: capitalize;
        }

        .layer-actions {
          display: flex;
          gap: 0.25rem;
        }

        .layer-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
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

export default PositionLayersPanel;

