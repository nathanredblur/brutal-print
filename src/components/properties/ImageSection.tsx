/**
 * ImageSection - Basic image information
 */

import type { FC } from "react";
import type { ImageLayer } from "../../types/layer";
import PropertySection from "./PropertySection";

interface ImageSectionProps {
  layer: ImageLayer;
}

const ImageSection: FC<ImageSectionProps> = ({ layer }) => {
  const getDitherMethodName = (method: string) => {
    const names: Record<string, string> = {
      threshold: "Threshold",
      steinberg: "Floyd-Steinberg",
      atkinson: "Atkinson",
      bayer: "Bayer Matrix",
      pattern: "Halftone",
    };
    return names[method] || method;
  };

  return (
    <PropertySection
      title="Image"
      defaultExpanded={true}
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      }
    >
      {/* Image info */}
      <div className="property-field">
        <label>Dither Method</label>
        <div className="info-display">
          {getDitherMethodName(layer.ditherMethod)}
        </div>
      </div>

      <div className="property-field">
        <label>Inverted</label>
        <div className="info-display">{layer.invert ? "Yes" : "No"}</div>
      </div>

      <p className="field-hint">
        Use "Filters" section below to adjust image processing
      </p>

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

        .info-display {
          padding: 0.5rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .field-hint {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin: 0.25rem 0 0 0;
          line-height: 1.3;
        }
      `}</style>
    </PropertySection>
  );
};

export default ImageSection;

