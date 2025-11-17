/**
 * TextGalleryPanel Component
 * Shows a button to add new text and a gallery of text templates
 */

import type { FC } from "react";
import Gallery from "./Gallery";
import type { GalleryItem } from "./Gallery";
import { textTemplates, type TextTemplateData } from "../data/textTemplates";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TextGalleryPanelProps {
  onAddText: (text: string, options: TextTemplateData) => void;
  onClose: () => void;
}

const TextGalleryPanel: FC<TextGalleryPanelProps> = ({
  onAddText,
  onClose,
}) => {
  const handleAddBlankText = () => {
    onAddText("Double-click to edit", {
      text: "Double-click to edit",
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: false,
      align: "left",
    });
  };

  const handleTemplateSelect = (item: GalleryItem) => {
    const templateData = item.data as TextTemplateData;
    onAddText(templateData.text, templateData);
  };

  return (
    <div className="text-gallery-panel">
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">TEXT</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Add New Text Button */}
      <div className="add-text-section">
        <Button 
          variant="neuro" 
          className="add-text-btn w-full" 
          onClick={handleAddBlankText}
        >
          <Plus className="w-5 h-5" />
          <span>Add Text Box</span>
        </Button>
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <div className="section-label">Templates</div>
        <Gallery
          items={textTemplates}
          onItemSelect={handleTemplateSelect}
          placeholder="Search text styles..."
          emptyMessage="No templates found"
        />
      </div>

      <style>{`
        .text-gallery-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 0.75rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .panel-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .add-text-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .add-text-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .gallery-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 0;
        }

        .section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};

export default TextGalleryPanel;

