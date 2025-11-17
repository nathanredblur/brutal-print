/**
 * SizeSection - Dimensions controls
 */

import { memo, useCallback } from "react";
import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Input } from "@/components/ui/input";
import { Square } from "lucide-react";

interface SizeSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const SizeSection: FC<SizeSectionProps> = ({ layer, onUpdate }) => {
  const isTextLayer = layer.type === "text";

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(layer.id, { width: parseFloat(e.target.value) || 1 });
  }, [layer.id, onUpdate]);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(layer.id, { height: parseFloat(e.target.value) || 1 });
  }, [layer.id, onUpdate]);

  return (
    <PropertySection
      title="Size"
      value="size"
      icon={<Square size={14} />}
    >
      <div className="property-grid">
        <div className="property-field">
          <label>Width</label>
          <Input
            type="number"
            value={Math.round(layer.width)}
            onChange={handleWidthChange}
            min="1"
          />
        </div>
        <div className="property-field">
          <label>Height</label>
          <Input
            type="number"
            value={Math.round(layer.height)}
            onChange={handleHeightChange}
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
      `}</style>
    </PropertySection>
  );
};

export default memo(SizeSection);

