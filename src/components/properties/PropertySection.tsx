/**
 * PropertySection - Collapsible section component for properties panel
 * Based on Figma's design pattern
 */

import { useState, type FC, type ReactNode } from "react";

interface PropertySectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

const PropertySection: FC<PropertySectionProps> = ({
  title,
  defaultExpanded = true,
  children,
  icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="property-section">
      <button
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="section-title-wrapper">
          {icon && <span className="section-icon">{icon}</span>}
          <h3 className="section-title">{title}</h3>
        </div>
        <svg
          className={`chevron ${isExpanded ? "expanded" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && <div className="section-content">{children}</div>}

      <style>{`
        .property-section {
          border-bottom: 1px solid var(--color-border);
        }

        .section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .section-header:hover {
          background: rgba(167, 139, 250, 0.05);
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          display: flex;
          align-items: center;
          color: var(--color-text-muted);
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .chevron {
          transition: transform var(--transition-fast);
          color: var(--color-text-muted);
        }

        .chevron.expanded {
          transform: rotate(0deg);
        }

        .chevron:not(.expanded) {
          transform: rotate(-90deg);
        }

        .section-content {
          padding-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PropertySection;

