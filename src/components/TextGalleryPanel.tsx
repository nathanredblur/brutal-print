/**
 * TextGalleryPanel Component
 * Shows a button to add new text and a gallery of text templates
 */

import type { FC } from "react";
import Gallery from "./Gallery";
import type { GalleryItem } from "./Gallery";
import { textTemplates, type TextTemplateData } from "../data/textTemplates";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DEFAULT_FONT_FAMILY } from "../constants/fonts";
import { PanelHeader } from "@/components/ui/panel";

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
      fontFamily: DEFAULT_FONT_FAMILY,
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
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <PanelHeader title="TEXT" onClose={onClose} className="pb-3 border-b border-slate-700" />

      {/* Add New Text Button */}
      <Button
        variant="neuro"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleAddBlankText}
      >
        <Plus className="w-5 h-5" />
        <span>Add Text Box</span>
      </Button>

      {/* Gallery Section */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
          Templates
        </div>
        <Gallery
          items={textTemplates}
          onItemSelect={handleTemplateSelect}
          placeholder="Search text styles..."
          emptyMessage="No templates found"
        />
      </div>
    </div>
  );
};

export default TextGalleryPanel;
