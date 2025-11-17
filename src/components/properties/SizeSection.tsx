/**
 * SizeSection - Dimensions controls
 */

import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Square } from "lucide-react";

interface SizeSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const SizeSection: FC<SizeSectionProps> = ({ layer, onUpdate }) => {
  const isTextLayer = layer.type === "text";

  return (
    <PropertySection
      title="Size"
      value="size"
      icon={<Square size={14} />}
    >
      <div className="property-grid">
        <div className="property-field">
          <label>Width</label>
          <input
            type="number"
            value={Math.round(layer.width)}
            onChange={(e) =>
              onUpdate(layer.id, { width: parseFloat(e.target.value) || 1 })
            }
            min="1"
          />
        </div>
        <div className="property-field">
          <label>Height</label>
          <input
            type="number"
            value={Math.round(layer.height)}
            onChange={(e) =>
              onUpdate(layer.id, { height: parseFloat(e.target.value) || 1 })
            }
            min="1"
            disabled={isTextLayer}
            title={isTextLayer ? "Height is determined by text content" : ""}
          />
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

        .property-field input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--color-bg-secondary);
        }
      `}</style>
    </PropertySection>
  );
};

export default SizeSection;

