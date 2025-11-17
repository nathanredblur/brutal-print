/**
 * TypographySection - Typography controls for text elements
 */

import { memo, useCallback } from "react";
import type { FC } from "react";
import type { TextLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TypographySectionProps {
  layer: TextLayer;
  onUpdate: (layerId: string, updates: Partial<TextLayer>) => void;
}

// Static font family options - no need to recreate on each render
const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
] as const;

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
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(layer.id, { fontFamily: e.target.value });
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
      <div className="property-field">
        <label>Font Family</label>
        <select
          value={layer.fontFamily || "Inter"}
          onChange={handleFontFamilyChange}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="property-field">
        <label>Font Size</label>
        <div className="input-with-controls">
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
      </div>

      {/* Style (Bold, Italic) */}
      <div className="property-field">
        <label>Style</label>
        <div className="button-group">
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
      </div>

      {/* Alignment */}
      <div className="property-field">
        <label>Alignment</label>
        <div className="button-group">
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
      </div>

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

        .property-field input,
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

        .property-field input:focus,
        .property-field select:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
        }

        .input-with-controls {
          display: grid;
          grid-template-columns: 32px 1fr 32px;
          gap: 0.25rem;
        }

        .input-with-controls button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .input-with-controls button:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .style-btn,
        .align-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .style-btn:hover,
        .align-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .style-btn.active,
        .align-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }
      `}</style>
    </PropertySection>
  );
};

export default memo(TypographySection);
