/**
 * Sidebar Component - Canva-style left toolbar
 * Contains all main tools and actions
 */

import type { FC } from 'react';

type Tool = 'select' | 'image' | 'text' | 'draw' | 'shape' | 'icon';

interface SidebarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTool, onToolSelect }) => {
  const tools = [
    {
      id: 'select' as Tool,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      ),
      label: 'Select',
      shortcut: 'V',
    },
    {
      id: 'image' as Tool,
      icon: (
        <svg
          width="24"
          height="24"
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
      label: 'Image',
      shortcut: 'I',
    },
    {
      id: 'text' as Tool,
      icon: (
        <svg
          width="24"
          height="24"
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
      label: 'Text',
      shortcut: 'T',
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">HERRAMIENTAS</h2>
      </div>

      <nav className="sidebar-nav">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`sidebar-tool ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <div className="sidebar-tool-icon">{tool.icon}</div>
            <span className="sidebar-tool-label">{tool.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .sidebar {
          width: 240px;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.6) 0%, rgba(12, 15, 38, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem 1rem;
        }

        .sidebar-header {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin: 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-tool {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
          text-align: left;
        }

        .sidebar-tool:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.1);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          transform: translateX(2px);
        }

        .sidebar-tool.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-color: var(--color-purple-primary);
          color: var(--color-purple-primary);
          box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
        }

        .sidebar-tool:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .sidebar-tool-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-tool-label {
          font-size: 0.875rem;
          font-weight: 600;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;

