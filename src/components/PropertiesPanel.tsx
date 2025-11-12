/**
 * PropertiesPanel Component
 * 
 * Displays editable properties for the selected layer
 * Supports text editing, image filters, and canvas settings
 */

import { useState, useEffect } from 'react';
import type { Layer, TextLayer, ImageLayer } from '../types/layer';
import { reprocessImage } from '../utils/imageReprocessor';
import type { DitherMethod } from '../lib/dithering';

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  canvasHeight: number;
  onUpdateTextLayer: (layerId: string, updates: Partial<TextLayer>) => void;
  onUpdateImageLayer: (layerId: string, updates: Partial<ImageLayer>) => void;
  onReprocessImageLayer: (layerId: string, newDitherMethod: string, newImageData: HTMLCanvasElement) => void;
  onCanvasHeightChange: (height: number) => void;
}

export default function PropertiesPanel({
  selectedLayer,
  canvasHeight,
  onUpdateTextLayer,
  onUpdateImageLayer,
  onReprocessImageLayer,
  onCanvasHeightChange,
}: PropertiesPanelProps) {
  // Local state for form inputs
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const [ditherMethod, setDitherMethod] = useState('steinberg');
  const [localCanvasHeight, setLocalCanvasHeight] = useState(canvasHeight);
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Update local state when selected layer changes
  useEffect(() => {
    if (selectedLayer?.type === 'text') {
      const textLayer = selectedLayer as TextLayer;
      setText(textLayer.text);
      setFontSize(textLayer.fontSize);
      setFontFamily(textLayer.fontFamily);
      setBold(textLayer.bold);
      setItalic(textLayer.italic);
      setAlign(textLayer.align);
    } else if (selectedLayer?.type === 'image') {
      const imageLayer = selectedLayer as ImageLayer;
      setDitherMethod(imageLayer.ditherMethod || 'steinberg');
    }
  }, [selectedLayer]);

  // Update local canvas height when prop changes
  useEffect(() => {
    setLocalCanvasHeight(canvasHeight);
  }, [canvasHeight]);

  // Handle text updates
  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { text: newText });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { fontSize: newSize });
    }
  };

  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { fontFamily: newFamily });
    }
  };

  const handleBoldToggle = () => {
    const newBold = !bold;
    setBold(newBold);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { bold: newBold });
    }
  };

  const handleItalicToggle = () => {
    const newItalic = !italic;
    setItalic(newItalic);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { italic: newItalic });
    }
  };

  const handleAlignChange = (newAlign: 'left' | 'center' | 'right') => {
    setAlign(newAlign);
    if (selectedLayer?.type === 'text') {
      onUpdateTextLayer(selectedLayer.id, { align: newAlign });
    }
  };

  const handleDitherMethodChange = async (method: string) => {
    if (selectedLayer?.type !== 'image') return;
    
    const imageLayer = selectedLayer as ImageLayer;
    setDitherMethod(method);
    setIsReprocessing(true);

    try {
      // Reprocess image with new dither method
      const newImageData = await reprocessImage(
        imageLayer.originalImageData,
        method as DitherMethod
      );

      // Update layer with new processed image
      onReprocessImageLayer(selectedLayer.id, method, newImageData);
    } catch (error) {
      console.error('Failed to reprocess image:', error);
      alert('Failed to reprocess image. Please try again.');
      // Revert to previous method
      setDitherMethod(imageLayer.ditherMethod);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleCanvasHeightChange = (height: number) => {
    setLocalCanvasHeight(height);
    onCanvasHeightChange(height);
  };

  return (
    <div className="properties-panel">
      <h3 className="panel-title">Properties</h3>

      {/* Canvas Settings - Always visible */}
      <div className="property-section">
        <h4 className="section-subtitle">Canvas</h4>
        
        <div className="property-group">
          <label className="property-label">Height (px)</label>
          <input
            type="number"
            className="property-input"
            value={localCanvasHeight}
            onChange={(e) => handleCanvasHeightChange(Number(e.target.value))}
            min={400}
            max={2000}
            step={100}
          />
        </div>

        <div className="property-info">
          <span className="info-label">Width:</span>
          <span className="info-value">384px (fixed)</span>
        </div>
      </div>

      {/* Layer Properties - Only when layer is selected */}
      {selectedLayer ? (
        <>
          <div className="property-section">
            <h4 className="section-subtitle">
              {selectedLayer.type === 'text' ? 'Text Layer' : 'Image Layer'}
            </h4>

            {/* Common properties */}
            <div className="property-group">
              <label className="property-label">Layer Name</label>
              <div className="property-value">{selectedLayer.name}</div>
            </div>

            <div className="property-group">
              <label className="property-label">Position</label>
              <div className="property-value">
                X: {Math.round(selectedLayer.x)}px, Y: {Math.round(selectedLayer.y)}px
              </div>
            </div>

            <div className="property-group">
              <label className="property-label">Size</label>
              <div className="property-value">
                {Math.round(selectedLayer.width)} × {Math.round(selectedLayer.height)}px
              </div>
            </div>

            <div className="property-group">
              <label className="property-label">Rotation</label>
              <div className="property-value">{Math.round(selectedLayer.rotation)}°</div>
            </div>
          </div>

          {/* Text-specific properties */}
          {selectedLayer.type === 'text' && (
            <div className="property-section">
              <h4 className="section-subtitle">Text Content</h4>

              <div className="property-group">
                <label className="property-label">Text</label>
                <textarea
                  className="property-textarea"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={3}
                  placeholder="Enter text..."
                />
              </div>

              <div className="property-group">
                <label className="property-label">Font Size</label>
                <input
                  type="number"
                  className="property-input"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  min={8}
                  max={200}
                />
              </div>

              <div className="property-group">
                <label className="property-label">Font Family</label>
                <select
                  className="property-select"
                  value={fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

              <div className="property-group">
                <label className="property-label">Style</label>
                <div className="button-group">
                  <button
                    className={`style-btn ${bold ? 'active' : ''}`}
                    onClick={handleBoldToggle}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    className={`style-btn ${italic ? 'active' : ''}`}
                    onClick={handleItalicToggle}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                </div>
              </div>

              <div className="property-group">
                <label className="property-label">Align</label>
                <div className="button-group">
                  <button
                    className={`align-btn ${align === 'left' ? 'active' : ''}`}
                    onClick={() => handleAlignChange('left')}
                    title="Left"
                  >
                    ⬅
                  </button>
                  <button
                    className={`align-btn ${align === 'center' ? 'active' : ''}`}
                    onClick={() => handleAlignChange('center')}
                    title="Center"
                  >
                    ↔
                  </button>
                  <button
                    className={`align-btn ${align === 'right' ? 'active' : ''}`}
                    onClick={() => handleAlignChange('right')}
                    title="Right"
                  >
                    ➡
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image-specific properties */}
          {selectedLayer.type === 'image' && (
            <div className="property-section">
              <h4 className="section-subtitle">Image Processing</h4>

              <div className="property-group">
                <label className="property-label">Dither Method</label>
                <select
                  className="property-select"
                  value={ditherMethod}
                  onChange={(e) => handleDitherMethodChange(e.target.value)}
                  disabled={isReprocessing}
                >
                  <option value="steinberg">Floyd-Steinberg</option>
                  <option value="atkinson">Atkinson</option>
                  <option value="bayer">Ordered (Bayer)</option>
                  <option value="pattern">Halftone Pattern</option>
                  <option value="threshold">Threshold</option>
                </select>
              </div>

              {isReprocessing && (
                <div className="property-info processing">
                  <p className="info-text">
                    ⏳ Reprocessing image with new dither method...
                  </p>
                </div>
              )}

              <div className="property-info">
                <p className="info-text">
                  ℹ️ Changes apply instantly. Original image quality is preserved.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-selection">
          <p>Select a layer to view and edit its properties</p>
        </div>
      )}

      <style>{`
        .properties-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
        }

        .property-section {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
        }

        .section-subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-purple-primary);
          margin: 0 0 0.75rem 0;
        }

        .property-group {
          margin-bottom: 0.75rem;
        }

        .property-group:last-child {
          margin-bottom: 0;
        }

        .property-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-muted);
          margin-bottom: 0.25rem;
        }

        .property-value {
          font-size: 0.875rem;
          color: var(--color-text-primary);
          padding: 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-sm);
        }

        .property-input,
        .property-select,
        .property-textarea {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.875rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          transition: all var(--transition-fast);
        }

        .property-input:focus,
        .property-select:focus,
        .property-textarea:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }

        .property-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .style-btn,
        .align-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.875rem;
          background: rgba(15, 23, 42, 0.8);
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

        .property-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: var(--radius-sm);
        }

        .property-info.processing {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .info-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .info-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .info-text {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .no-selection {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

