/**
 * PositionSection - Position and rotation controls
 */

import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";

interface PositionSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const PositionSection: FC<PositionSectionProps> = ({ layer, onUpdate }) => {
  return (
    <PropertySection
      title="Position"
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      }
    >
      <div className="property-grid">
        <div className="property-field">
          <label>X</label>
          <input
            type="number"
            value={Math.round(layer.x)}
            onChange={(e) =>
              onUpdate(layer.id, { x: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="property-field">
          <label>Y</label>
          <input
            type="number"
            value={Math.round(layer.y)}
            onChange={(e) =>
              onUpdate(layer.id, { y: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <div className="property-field">
        <label>Rotation</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={Math.round(layer.rotation || 0)}
            onChange={(e) =>
              onUpdate(layer.id, { rotation: parseFloat(e.target.value) || 0 })
            }
          />
          <span className="unit">°</span>
        </div>
      </div>

      <style>{`
        .property-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

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

        .property-field input {
          width: 100%;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
        }

        .property-field input:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
        }

        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-unit input {
          flex: 1;
          padding-right: 2rem;
        }

        .unit {
          position: absolute;
          right: 0.75rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }
      `}</style>
    </PropertySection>
  );
};

export default PositionSection;

