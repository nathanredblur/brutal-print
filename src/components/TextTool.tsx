// Text tool component for adding text to canvas
import { useState, useCallback } from 'react';

interface TextToolProps {
  onAddText: (text: string, options: TextOptions) => void;
  onClose: () => void;
}

interface TextOptions {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  x: number;
  y: number;
}

const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk' },
  { value: 'IBM Plex Mono, monospace', label: 'IBM Plex Mono' },
  { value: 'Space Mono, monospace', label: 'Space Mono' },
  { value: 'Courier Prime, monospace', label: 'Courier Prime' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
];

export default function TextTool({ onAddText, onClose }: TextToolProps) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<TextOptions>({
    fontSize: 24,
    fontFamily: 'Inter, sans-serif',
    bold: false,
    italic: false,
    align: 'left',
    x: 192, // Center of 384px width
    y: 100,
  });

  const handleAddText = useCallback(() => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    onAddText(text, options);
    setText('');
  }, [text, options, onAddText]);

  const updateOption = <K extends keyof TextOptions>(
    key: K,
    value: TextOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="text-tool">
      <div className="tool-header">
        <h3>Add Text</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="tool-content">
        {/* Text Input */}
        <div className="control-group">
          <label>Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            rows={4}
            className="text-input"
          />
        </div>

        {/* Font Family */}
        <div className="control-group">
          <label>Font</label>
          <select
            value={options.fontFamily}
            onChange={(e) => updateOption('fontFamily', e.target.value)}
            className="select-input"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="control-group">
          <label>Size: {options.fontSize}px</label>
          <input
            type="range"
            min="8"
            max="72"
            value={options.fontSize}
            onChange={(e) => updateOption('fontSize', Number(e.target.value))}
            className="range-input"
          />
        </div>

        {/* Style Options */}
        <div className="control-group">
          <label>Style</label>
          <div className="style-buttons">
            <button
              className={`style-btn ${options.bold ? 'active' : ''}`}
              onClick={() => updateOption('bold', !options.bold)}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              className={`style-btn ${options.italic ? 'active' : ''}`}
              onClick={() => updateOption('italic', !options.italic)}
              title="Italic"
            >
              <em>I</em>
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="control-group">
          <label>Alignment</label>
          <div className="align-buttons">
            <button
              className={`align-btn ${options.align === 'left' ? 'active' : ''}`}
              onClick={() => updateOption('align', 'left')}
              title="Align Left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="15" y2="12"/>
                <line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
            <button
              className={`align-btn ${options.align === 'center' ? 'active' : ''}`}
              onClick={() => updateOption('align', 'center')}
              title="Align Center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="6" y1="12" x2="18" y2="12"/>
                <line x1="5" y1="18" x2="19" y2="18"/>
              </svg>
            </button>
            <button
              className={`align-btn ${options.align === 'right' ? 'active' : ''}`}
              onClick={() => updateOption('align', 'right')}
              title="Align Right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="9" y1="12" x2="21" y2="12"/>
                <line x1="6" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Position */}
        <div className="control-group">
          <label>Position</label>
          <div className="position-inputs">
            <div className="position-field">
              <span>X:</span>
              <input
                type="number"
                min="0"
                max="384"
                value={options.x}
                onChange={(e) => updateOption('x', Number(e.target.value))}
                className="number-input"
              />
            </div>
            <div className="position-field">
              <span>Y:</span>
              <input
                type="number"
                min="0"
                value={options.y}
                onChange={(e) => updateOption('y', Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-box">
          <div
            className="text-preview"
            style={{
              fontFamily: options.fontFamily,
              fontSize: `${Math.min(options.fontSize, 32)}px`,
              fontWeight: options.bold ? 'bold' : 'normal',
              fontStyle: options.italic ? 'italic' : 'normal',
              textAlign: options.align,
            }}
          >
            {text || 'Preview your text here...'}
          </div>
        </div>

        {/* Actions */}
        <div className="tool-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleAddText}>
            Add Text
          </button>
        </div>
      </div>

      <style>{`
        .text-tool {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 1rem;
        }

        .tool-header h3 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
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

        .tool-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          overflow-y: auto;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .text-input {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .text-input:focus {
          outline: none;
          border-color: var(--color-purple-primary);
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.1);
        }

        .select-input {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .range-input {
          width: 100%;
          height: 4px;
          background: var(--color-bg-secondary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .style-buttons,
        .align-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .style-btn,
        .align-btn {
          flex: 1;
          padding: 0.5rem;
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .style-btn:hover,
        .align-btn:hover {
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .style-btn.active,
        .align-btn.active {
          background: rgba(167, 139, 250, 0.2);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
        }

        .position-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .position-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .position-field span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          min-width: 20px;
        }

        .number-input {
          flex: 1;
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.375rem 0.5rem;
          font-size: 0.875rem;
        }

        .number-input:focus {
          outline: none;
          border-color: var(--color-purple-primary);
        }

        .preview-box {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 1rem;
          min-height: 80px;
        }

        .text-preview {
          color: #000000;
          word-wrap: break-word;
        }

        .tool-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .tool-actions button {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

