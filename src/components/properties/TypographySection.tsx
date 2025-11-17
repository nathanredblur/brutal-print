/**
 * TypographySection - Typography controls for text elements
 */

import type { FC } from "react";
import type { TextLayer } from "../../types/layer";
import PropertySection from "./PropertySection";
import { Button } from "@/components/ui/button";
import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TypographySectionProps {
  layer: TextLayer;
  onUpdate: (layerId: string, updates: Partial<TextLayer>) => void;
}

const TypographySection: FC<TypographySectionProps> = ({
  layer,
  onUpdate,
}) => {
  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(8, Math.min(200, (layer.fontSize || 24) + delta));
    onUpdate(layer.id, { fontSize: newSize });
  };

  const toggleBold = () => {
    onUpdate(layer.id, { bold: !layer.bold });
  };

  const toggleItalic = () => {
    onUpdate(layer.id, { italic: !layer.italic });
  };

  const changeAlign = (align: "left" | "center" | "right") => {
    onUpdate(layer.id, { align });
  };

  return (
    <PropertySection
      title="Typography"
      defaultExpanded={true}
      icon={<Type size={14} />}
    >
      {/* Font Family */}
      <div className="property-field">
        <label>Font Family</label>
        <select
          value={layer.fontFamily || "Inter"}
          onChange={(e) => onUpdate(layer.id, { fontFamily: e.target.value })}
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="property-field">
        <label>Font Size</label>
        <div className="input-with-controls">
          <Button 
            variant="neuro-ghost" 
            size="icon-sm" 
            onClick={() => handleFontSizeChange(-2)} 
            title="Decrease"
          >
            −
          </Button>
          <input
            type="number"
            value={layer.fontSize || 24}
            onChange={(e) =>
              onUpdate(layer.id, { fontSize: parseFloat(e.target.value) || 24 })
            }
            min="8"
            max="200"
          />
          <Button 
            variant="neuro-ghost" 
            size="icon-sm" 
            onClick={() => handleFontSizeChange(2)} 
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
            onClick={() => changeAlign("left")}
            title="Align left"
            className="flex-1"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            variant={layer.align === "center" ? "neuro" : "neuro-ghost"}
            size="icon-sm"
            onClick={() => changeAlign("center")}
            title="Align center"
            className="flex-1"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            variant={layer.align === "right" ? "neuro" : "neuro-ghost"}
            size="icon-sm"
            onClick={() => changeAlign("right")}
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

export default TypographySection;

