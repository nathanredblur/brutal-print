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
      <aside className="properties-panel">
        <div className="properties-header">
          <h2 className="properties-title">Canvas</h2>
        </div>

        <div className="properties-content">
          <div className="property-section">
            <h3 className="section-title">Canvas Settings</h3>
            <p className="section-description">
              Click on the Canvas button in the left panel to adjust canvas
              size.
            </p>
          </div>
        </div>

        <style>{getStyles()}</style>
      </aside>
    );
  }

  // Don't show anything if nothing is selected
  if (!selectedLayer) {
    return (
      <aside className="properties-panel">
        <div className="properties-header">
          <h2 className="properties-title">Properties</h2>
        </div>

        <div className="properties-content">
          <div className="empty-state">
            <Info size={48} />
            <p>Select an element to see its properties</p>
          </div>
        </div>

        <style>{getStyles()}</style>
      </aside>
    );
  }

  const isText = selectedLayer.type === "text";
  const isImage = selectedLayer.type === "image";

  return (
    <aside className="properties-panel">
      <div className="properties-header">
        <h2 className="properties-title">{selectedLayer.name}</h2>
        <span className="layer-type-badge">{selectedLayer.type}</span>
      </div>

      <div className="properties-content">
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
      </div>

      <style>{getStyles()}</style>
    </aside>
  );
};

// Shared styles for the properties panel
const getStyles = () => `
  .properties-panel {
    width: 280px;
    background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
    backdrop-filter: blur(10px);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .properties-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .properties-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layer-type-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    background: rgba(167, 139, 250, 0.2);
    color: var(--color-purple-primary);
    border-radius: var(--radius-sm);
    text-transform: uppercase;
  }

  .properties-content {
    flex: 1;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem 1rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .empty-state svg {
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 0.875rem;
    margin: 0;
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
`;

export default PropertiesPanel;
