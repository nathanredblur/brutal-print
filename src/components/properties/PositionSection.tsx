/**
 * PositionSection - Position and rotation controls
 */

import { memo, useCallback } from "react";
import type { FC } from "react";
import type { Layer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field-group";
import { Move } from "lucide-react";

interface PositionSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const PositionSection: FC<PositionSectionProps> = ({ layer, onUpdate }) => {
  const handleXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { x: parseFloat(e.target.value) || 0 });
    },
    [layer.id, onUpdate]
  );

  const handleYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { y: parseFloat(e.target.value) || 0 });
    },
    [layer.id, onUpdate]
  );

  const handleRotationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { rotation: parseFloat(e.target.value) || 0 });
    },
    [layer.id, onUpdate]
  );

  return (
    <PropertySection
      title="Position"
      value="position"
      icon={<Move size={14} />}
    >
      <div className="grid grid-cols-2 gap-2">
        <FieldGroup label="X">
          <Input
            type="number"
            value={Math.round(layer.x)}
            onChange={handleXChange}
          />
        </FieldGroup>
        <FieldGroup label="Y">
          <Input
            type="number"
            value={Math.round(layer.y)}
            onChange={handleYChange}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Rotation">
        <div className="relative">
          <Input
            type="number"
            value={Math.round(layer.rotation || 0)}
            onChange={handleRotationChange}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
            °
          </span>
        </div>
      </FieldGroup>
    </PropertySection>
  );
};

export default memo(PositionSection);
