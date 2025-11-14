/**
 * FontPanel Component - Advanced font selection
 * Shown in left panel when clicking "Font" button in context bar
 */

import type { FC } from 'react';
import type { TextLayer } from '../types/layer';

interface FontPanelProps {
  textLayer: TextLayer;
  onUpdateTextLayer: (layerId: string, updates: any) => void;
}

const FontPanel: FC<FontPanelProps> = ({ textLayer, onUpdateTextLayer }) => {
  const fonts = [
    { name: 'Inter', category: 'Sans-serif' },
    { name: 'Space Grotesk', category: 'Sans-serif' },
    { name: 'Arial', category: 'Sans-serif' },
    { name: 'Helvetica', category: 'Sans-serif' },
    { name: 'Times New Roman', category: 'Serif' },
    { name: 'Georgia', category: 'Serif' },
    { name: 'Courier New', category: 'Monospace' },
    { name: 'Monaco', category: 'Monospace' },
  ];

  const handleFontSelect = (fontName: string) => {
    onUpdateTextLayer(textLayer.id, { fontFamily: fontName });
  };

  const currentFont = textLayer.fontFamily || 'Inter';

  return (
    <div className="font-panel">
      <div className="font-panel-section">
        <label className="font-panel-label">Font Family</label>
        <div className="font-list">
          {fonts.map((font) => (
            <button
              key={font.name}
              className={`font-item ${currentFont === font.name ? 'active' : ''}`}
              onClick={() => handleFontSelect(font.name)}
            >
              <span className="font-item-name" style={{ fontFamily: font.name }}>
                {font.name}
              </span>
              <span className="font-item-category">{font.category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="font-panel-section">
        <label className="font-panel-label">Font Size</label>
        <input
          type="range"
          min="8"
          max="200"
          value={textLayer.fontSize || 24}
          onChange={(e) => onUpdateTextLayer(textLayer.id, { fontSize: parseInt(e.target.value) })}
          className="font-slider"
        />
        <div className="font-size-display">{textLayer.fontSize || 24}px</div>
      </div>

      <style>{`
        .font-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .font-panel-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .font-panel-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .font-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .font-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .font-item:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
        }

        .font-item.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .font-item-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .font-item-category {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .font-slider {
          width: 100%;
          height: 6px;
          background: var(--color-bg-secondary);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .font-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .font-slider::-webkit-slider-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .font-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .font-slider::-moz-range-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .font-size-display {
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-purple-primary);
          padding: 0.5rem;
          background: rgba(167, 139, 250, 0.1);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};

export default FontPanel;

