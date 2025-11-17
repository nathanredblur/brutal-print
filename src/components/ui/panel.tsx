/**
 * Panel Components - Reusable panel containers and headers
 */

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface PanelCardProps {
  children: ReactNode;
  className?: string;
}

export function PanelCard({ children, className = "" }: PanelCardProps) {
  return (
    <div
      className={`bg-slate-800/50 border border-slate-700 rounded-md p-3 ${className}`}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  title: string;
  onClose?: () => void;
  className?: string;
}

export function PanelHeader({
  title,
  onClose,
  className = "",
}: PanelHeaderProps) {
  return (
    <div className={`flex justify-between items-center mb-3 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
        {title}
      </h3>
      {onClose && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

interface PanelProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  onClose,
  children,
  className = "",
}: PanelProps) {
  return (
    <PanelCard className={className}>
      <PanelHeader title={title} onClose={onClose} />
      {children}
    </PanelCard>
  );
}
