/**
 * ToolsBar Component - Figma-style floating toolbar
 * Shows all main tools at the bottom of the canvas
 */

import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Image, Type, Layout, Printer } from "lucide-react";

type Tool = "image" | "text";

interface ToolsBarProps {
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  onOpenCanvasSettings?: () => void;
  onOpenPrinterPanel?: () => void;
}

const ToolsBar: FC<ToolsBarProps> = ({
  activeTool,
  onToolSelect,
  onOpenCanvasSettings,
  onOpenPrinterPanel,
}) => {
  const tools = [
    {
      id: "image" as Tool,
      icon: <Image size={20} />,
      label: "Image",
      shortcut: "I",
    },
    {
      id: "text" as Tool,
      icon: <Type size={20} />,
      label: "Text",
      shortcut: "T",
    },
  ];

  return (
    <div className="tools-bar">
      <div className="tools-bar-content">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={
              activeTool === tool.id ? "neuro-tool-active" : "neuro-tool"
            }
            size="xl"
            onClick={() => onToolSelect(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className="gap-1"
          >
            {tool.icon}
            <span className="text-xs font-semibold">{tool.label}</span>
          </Button>
        ))}

        <div className="separator" />

        {/* Canvas Settings */}
        {onOpenCanvasSettings && (
          <Button
            variant="neuro-tool"
            size="xl"
            onClick={onOpenCanvasSettings}
            title="Canvas Settings"
            className="gap-1"
          >
            <Layout size={20} />
            <span className="text-xs font-semibold">Canvas</span>
          </Button>
        )}

        {/* Printer Connection */}
        {onOpenPrinterPanel && (
          <Button
            variant="neuro-tool"
            size="xl"
            onClick={onOpenPrinterPanel}
            title="Printer Connection"
            className="gap-1"
          >
            <Printer size={20} />
            <span className="text-xs font-semibold">Printer</span>
          </Button>
        )}
      </div>

      <style>{`
        .tools-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          animation: slideUp 0.3s ease-out;
        }

        .tools-bar-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.95) 0%, rgba(12, 15, 38, 0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(167, 139, 250, 0.1);
        }

        .separator {
          width: 1px;
          height: 48px;
          background: var(--color-border);
          margin: 0 0.25rem;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ToolsBar;
