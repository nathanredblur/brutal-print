/**
 * SizeSection - Dimensions controls
 */

import { memo, useCallback, useState, useEffect } from "react";
import type { FC } from "react";
import type { Layer, ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field-group";
import { Button } from "@/components/ui/button";
import { Square, Maximize2 } from "lucide-react";
import { base64ToImage } from "@/utils/imageConversion";

interface SizeSectionProps {
  layer: Layer;
  onUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

const SizeSection: FC<SizeSectionProps> = ({ layer, onUpdate }) => {
  const isTextLayer = layer.type === "text";
  const isImageLayer = layer.type === "image";
  const imageLayer = isImageLayer ? (layer as ImageLayer) : null;

  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Get original dimensions from originalImageData
  useEffect(() => {
    if (!imageLayer) return;

    base64ToImage(imageLayer.originalImageData)
      .then((img) => {
        setOriginalDimensions({
          width: img.width,
          height: img.height,
        });
      })
      .catch((error) => {
        console.error("Failed to load original image dimensions:", error);
      });
  }, [imageLayer?.originalImageData]);

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

  const handleResetAspectRatio = useCallback(() => {
    if (!originalDimensions) return;

    // Calculate original aspect ratio
    const originalAspectRatio =
      originalDimensions.width / originalDimensions.height;

    // Keep current width, adjust height to match original aspect ratio
    const newHeight = Math.round(layer.width / originalAspectRatio);

    onUpdate(layer.id, {
      height: newHeight,
    });
  }, [layer.id, layer.width, originalDimensions, onUpdate]);

  return (
    <PropertySection title="Size" value="size" icon={<Square size={14} />}>
      <div className="flex gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1">
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
        {isImageLayer && originalDimensions && (
          <div className="flex items-end">
            <Button
              variant="neuro-ghost"
              size="icon-sm"
              onClick={handleResetAspectRatio}
              title={`Reset aspect ratio (${originalDimensions.width}:${originalDimensions.height})`}
            >
              <Maximize2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </PropertySection>
  );
};

export default memo(SizeSection);
