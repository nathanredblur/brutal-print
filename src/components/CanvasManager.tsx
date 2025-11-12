// Main canvas manager with all tools integrated
import { useState, useRef, useEffect, useCallback } from "react";
import { usePrinterContext } from "../contexts/PrinterContext";
import ImageUploader from "./ImageUploader";
import PrinterConnection from "./PrinterConnection";
import TextTool from "./TextTool";
import { PRINTER_WIDTH } from "../lib/dithering";
import { logger } from "../lib/logger";

type Tool = "select" | "image" | "text" | "draw" | "shape" | "icon";

export default function CanvasManager() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  
  // Use shared printer context instead of separate hook instance
  const { printCanvas, isConnected, isPrinting } = usePrinterContext();
  
  // Log printer state changes (only when they actually change)
  useEffect(() => {
    logger.logState("CanvasManager", "Printer connection state", {
      isConnected,
      isPrinting,
      source: "usePrinterContext (shared)"
    });
  }, [isConnected, isPrinting]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = PRINTER_WIDTH;
    canvas.height = 800;

    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add welcome text
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ THERMAL", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText("PRINT STUDIO", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(
      "384px × Variable Height",
      canvas.width / 2,
      canvas.height / 2 + 30
    );
    ctx.fillText("1-bit Monochrome", canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText(
      "Upload an image to start",
      canvas.width / 2,
      canvas.height / 2 + 80
    );

    // Draw border
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const handleImageProcessed = useCallback(
    (canvas: HTMLCanvasElement, binaryData: boolean[][]) => {
      const mainCanvas = canvasRef.current;
      if (!mainCanvas) return;

      const ctx = mainCanvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      // Draw processed image
      ctx.drawImage(canvas, 0, 0);

      setShowImageUploader(false);
    },
    []
  );

  const handlePrint = useCallback(async () => {
    logger.separator("HANDLE PRINT");
    logger.info("CanvasManager", "handlePrint() called");
    
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error("CanvasManager", "Canvas not available");
      alert("Canvas not available");
      return;
    }
    
    logger.debug("CanvasManager", "Canvas exists", {
      width: canvas.width,
      height: canvas.height,
    });

    logger.info("CanvasManager", "Checking connection status", { 
      isConnected,
      isPrinting
    });
    
    if (!isConnected) {
      logger.error("CanvasManager", "Printer not connected! isConnected = false");
      logger.warn("CanvasManager", "This is the bug - printer should be connected but isConnected is false");
      alert("Please connect to printer first");
      return;
    }

    try {
      const printOptions = {
        dither: "steinberg" as const,
        brightness: 128,
        intensity: 93,
      };
      
      logger.info("CanvasManager", "Calling printCanvas()", printOptions);
      
      // Print the canvas directly using the official method
      await printCanvas(canvas, printOptions);
      
      logger.success("CanvasManager", "Print completed!");
      alert("Print completed successfully!");
    } catch (error) {
      logger.error("CanvasManager", "Print failed", error);
      alert("Print failed: " + (error as Error).message);
    }
  }, [isConnected, isPrinting, printCanvas]);

  const handleToolSelect = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (tool === "image") {
      setShowImageUploader(true);
      setShowTextTool(false);
    } else if (tool === "text") {
      setShowTextTool(true);
      setShowImageUploader(false);
    }
  }, []);

  const handleAddText = useCallback((text: string, options: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply text style
    ctx.fillStyle = "#000000";
    ctx.font = `${options.italic ? "italic " : ""}${
      options.bold ? "bold " : ""
    }${options.fontSize}px ${options.fontFamily}`;
    ctx.textAlign = options.align;

    // Draw text
    const lines = text.split("\n");
    const lineHeight = options.fontSize * 1.2;

    lines.forEach((line, index) => {
      ctx.fillText(line, options.x, options.y + index * lineHeight);
    });

    setShowTextTool(false);
  }, []);

  return (
    <div className="canvas-manager">
      {/* Toolbar */}
      <div className="toolbar-section">
        <h3 className="section-title">TOOLS</h3>

        <button
          className={`tool-btn ${activeTool === "select" ? "active" : ""}`}
          onClick={() => handleToolSelect("select")}
          title="Select (V)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
        </button>

        <button
          className={`tool-btn ${activeTool === "image" ? "active" : ""}`}
          onClick={() => handleToolSelect("image")}
          title="Image (I)"
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
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <button
          className={`tool-btn ${activeTool === "text" ? "active" : ""}`}
          onClick={() => handleToolSelect("text")}
          title="Text (T)"
        >
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
        </button>
      </div>

      {/* Canvas */}
      <div className="canvas-section">
        <canvas ref={canvasRef} className="main-canvas" />
      </div>

      {/* Sidebar */}
      <div className="sidebar-section">
        {/* Image Uploader (conditionally shown) */}
        {showImageUploader && (
          <div className="panel">
            <div className="panel-header">
              <h3>Image Upload</h3>
              <button
                className="close-btn"
                onClick={() => setShowImageUploader(false)}
              >
                ×
              </button>
            </div>
            <ImageUploader onImageProcessed={handleImageProcessed} />
          </div>
        )}

        {/* Text Tool (conditionally shown) */}
        {showTextTool && (
          <div className="panel">
            <TextTool
              onAddText={handleAddText}
              onClose={() => setShowTextTool(false)}
            />
          </div>
        )}

        {/* Printer Connection */}
        <div className="panel">
          <h3 className="panel-title">Printer</h3>
          <PrinterConnection onPrint={handlePrint} />
        </div>

        {/* Info Panel */}
        <div className="panel info-panel">
          <h3 className="panel-title">Canvas Info</h3>
          <div className="info-item">
            <span className="info-label">Width:</span>
            <span className="info-value">384px</span>
          </div>
          <div className="info-item">
            <span className="info-label">Height:</span>
            <span className="info-value">800px</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mode:</span>
            <span className="info-value">1-bit B&W</span>
          </div>
        </div>
      </div>

      <style>{`
        .canvas-manager {
          display: grid;
          grid-template-columns: 80px 1fr 400px;
          gap: 0;
          height: 100%;
          overflow: hidden;
        }

        .toolbar-section {
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--color-border);
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .tool-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .tool-btn:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          transform: translateY(-1px);
        }

        .tool-btn.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
        }

        .tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .canvas-section {
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: 2rem;
        }

        .main-canvas {
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--color-border);
          border-radius: var(--radius-sm);
          image-rendering: pixelated;
        }

        .sidebar-section {
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-left: 1px solid var(--color-border);
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .panel-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
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

        .info-panel {
          margin-top: auto;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--color-border);
        }

        .info-item:last-child {
          border-bottom: none;
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
      `}</style>
    </div>
  );
}
