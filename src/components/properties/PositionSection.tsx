/**
 * PositionSection - Position and rotation controls
 */

import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Input } from "@/components/ui/input";
import { Move } from "lucide-react";

interface PositionSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const PositionSection: FC<PositionSectionProps> = ({ layer, onUpdate }) => {
  return (
    <PropertySection
      title="Position"
      value="position"
      icon={<Move size={14} />}
    >
      <div className="property-grid">
        <div className="property-field">
          <label>X</label>
          <Input
            type="number"
            value={Math.round(layer.x)}
            onChange={(e) =>
              onUpdate(layer.id, { x: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="property-field">
          <label>Y</label>
          <Input
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
          <Input
            type="number"
            value={Math.round(layer.rotation || 0)}
            onChange={(e) =>
              onUpdate(layer.id, { rotation: parseFloat(e.target.value) || 0 })
            }
            className="pr-8"
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

        .input-with-unit {
          position: relative;
        }

        .unit {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }
      `}</style>
    </PropertySection>
  );
};

export default PositionSection;

