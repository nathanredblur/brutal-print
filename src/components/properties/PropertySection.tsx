/**
 * PropertySection - Collapsible section component for properties panel
 * Using shadcn/ui Accordion with Tailwind CSS styling
 */

import type { FC, ReactNode } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface PropertySectionProps {
  title: string;
  value: string; // Unique value for accordion item
  children: ReactNode;
  icon?: ReactNode;
}

const PropertySection: FC<PropertySectionProps> = ({
  title,
  value,
  children,
  icon,
}) => {
  return (
    <AccordionItem
      value={value}
      className="border-b border-border last:border-b-0"
    >
      <AccordionTrigger
        className={cn(
          "flex items-center px-4 py-3 font-normal no-underline hover:no-underline",
          "transition-colors hover:bg-purple-500/5"
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          {icon && (
            <span className="flex items-center text-muted-foreground">
              {icon}
            </span>
          )}
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-foreground m-0">
            {title}
          </h3>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 flex flex-col gap-3">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default PropertySection;
