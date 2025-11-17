/**
 * PropertiesPanel Component - Figma-style right properties panel
 * Shows properties based on the selected element
 */

import type { FC } from "react";
import type { Layer, TextLayer, ImageLayer } from "../types/layer";
import PositionSection from "./properties/PositionSection";
import SizeSection from "./properties/SizeSection";
import TypographySection from "./properties/TypographySection";
import ImageFiltersSection from "./properties/ImageFiltersSection";
import { Accordion } from "@/components/ui/accordion";
import { Info } from "lucide-react";

type SelectionType = "layer" | "canvas" | null;

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  selectionType: SelectionType;
  onUpdateLayer: (layerId: string, updates: any) => void;
  onUpdateTextLayer: (layerId: string, updates: any) => void;
  onUpdateImageLayer: (layerId: string, updates: any) => void;
  onReprocessImageLayer?: (
    layerId: string,
    newImageData: HTMLCanvasElement,
    updates: any
  ) => void;
  onOpenAdvancedPanel?: (panelType: "font" | "filter" | "canvas") => void;
}

const PropertiesPanel: FC<PropertiesPanelProps> = ({
  selectedLayer,
  selectionType,
  onUpdateLayer,
  onUpdateTextLayer,
  onUpdateImageLayer,
  onReprocessImageLayer,
  onOpenAdvancedPanel,
}) => {
  // Show canvas properties when canvas is selected
  if (selectionType === "canvas") {
    return (
      <aside className="w-[280px] flex flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-l border-border">
        <div className="flex items-center justify-between gap-2 px-4 py-6 border-b border-border">
          <h2 className="text-sm font-bold text-foreground m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Canvas
          </h2>
        </div>

        <div className="flex-1 p-0">
          <div className="border-b border-border p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-foreground mb-2">
              Canvas Settings
            </h3>
            <p className="text-sm text-secondary-foreground m-0 leading-relaxed">
              Click on the Canvas button in the left panel to adjust canvas
              size.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // Don't show anything if nothing is selected
  if (!selectedLayer) {
    return (
      <aside className="w-[280px] flex flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-l border-border">
        <div className="flex items-center justify-between gap-2 px-4 py-6 border-b border-border">
          <h2 className="text-sm font-bold text-foreground m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Properties
          </h2>
        </div>

        <div className="flex-1 p-0">
          <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-muted-foreground text-center">
            <Info size={48} className="opacity-50" />
            <p className="text-sm m-0">
              Select an element to see its properties
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const isText = selectedLayer.type === "text";
  const isImage = selectedLayer.type === "image";

  return (
    <aside className="w-[280px] flex flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-l border-border">
      <div className="flex items-center justify-between gap-2 px-4 py-6 border-b border-border">
        <h2 className="text-sm font-bold text-foreground m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {selectedLayer.name}
        </h2>
        <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-500 rounded uppercase">
          {selectedLayer.type}
        </span>
      </div>

      <div className="flex-1 p-0">
        <Accordion
          type="multiple"
          defaultValue={["position", "size", "typography", "filters"]}
          className="w-full"
        >
          {/* Basic sections - always visible */}
          <PositionSection layer={selectedLayer} onUpdate={onUpdateLayer} />
          <SizeSection layer={selectedLayer} onUpdate={onUpdateLayer} />

          {/* Type-specific sections */}
          {isText && (
            <TypographySection
              layer={selectedLayer as TextLayer}
              onUpdate={onUpdateTextLayer}
            />
          )}

          {isImage && onReprocessImageLayer && (
            <ImageFiltersSection
              layer={selectedLayer as ImageLayer}
              onReprocessImageLayer={onReprocessImageLayer}
            />
          )}
        </Accordion>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
