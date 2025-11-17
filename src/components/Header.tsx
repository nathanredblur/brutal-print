/**
 * Header Component - Canva-style application header
 * Contains file menu, undo/redo, and print button
 */

import { useState, type FC } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onNewCanvas: () => void;
  onSave: () => void;
  onExport: () => void;
  onPrint: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isPrinting?: boolean;
  isConnected?: boolean;
}

const Header: FC<HeaderProps> = ({
  onNewCanvas,
  onSave,
  onExport,
  onPrint,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isPrinting = false,
  isConnected = false,
}) => {
  const [showFileMenu, setShowFileMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">
          <span className="logo-icon">⚡</span>
          <h1 className="app-title">THERMAL PRINT STUDIO</h1>
        </div>

        {/* File Menu */}
        <div className="menu-container">
          <Button
            variant="neuro-ghost"
            size="sm"
            onClick={() => setShowFileMenu(!showFileMenu)}
          >
            <span>File</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </Button>

          {showFileMenu && (
            <>
              <div
                className="menu-overlay"
                onClick={() => setShowFileMenu(false)}
              />
              <div className="dropdown-menu">
                <Button
                  variant="neuro-menu"
                  className="w-full justify-between"
                  onClick={() => {
                    setShowFileMenu(false);
                    onNewCanvas();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>New</span>
                  </div>
                  <span className="text-xs text-[#94A3B8]">Ctrl+N</span>
                </Button>

                <div className="menu-divider" />

                <Button
                  variant="neuro-menu"
                  className="w-full justify-between"
                  onClick={() => {
                    setShowFileMenu(false);
                    onSave();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    <span>Save</span>
                  </div>
                  <span className="text-xs text-[#94A3B8]">Ctrl+S</span>
                </Button>

                <Button
                  variant="neuro-menu"
                  className="w-full justify-between"
                  onClick={() => {
                    setShowFileMenu(false);
                    onExport();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Export</span>
                  </div>
                  <span className="text-xs text-[#94A3B8]">Ctrl+E</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="history-controls">
          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
          </Button>

          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="header-right">
        {/* Connection status indicator */}
        {isConnected && (
          <div className="connection-status">
            <div className="status-dot" />
            <span>Printer connected</span>
          </div>
        )}

        {/* Print Button */}
        <Button
          variant="neuro"
          onClick={onPrint}
          disabled={isPrinting}
          title={isConnected ? "Print" : "Connect printer"}
        >
          {isPrinting ? (
            <>
              <svg
                className="spinner"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>Printing...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>{isConnected ? "Print" : "Connect"}</span>
            </>
          )}
        </Button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border);
          z-index: 100;
          animation: slideIn 0.3s ease-out;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .app-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .app-title {
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0;
          background: linear-gradient(135deg, var(--color-purple-primary) 0%, var(--color-blue-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .menu-container {
          position: relative;
        }

        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 240px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          z-index: 100;
          animation: slideIn 0.2s ease-out;
          overflow: hidden;
        }

        .menu-divider {
          height: 1px;
          background: var(--color-border);
          margin: 0.25rem 0;
        }

        .history-controls {
          display: flex;
          gap: 0.25rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--color-cyan);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-cyan);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
