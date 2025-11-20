/**
 * ToolsBar Component - Figma-style floating toolbar
 * Shows all main tools at the bottom of the canvas
 */

import { memo, useCallback, type FC, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { Image, Type, Layout, Printer, Info } from "lucide-react";
import { useUIStore, ActivePanel } from "@/stores/useUIStore";

// Static tools configuration - no need for useMemo
const TOOLS: Array<{
  id: ActivePanel;
  icon: ReactNode;
  label: string;
  shortcut: string;
}> = [
  {
    id: ActivePanel.ImagePanel,
    icon: <Image size={20} />,
    label: "Image",
    shortcut: "I",
  },
  {
    id: ActivePanel.TextPanel,
    icon: <Type size={20} />,
    label: "Text",
    shortcut: "T",
  },
];

const ToolsBar: FC = () => {
  // Get UI state from store
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const setShowAboutDialog = useUIStore((state) => state.setShowAboutDialog);
  const isCanvasSettingsOpen = useUIStore((state) =>
    state.isCanvasSettingsOpen()
  );
  const isPrintSettingsOpen = useUIStore((state) =>
    state.isPrintSettingsOpen()
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center gap-2 p-2 bg-linear-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl shadow-black/40 ring-1 ring-purple-500/10">
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              shortcut={tool.shortcut}
              isActive={activePanel === tool.id}
              onClick={() => setActivePanel(tool.id)}
              tooltip={tool.label}
            />
          ))}

          <Separator orientation="vertical" className="h-12 mx-1" />

          <ToolButton
            icon={<Layout size={20} />}
            label="Canvas"
            tooltip="Canvas Settings"
            isActive={isCanvasSettingsOpen}
            onClick={() => setActivePanel(ActivePanel.CanvasSettings)}
          />

          <ToolButton
            icon={<Printer size={20} />}
            label="Printer"
            tooltip="Connect Thermal Printer"
            isActive={isPrintSettingsOpen}
            onClick={() => setActivePanel(ActivePanel.PrintSettings)}
          />

          <Separator orientation="vertical" className="h-12 mx-1" />

          <ToolButton
            icon={<Info size={20} />}
            tooltip="About & Keyboard Shortcuts"
            onClick={() => setShowAboutDialog(true)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

// Memoized ToolButton component to prevent re-renders
interface ToolButtonProps {
  icon: ReactNode;
  label?: string;
  shortcut?: string;
  tooltip?: string;
  isActive?: boolean;
  onClick: () => void;
}

const ToolButton = memo<ToolButtonProps>(
  ({ icon, label, shortcut, tooltip, isActive = false, onClick }) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "neuro-tool-active" : "neuro-tool"}
            size="xl"
            onClick={onClick}
            className="gap-1"
          >
            {icon}
            {label && <span className="text-xs font-semibold">{label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <span>{tooltip || label}</span>
            {shortcut && <Kbd>{shortcut}</Kbd>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
);

ToolButton.displayName = "ToolButton";

export default memo(ToolsBar);
