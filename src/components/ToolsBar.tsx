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

type Tool = "image" | "text";

interface ToolsBarProps {
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  onOpenCanvasSettings?: () => void;
  onOpenPrinterPanel?: () => void;
  onOpenAbout?: () => void;
}

// Static tools configuration - no need for useMemo
const TOOLS: Array<{
  id: Tool;
  icon: ReactNode;
  label: string;
  shortcut: string;
}> = [
  {
    id: "image",
    icon: <Image size={20} />,
    label: "Image",
    shortcut: "I",
  },
  {
    id: "text",
    icon: <Type size={20} />,
    label: "Text",
    shortcut: "T",
  },
];

const ToolsBar: FC<ToolsBarProps> = ({
  activeTool,
  onToolSelect,
  onOpenCanvasSettings,
  onOpenPrinterPanel,
  onOpenAbout,
}) => {
  // Memoize tool selection handler
  const handleToolSelect = useCallback(
    (toolId: Tool) => {
      onToolSelect(toolId);
    },
    [onToolSelect]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl shadow-black/40 ring-1 ring-purple-500/10">
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={activeTool === tool.id}
              onSelect={handleToolSelect}
            />
          ))}

          <Separator orientation="vertical" className="h-12 mx-1" />

          {/* Canvas Settings */}
          {onOpenCanvasSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="neuro-tool"
                  size="xl"
                  onClick={onOpenCanvasSettings}
                  className="gap-1"
                >
                  <Layout size={20} />
                  <span className="text-xs font-semibold">Canvas</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Canvas Settings</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Printer Connection */}
          {onOpenPrinterPanel && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="neuro-tool"
                  size="xl"
                  onClick={onOpenPrinterPanel}
                  className="gap-1"
                >
                  <Printer size={20} />
                  <span className="text-xs font-semibold">Printer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect Thermal Printer</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Separator orientation="vertical" className="h-12 mx-1" />

          {/* About / Help */}
          {onOpenAbout && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="neuro-tool"
                  size="xl"
                  onClick={onOpenAbout}
                  className="gap-1"
                >
                  <Info size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>About & Keyboard Shortcuts</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

// Memoized ToolButton component to prevent re-renders
interface ToolButtonProps {
  tool: {
    id: Tool;
    icon: ReactNode;
    label: string;
    shortcut: string;
  };
  isActive: boolean;
  onSelect: (toolId: Tool) => void;
}

const ToolButton = memo<ToolButtonProps>(({ tool, isActive, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(tool.id);
  }, [tool.id, onSelect]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "neuro-tool-active" : "neuro-tool"}
          size="xl"
          onClick={handleClick}
          className="gap-1"
        >
          {tool.icon}
          <span className="text-xs font-semibold">{tool.label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <span>{tool.label}</span>
          <Kbd>{tool.shortcut}</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

ToolButton.displayName = "ToolButton";

export default memo(ToolsBar);
