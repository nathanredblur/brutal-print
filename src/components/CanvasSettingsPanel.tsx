/**
 * CanvasSettingsPanel Component - Canvas size and pages management
 * Shown in left panel when clicking "Canvas" button in sidebar
 */

import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
    <div className="flex flex-col gap-3">
      {/* Canvas Height */}
      <div className="flex flex-col gap-2">
        <label className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-400">
          Canvas Height
        </label>

        <div className="relative">
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
            px
          </span>
        </div>

        <Slider
          min={200}
          max={3000}
          step={50}
          value={[canvasHeight]}
          onValueChange={(values) => onCanvasHeightChange(values[0])}
        />
      </div>

      {/* Preset Sizes */}
      <div className="flex flex-col gap-2">
        <label className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-400">
          Preset Sizes
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESET_SIZES.map((preset) => (
            <Button
              key={preset.name}
              variant="neuro-ghost"
              className={`flex flex-col items-center gap-0.5 h-auto ${
                canvasHeight === preset.height
                  ? "bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/25"
                  : ""
              }`}
              onClick={() => onCanvasHeightChange(preset.height)}
            >
              <span className="text-[0.6875rem] font-semibold">
                {preset.name}
              </span>
              <span className="text-xs font-medium opacity-70">
                {preset.height}px
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="flex flex-col gap-2">
        <label className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-400">
          Canvas Info
        </label>
        <div className="bg-slate-800 border border-slate-700 rounded-md p-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Width:</span>
            <span className="text-xs font-semibold text-slate-200">
              384px (fixed)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Height:</span>
            <span className="text-xs font-semibold text-slate-200">
              {canvasHeight}px
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Format:</span>
            <span className="text-xs font-semibold text-slate-200">
              Thermal Receipt
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="flex gap-2 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-md text-cyan-400">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p className="text-[0.6875rem] leading-snug m-0">
          Width is fixed at 384px (48mm) for thermal printers. Adjust height as
          needed for your content.
        </p>
      </div>
    </div>
  );
};

export default CanvasSettingsPanel;
