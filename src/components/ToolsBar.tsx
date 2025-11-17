/**
 * ToolsBar Component - Figma-style floating toolbar
 * Shows all main tools at the bottom of the canvas
 */

import type { FC } from "react";
import { Button } from "@/components/ui/button";

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
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ),
      label: "Image",
      shortcut: "I",
    },
    {
      id: "text" as Tool,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
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
            onClick={onOpenCanvasSettings}
            title="Canvas Settings"
            className="gap-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="text-xs font-semibold">Canvas</span>
          </Button>
        )}

        {/* Printer Connection */}
        {onOpenPrinterPanel && (
          <Button
            variant="neuro-tool"
            onClick={onOpenPrinterPanel}
            title="Printer Connection"
            className="gap-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
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
