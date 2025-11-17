/**
 * FieldLabel - Reusable label for form fields
 */

interface FieldLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FieldLabel({
  children,
  htmlFor,
  className = "",
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-xs font-semibold text-slate-400 uppercase tracking-wide ${className}`}
    >
      {children}
    </label>
  );
}
