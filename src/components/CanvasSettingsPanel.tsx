/**
 * CanvasSettingsPanel Component - Canvas size and pages management
 * Shown in left panel when clicking "Canvas" button in sidebar
 */

import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface CanvasSettingsPanelProps {
  canvasHeight: number;
  onCanvasHeightChange: (height: number) => void;
}

// Static preset sizes - no need to recreate on each render
const PRESET_SIZES = [
  { name: "Small Receipt", height: 400 },
  { name: "Medium Receipt", height: 800 },
  { name: "Large Receipt", height: 1200 },
  { name: "Extra Large", height: 1600 },
] as const;

const CanvasSettingsPanel: FC<CanvasSettingsPanelProps> = ({
  canvasHeight,
  onCanvasHeightChange,
}) => {
  return (
    <div className="canvas-settings-panel">
      <div className="settings-section">
        <label className="settings-label">Canvas Height</label>
        <div className="height-input-group">
          <Input
            type="number"
            value={canvasHeight}
            onChange={(e) =>
              onCanvasHeightChange(parseInt(e.target.value) || 400)
            }
            className="pr-12"
            min="200"
            max="3000"
            step="50"
          />
          <span className="input-unit">px</span>
        </div>

        <input
          type="range"
          min="200"
          max="3000"
          step="50"
          value={canvasHeight}
          onChange={(e) => onCanvasHeightChange(parseInt(e.target.value))}
          className="height-slider"
        />
      </div>

      <div className="settings-section">
        <label className="settings-label">Preset Sizes</label>
        <div className="preset-grid">
          {PRESET_SIZES.map((preset) => (
            <Button
              key={preset.name}
              variant="neuro-ghost"
              className={`preset-btn ${
                canvasHeight === preset.height ? "active" : ""
              }`}
              onClick={() => onCanvasHeightChange(preset.height)}
            >
              <span className="preset-name">{preset.name}</span>
              <span className="preset-size">{preset.height}px</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <label className="settings-label">Canvas Info</label>
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">Width:</span>
            <span className="info-value">384px (fixed)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Height:</span>
            <span className="info-value">{canvasHeight}px</span>
          </div>
          <div className="info-row">
            <span className="info-label">Format:</span>
            <span className="info-value">Thermal Receipt</span>
          </div>
        </div>
      </div>

      <div className="settings-note">
        <Info size={16} />
        <p>
          Width is fixed at 384px (48mm) for thermal printers. Adjust height as
          needed for your content.
        </p>
      </div>

      <style>{`
        .canvas-settings-panel {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .height-input-group {
          position: relative;
        }

        .input-unit {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .height-slider {
          width: 100%;
          height: 4px;
          background: var(--color-bg-secondary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .height-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .height-slider::-webkit-slider-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .height-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--color-purple-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .height-slider::-moz-range-thumb:hover {
          background: var(--color-purple-accent);
          box-shadow: var(--glow-purple);
        }

        .preset-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.375rem;
        }

        .preset-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
          height: auto;
        }

        .preset-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.25);
        }

        .preset-name {
          font-size: 0.6875rem;
          font-weight: 600;
        }

        .preset-size {
          font-size: 0.75rem;
          font-weight: 500;
          opacity: 0.7;
        }

        .info-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .settings-note {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: var(--radius-sm);
          color: var(--color-cyan);
        }

        .settings-note svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
          width: 14px;
          height: 14px;
        }

        .settings-note p {
          font-size: 0.6875rem;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default CanvasSettingsPanel;
