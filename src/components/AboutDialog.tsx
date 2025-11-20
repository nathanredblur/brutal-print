/**
 * AboutDialog - Program information, keyboard shortcuts, and credits
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Github, Heart } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Brutal Print
          </DialogTitle>
          <p className="text-sm text-slate-400">
            1-Bit Image Editor for Thermal Printers
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">About</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Brutal Print is a specialized image editor designed for thermal
              printers. Create stunning 1-bit dithered images with professional
              editing tools, multiple dithering algorithms, and direct printing
              capabilities.
            </p>
          </section>

          <Separator />

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem label="Image Tool" shortcut="I" />
              <ShortcutItem label="Text Tool" shortcut="T" />
              <ShortcutItem label="Toggle Visibility" shortcut="H" />
              <ShortcutItem label="Toggle Lock" shortcut="L" />
              <ShortcutItem label="Delete Layer" shortcut="Del" />
              <ShortcutItem label="Copy Layer" shortcut="Ctrl+C" />
              <ShortcutItem label="Paste Layer" shortcut="Ctrl+V" />
              <ShortcutItem label="Duplicate Layer" shortcut="Ctrl+D" />
              <ShortcutItem label="Move Layer (1px)" shortcut="←↑→↓" />
              <ShortcutItem label="Move Layer (10px)" shortcut="Shift+←↑→↓" />
              <ShortcutItem label="New Canvas" shortcut="Ctrl+N" />
              <ShortcutItem label="Save Project" shortcut="Ctrl+S" />
              <ShortcutItem label="Export Image" shortcut="Ctrl+E" />
            </div>
          </section>

          <Separator />

          {/* Features */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Features
            </h3>
            <ul className="text-sm text-slate-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  Multiple dithering algorithms (Floyd-Steinberg, Atkinson,
                  Bayer, Halftone)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  Real-time image processing with brightness, contrast, and
                  threshold controls
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Layer-based editing with full transform controls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Text tool with multiple fonts and styling options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Direct printing to thermal printers via USB</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Non-destructive editing workflow</span>
              </li>
            </ul>
          </section>

          <Separator />

          {/* Credits */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Credits
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-300">Created by</p>
                <p className="text-sm text-slate-400">Nathan Redblur</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-1.5">
                  Built with
                </p>
                <div className="flex flex-wrap gap-2">
                  <TechBadge name="React" />
                  <TechBadge name="TypeScript" />
                  <TechBadge name="Fabric.js" />
                  <TechBadge name="Tailwind CSS" />
                  <TechBadge name="shadcn/ui" />
                  <TechBadge name="Zustand" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://github.com/nathanredblur/mono-experiments/tree/master/brutal-print"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <Github size={16} />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>
          </section>

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
            <span>Made with</span>
            <Heart size={12} className="text-red-400 fill-red-400" />
            <span>for the thermal printing community</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for keyboard shortcuts
function ShortcutItem({
  label,
  shortcut,
}: {
  label: string;
  shortcut: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <Kbd>{shortcut}</Kbd>
    </div>
  );
}

// Helper component for tech badges
function TechBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {name}
    </span>
  );
}
