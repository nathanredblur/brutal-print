/**
 * FilterPanel Component - Advanced image filter controls
 * Shown in left panel when clicking "Filters" button in context bar
 */

import type { FC } from 'react';
import type { ImageLayer } from '../types/layer';

interface FilterPanelProps {
  imageLayer: ImageLayer;
  onUpdateImageLayer: (layerId: string, updates: any) => void;
  onReprocessImageLayer: (
    layerId: string,
    newImageData: HTMLCanvasElement,
    updates: any
  ) => void;
}

const FilterPanel: FC<FilterPanelProps> = ({
  imageLayer,
  onUpdateImageLayer,
  onReprocessImageLayer,
}) => {
  const ditherMethods = [
    { id: 'threshold', name: 'Threshold', description: 'Simple black & white' },
    { id: 'steinberg', name: 'Floyd-Steinberg', description: 'Classic dithering' },
    { id: 'atkinson', name: 'Atkinson', description: 'Smooth gradients' },
    { id: 'bayer', name: 'Bayer', description: 'Ordered pattern' },
    { id: 'halftone', name: 'Halftone', description: 'Dot pattern' },
  ];

  // Helper to trigger reprocessing with updated parameters
  const reprocessWithUpdates = async (updates: any) => {
    // Import reprocessor
    const { reprocessImage } = await import('../utils/imageReprocessor');
    
    // Merge current values with updates
    const params = {
      ditherMethod: updates.ditherMethod || imageLayer.ditherMethod,
      threshold: updates.threshold !== undefined ? updates.threshold : imageLayer.threshold,
      invert: updates.invert !== undefined ? updates.invert : imageLayer.invert,
      brightness: updates.brightness !== undefined ? updates.brightness : (imageLayer.brightness ?? 128),
      contrast: updates.contrast !== undefined ? updates.contrast : (imageLayer.contrast ?? 100),
      bayerMatrixSize: imageLayer.bayerMatrixSize ?? 4,
      halftoneCellSize: imageLayer.halftoneCellSize ?? 4,
      targetWidth: imageLayer.width,
      targetHeight: imageLayer.height,
    };

    try {
      const result = await reprocessImage(
        imageLayer.originalImageData,
        params.ditherMethod as any,
        params
      );

      // Update the layer with new processed image
      onReprocessImageLayer(imageLayer.id, result.canvas, updates);
    } catch (error) {
      console.error('Failed to reprocess image:', error);
    }
  };

  const handleDitherChange = (method: string) => {
    reprocessWithUpdates({ ditherMethod: method });
  };

  const handleThresholdChange = (value: number) => {
    reprocessWithUpdates({ threshold: value });
  };

  const handleBrightnessChange = (value: number) => {
    reprocessWithUpdates({ brightness: value });
  };

  const handleContrastChange = (value: number) => {
    reprocessWithUpdates({ contrast: value });
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <label className="filter-label">Dither Method</label>
        <div className="dither-list">
          {ditherMethods.map((method) => (
            <button
              key={method.id}
              className={`dither-item ${imageLayer.ditherMethod === method.id ? 'active' : ''}`}
              onClick={() => handleDitherChange(method.id)}
            >
              <span className="dither-name">{method.name}</span>
              <span className="dither-desc">{method.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">
          Threshold
          <span className="filter-value">{imageLayer.threshold || 128}</span>
        </label>
        <input
          type="range"
          min="0"
          max="255"
          value={imageLayer.threshold || 128}
          onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
          className="filter-slider"
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">
          Brightness
          <span className="filter-value">{imageLayer.brightness || 128}</span>
        </label>
        <input
          type="range"
          min="0"
          max="255"
          value={imageLayer.brightness || 128}
          onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
          className="filter-slider"
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">
          Contrast
          <span className="filter-value">{imageLayer.contrast || 100}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={imageLayer.contrast || 100}
          onChange={(e) => handleContrastChange(parseInt(e.target.value))}
          className="filter-slider"
        />
      </div>

      <div className="filter-section">
        <button
          className="filter-toggle"
          onClick={() => reprocessWithUpdates({ invert: !imageLayer.invert })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
          </svg>
          <span>Invert Colors</span>
          <div className={`toggle-switch ${imageLayer.invert ? 'active' : ''}`}>
            <div className="toggle-handle" />
          </div>
        </button>
      </div>

      <style>{`
        .filter-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .filter-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-purple-primary);
          background: rgba(167, 139, 250, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .dither-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dither-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .dither-item:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
        }

        .dither-item.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
        }

        .dither-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dither-desc {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .filter-slider {
          width: 100%;
          height: 6px;
          background: var(--color-bg-secondary);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .filter-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-slider::-webkit-slider-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .filter-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .filter-slider::-moz-range-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-toggle:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .toggle-switch {
          margin-left: auto;
          width: 40px;
          height: 20px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          position: relative;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active {
          background: linear-gradient(135deg, var(--color-purple-dark) 0%, var(--color-blue-dark) 100%);
          border-color: var(--color-purple-primary);
        }

        .toggle-handle {
          width: 14px;
          height: 14px;
          background: var(--color-text-primary);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all var(--transition-fast);
        }

        .toggle-switch.active .toggle-handle {
          left: 22px;
        }
      `}</style>
    </div>
  );
};

export default FilterPanel;

