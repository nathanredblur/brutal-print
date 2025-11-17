/**
 * PropertySection - Collapsible section component for properties panel
 * Based on Figma's design pattern
 */

import { useState, type FC, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
      <Button
        variant="ghost"
        className="section-header w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="section-title-wrapper">
          {icon && <span className="section-icon">{icon}</span>}
          <h3 className="section-title">{title}</h3>
        </div>
        <ChevronDown
          className={`chevron ${isExpanded ? "expanded" : ""}`}
          size={12}
        />
      </Button>

      {isExpanded && <div className="section-content">{children}</div>}

      <style>{`
        .property-section {
          border-bottom: 1px solid var(--color-border);
        }

        .section-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          height: auto;
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
          flex-shrink: 0;
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
