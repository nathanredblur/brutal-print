/**
 * SizeSection - Dimensions controls
 */

import { memo, useCallback } from "react";
import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field-group";
import { Square } from "lucide-react";

interface SizeSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const SizeSection: FC<SizeSectionProps> = ({ layer, onUpdate }) => {
  const isTextLayer = layer.type === "text";

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { width: parseFloat(e.target.value) || 1 });
    },
    [layer.id, onUpdate]
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { height: parseFloat(e.target.value) || 1 });
    },
    [layer.id, onUpdate]
  );

  return (
    <PropertySection title="Size" value="size" icon={<Square size={14} />}>
      <div className="grid grid-cols-2 gap-2">
        <FieldGroup label="Width">
          <Input
            type="number"
            value={Math.round(layer.width)}
            onChange={handleWidthChange}
            min="1"
          />
        </FieldGroup>
        <FieldGroup label="Height">
          <Input
            type="number"
            value={Math.round(layer.height)}
            onChange={handleHeightChange}
            min="1"
            disabled={isTextLayer}
            title={isTextLayer ? "Height is determined by text content" : ""}
          />
        </FieldGroup>
      </div>
    </PropertySection>
  );
};

export default memo(SizeSection);
