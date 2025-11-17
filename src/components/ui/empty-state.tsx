/**
 * EmptyState - Reusable empty state component
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  iconSize?: number;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  iconSize = 48,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 py-8 px-4 text-slate-400 text-center ${className}`}
    >
      <Icon size={iconSize} className="opacity-30" />
      <p className="text-xs font-semibold m-0 text-slate-400">{title}</p>
      {description && (
        <span className="text-[0.6875rem] text-slate-500">{description}</span>
      )}
    </div>
  );
}
