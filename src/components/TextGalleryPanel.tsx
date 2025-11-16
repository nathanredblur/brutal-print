/**
 * TextGalleryPanel Component
 * Shows a button to add new text and a gallery of text templates
 */

import type { FC } from "react";
import Gallery from "./Gallery";
import type { GalleryItem } from "./Gallery";
import { textTemplates, type TextTemplateData } from "../data/textTemplates";

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
        <button className="close-btn" onClick={onClose} title="Close">
          ×
        </button>
      </div>

      {/* Add New Text Button */}
      <div className="add-text-section">
        <button className="add-text-btn" onClick={handleAddBlankText}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Text Box</span>
        </button>
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

        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
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
          padding: 0.75rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border: 1px solid var(--color-purple-primary);
          border-radius: var(--radius-sm);
          color: var(--color-purple-primary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .add-text-btn:hover {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
        }

        .add-text-btn svg {
          flex-shrink: 0;
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

