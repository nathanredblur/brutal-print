/**
 * FieldGroup - Reusable field group with label
 */

import { FieldLabel } from "./field-label";
import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FieldGroup({
  label,
  children,
  htmlFor,
  className = "",
}: FieldGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  );
}
