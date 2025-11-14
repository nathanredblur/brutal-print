/**
 * ContextBar Component - Canva-style context toolbar
 * Appears below header when an element is selected on canvas
 * Shows quick actions based on the selected element type
 */

import type { FC } from 'react';
import type { Layer, TextLayer, ImageLayer } from '../types/layer';

interface ContextBarProps {
  selectedLayer: Layer | null;
  onUpdateLayer: (layerId: string, updates: any) => void;
  onUpdateTextLayer: (layerId: string, updates: any) => void;
  onUpdateImageLayer: (layerId: string, updates: any) => void;
  onOpenAdvancedPanel: (panelType: 'font' | 'filter' | 'position') => void;
}

const ContextBar: FC<ContextBarProps> = ({
  selectedLayer,
  onUpdateLayer,
  onUpdateTextLayer,
  onUpdateImageLayer,
  onOpenAdvancedPanel,
}) => {
  if (!selectedLayer) return null;

  const isText = selectedLayer.type === 'text';
  const isImage = selectedLayer.type === 'image';
  const textLayer = isText ? (selectedLayer as TextLayer) : null;
  const imageLayer = isImage ? (selectedLayer as ImageLayer) : null;

  // Text controls
  const handleFontSizeChange = (delta: number) => {
    if (!textLayer) return;
    const newSize = Math.max(8, Math.min(200, (textLayer.fontSize || 24) + delta));
    onUpdateTextLayer(selectedLayer.id, { fontSize: newSize });
  };

  const toggleBold = () => {
    if (!textLayer) return;
    onUpdateTextLayer(selectedLayer.id, { bold: !textLayer.bold });
  };

  const toggleItalic = () => {
    if (!textLayer) return;
    onUpdateTextLayer(selectedLayer.id, { italic: !textLayer.italic });
  };

  const changeAlign = (align: 'left' | 'center' | 'right') => {
    if (!textLayer) return;
    onUpdateTextLayer(selectedLayer.id, { align });
  };

  // Image controls
  const toggleInvert = () => {
    if (!imageLayer) return;
    onUpdateImageLayer(selectedLayer.id, { invert: !imageLayer.invert });
  };

  return (
    <div className="context-bar">
      <div className="context-bar-content">
        {/* Common controls */}
        <div className="context-group">
          <span className="context-label">{selectedLayer.name}</span>
        </div>

        {/* Text-specific controls */}
        {isText && textLayer && (
          <>
            <div className="context-separator" />
            
            <div className="context-group">
              <button
                className="context-btn"
                onClick={() => onOpenAdvancedPanel('font')}
                title="Change font"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                <span>{textLayer.fontFamily || 'Inter'}</span>
              </button>

              <button
                className="context-btn icon-only"
                onClick={() => handleFontSizeChange(-2)}
                title="Decrease font size"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>

              <span className="context-value">{textLayer.fontSize || 24}</span>

              <button
                className="context-btn icon-only"
                onClick={() => handleFontSizeChange(2)}
                title="Increase font size"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            <div className="context-separator" />

            <div className="context-group">
              <button
                className={`context-btn icon-only ${textLayer.bold ? 'active' : ''}`}
                onClick={toggleBold}
                title="Bold"
              >
                <strong style={{ fontSize: '14px', fontWeight: 700 }}>B</strong>
              </button>

              <button
                className={`context-btn icon-only ${textLayer.italic ? 'active' : ''}`}
                onClick={toggleItalic}
                title="Italic"
              >
                <em style={{ fontSize: '14px', fontStyle: 'italic' }}>I</em>
              </button>
            </div>

            <div className="context-separator" />

            <div className="context-group">
              <button
                className={`context-btn icon-only ${textLayer.align === 'left' ? 'active' : ''}`}
                onClick={() => changeAlign('left')}
                title="Align left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="17" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </button>

              <button
                className={`context-btn icon-only ${textLayer.align === 'center' ? 'active' : ''}`}
                onClick={() => changeAlign('center')}
                title="Align center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="10" x2="6" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="18" y1="18" x2="6" y2="18" />
                </svg>
              </button>

              <button
                className={`context-btn icon-only ${textLayer.align === 'right' ? 'active' : ''}`}
                onClick={() => changeAlign('right')}
                title="Align right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="21" y1="10" x2="7" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="21" y1="18" x2="7" y2="18" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Image-specific controls */}
        {isImage && imageLayer && (
          <>
            <div className="context-separator" />

            <div className="context-group">
              <button
                className="context-btn"
                onClick={() => onOpenAdvancedPanel('filter')}
                title="Image filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m5.2-13.2l-2.9 2.9m-2.6 2.6l-2.9 2.9m7.8 0l-2.9-2.9m-2.6-2.6l-2.9-2.9" />
                </svg>
                <span>Filters</span>
              </button>

              <button
                className={`context-btn ${imageLayer.invert ? 'active' : ''}`}
                onClick={toggleInvert}
                title="Invert colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
                </svg>
                <span>Invert</span>
              </button>
            </div>
          </>
        )}

        {/* Common advanced options */}
        <div className="context-separator" />

        <div className="context-group">
          <button
            className="context-btn"
            onClick={() => onOpenAdvancedPanel('position')}
            title="Position and layers"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span>Position</span>
          </button>
        </div>
      </div>

      <style>{`
        .context-bar {
          height: 56px;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          animation: slideIn 0.2s ease-out;
          z-index: 9;
        }

        .context-bar-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .context-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .context-separator {
          width: 1px;
          height: 24px;
          background: var(--color-border);
        }

        .context-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          padding: 0 0.5rem;
        }

        .context-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          min-width: 32px;
          text-align: center;
        }

        .context-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .context-btn.icon-only {
          padding: 0.5rem;
          width: 32px;
          height: 32px;
          justify-content: center;
        }

        .context-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .context-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .context-btn svg {
          flex-shrink: 0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContextBar;

