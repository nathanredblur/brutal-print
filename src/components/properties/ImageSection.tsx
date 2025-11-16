/**
 * ImageSection - Image and filter controls
 */

import type { FC } from "react";
import type { ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";

interface ImageSectionProps {
  layer: ImageLayer;
  onUpdate: (layerId: string, updates: Partial<ImageLayer>) => void;
  onOpenAdvancedPanel?: () => void;
}

const ImageSection: FC<ImageSectionProps> = ({
  layer,
  onUpdate,
  onOpenAdvancedPanel,
}) => {
  const toggleInvert = () => {
    onUpdate(layer.id, { invert: !layer.invert });
  };

  return (
    <PropertySection
      title="Image"
      defaultExpanded={true}
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      }
    >
      {/* Dither Method - Read only, change via advanced panel */}
      <div className="property-field">
        <label>Dither Method</label>
        <select value={layer.ditherMethod} disabled>
          <option value="steinberg">Floyd-Steinberg</option>
          <option value="atkinson">Atkinson</option>
          <option value="bayer">Bayer Matrix</option>
          <option value="halftone">Halftone</option>
        </select>
        <p className="field-hint">
          Use "More options" to change dither method
        </p>
      </div>

      {/* Invert Toggle */}
      <div className="property-field">
        <label>Invert Colors</label>
        <button
          className={`toggle-btn ${layer.invert ? "active" : ""}`}
          onClick={toggleInvert}
        >
          {layer.invert ? "ON" : "OFF"}
        </button>
      </div>

      {/* More Options */}
      {onOpenAdvancedPanel && (
        <button className="more-options-btn" onClick={onOpenAdvancedPanel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span>More options</span>
        </button>
      )}

      <style>{`
        .property-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .property-field label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .property-field select {
          width: 100%;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
        }

        .property-field select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .field-hint {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.3;
        }

        .toggle-btn {
          width: 100%;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toggle-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .more-options-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-top: 0.25rem;
        }

        .more-options-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }
      `}</style>
    </PropertySection>
  );
};

export default ImageSection;

