/**
 * TypographySection - Typography controls for text elements
 */

import { memo, useCallback } from "react";
import type { FC } from "react";
import type { TextLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { FONT_FAMILIES, DEFAULT_FONT_FAMILY } from "../../constants/fonts";

interface TypographySectionProps {
  layer: TextLayer;
  onUpdate: (layerId: string, updates: Partial<TextLayer>) => void;
}

const TypographySection: FC<TypographySectionProps> = ({ layer, onUpdate }) => {
  const handleFontSizeDecrease = useCallback(() => {
    const newSize = Math.max(8, Math.min(200, (layer.fontSize || 24) - 2));
    onUpdate(layer.id, { fontSize: newSize });
  }, [layer.fontSize, layer.id, onUpdate]);

  const handleFontSizeIncrease = useCallback(() => {
    const newSize = Math.max(8, Math.min(200, (layer.fontSize || 24) + 2));
    onUpdate(layer.id, { fontSize: newSize });
  }, [layer.fontSize, layer.id, onUpdate]);

  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(layer.id, { fontSize: parseFloat(e.target.value) || 24 });
    },
    [layer.id, onUpdate]
  );

  const handleFontFamilyChange = useCallback(
    (value: string) => {
      onUpdate(layer.id, { fontFamily: value });
    },
    [layer.id, onUpdate]
  );

  const toggleBold = useCallback(() => {
    onUpdate(layer.id, { bold: !layer.bold });
  }, [layer.id, layer.bold, onUpdate]);

  const toggleItalic = useCallback(() => {
    onUpdate(layer.id, { italic: !layer.italic });
  }, [layer.id, layer.italic, onUpdate]);

  const changeAlignLeft = useCallback(() => {
    onUpdate(layer.id, { align: "left" });
  }, [layer.id, onUpdate]);

  const changeAlignCenter = useCallback(() => {
    onUpdate(layer.id, { align: "center" });
  }, [layer.id, onUpdate]);

  const changeAlignRight = useCallback(() => {
    onUpdate(layer.id, { align: "right" });
  }, [layer.id, onUpdate]);

  return (
    <PropertySection
      title="Typography"
      value="typography"
      icon={<Type size={14} />}
    >
      {/* Font Family */}
      <FieldGroup label="Font Family">
        <Select
          value={layer.fontFamily || DEFAULT_FONT_FAMILY}
          onValueChange={handleFontFamilyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      {/* Font Size */}
      <FieldGroup label="Font Size">
        <div className="grid grid-cols-[32px_1fr_32px] gap-1">
          <Button
            variant="neuro-ghost"
            size="icon-sm"
            onClick={handleFontSizeDecrease}
            title="Decrease"
          >
            −
          </Button>
          <Input
            type="number"
            value={layer.fontSize || 24}
            onChange={handleFontSizeChange}
            min="8"
            max="200"
            className="text-center"
          />
          <Button
            variant="neuro-ghost"
            size="icon-sm"
            onClick={handleFontSizeIncrease}
            title="Increase"
          >
            +
          </Button>
        </div>
      </FieldGroup>

      {/* Style (Bold, Italic) */}
      <FieldGroup label="Style">
        <div className="flex gap-2">
          <Button
            variant={layer.bold ? "neuro" : "neuro-ghost"}
            size="sm"
            onClick={toggleBold}
            title="Bold"
            className="flex-1"
          >
            <strong>B</strong>
          </Button>
          <Button
            variant={layer.italic ? "neuro" : "neuro-ghost"}
            size="sm"
            onClick={toggleItalic}
            title="Italic"
            className="flex-1"
          >
            <em>I</em>
          </Button>
        </div>
      </FieldGroup>

      {/* Alignment */}
      <FieldGroup label="Alignment">
        <div className="flex gap-2">
          <Button
            variant={layer.align === "left" ? "neuro" : "neuro-ghost"}
            size="icon-sm"
            onClick={changeAlignLeft}
            title="Align left"
            className="flex-1"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            variant={layer.align === "center" ? "neuro" : "neuro-ghost"}
            size="icon-sm"
            onClick={changeAlignCenter}
            title="Align center"
            className="flex-1"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            variant={layer.align === "right" ? "neuro" : "neuro-ghost"}
            size="icon-sm"
            onClick={changeAlignRight}
            title="Align right"
            className="flex-1"
          >
            <AlignRight size={16} />
          </Button>
        </div>
      </FieldGroup>
    </PropertySection>
  );
};

export default memo(TypographySection);
