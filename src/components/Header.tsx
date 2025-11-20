/**
 * Header Component - Canva-style application header
 * Contains file menu, undo/redo, and print button
 */

import { memo, type FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  FileText,
  Save,
  Download,
  RotateCcw,
  RotateCw,
  Printer,
  ChevronDown,
  Loader2,
  Copy,
  Clipboard,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";

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
  // Edit menu actions
  selectedLayerId?: string | null;
  copiedLayer?: any;
  onCopyLayer?: () => void;
  onPasteLayer?: () => void;
  onDuplicateLayer?: () => void;
  onMoveLayerUp?: () => void;
  onMoveLayerDown?: () => void;
  onMoveLayerToFront?: () => void;
  onMoveLayerToBack?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
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
  selectedLayerId,
  copiedLayer,
  onCopyLayer,
  onPasteLayer,
  onDuplicateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onMoveLayerToFront,
  onMoveLayerToBack,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  return (
    <header className="flex justify-between items-center px-6 py-3 bg-linear-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-md border-b border-border z-100 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <h1 className="text-lg font-bold tracking-wide m-0 bg-linear-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
            THERMAL PRINT STUDIO
          </h1>
        </div>

        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="neuro-ghost" size="sm">
              <span>File</span>
              <ChevronDown size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[240px] z-[150]">
            <DropdownMenuItem onClick={onNewCanvas}>
              <FileText size={16} />
              <span>New</span>
              <Kbd className="ml-auto">Ctrl+N</Kbd>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onSave}>
              <Save size={16} />
              <span>Save</span>
              <Kbd className="ml-auto">Ctrl+S</Kbd>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onExport}>
              <Download size={16} />
              <span>Export</span>
              <Kbd className="ml-auto">Ctrl+E</Kbd>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="neuro-ghost" size="sm">
              <span>Edit</span>
              <ChevronDown size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[240px] z-[150]">
            <DropdownMenuItem
              onClick={onCopyLayer}
              disabled={!selectedLayerId}
            >
              <Copy size={16} />
              <span>Copy Layer</span>
              <Kbd className="ml-auto">Ctrl+C</Kbd>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onPasteLayer}
              disabled={!copiedLayer}
            >
              <Clipboard size={16} />
              <span>Paste Layer</span>
              <Kbd className="ml-auto">Ctrl+V</Kbd>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDuplicateLayer}
              disabled={!selectedLayerId}
            >
              <CopyPlus size={16} />
              <span>Duplicate Layer</span>
              <Kbd className="ml-auto">Ctrl+D</Kbd>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onMoveLayerUp}
              disabled={!selectedLayerId || !canMoveUp}
            >
              <ArrowUp size={16} />
              <span>Move Up</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onMoveLayerDown}
              disabled={!selectedLayerId || !canMoveDown}
            >
              <ArrowDown size={16} />
              <span>Move Down</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onMoveLayerToFront}
              disabled={!selectedLayerId || !canMoveUp}
            >
              <ChevronsUp size={16} />
              <span>Bring to Front</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onMoveLayerToBack}
              disabled={!selectedLayerId || !canMoveDown}
            >
              <ChevronsDown size={16} />
              <span>Send to Back</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
          >
            <RotateCcw size={20} />
          </Button>

          <Button
            variant="neuro-icon"
            size="icon-sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
          >
            <RotateCw size={20} />
          </Button>
        </div>
      </div>

      <PrintSection
        isConnected={isConnected}
        isPrinting={isPrinting}
        onPrint={onPrint}
      />
    </header>
  );
};

// Separate PrintSection component to avoid re-rendering entire Header
// when isPrinting or isConnected changes
interface PrintSectionProps {
  isConnected: boolean;
  isPrinting: boolean;
  onPrint: () => void;
}

const PrintSection = memo<PrintSectionProps>(
  ({ isConnected, isPrinting, onPrint }) => {
    return (
      <div className="flex items-center gap-4">
        {/* Connection status indicator */}
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-sm text-sm text-cyan">
            <div className="w-2 h-2 bg-cyan rounded-full animate-pulse" />
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
              <Loader2 size={20} className="animate-spin" />
              <span>Printing...</span>
            </>
          ) : (
            <>
              <Printer size={20} />
              <span>{isConnected ? "Print" : "Connect"}</span>
            </>
          )}
        </Button>
      </div>
    );
  }
);

PrintSection.displayName = "PrintSection";

// Custom comparison function to prevent re-renders when only
// isPrinting or isConnected change (those only affect PrintSection)
const arePropsEqual = (
  prevProps: HeaderProps,
  nextProps: HeaderProps
): boolean => {
  // Compare all props except isPrinting and isConnected
  return (
    prevProps.onNewCanvas === nextProps.onNewCanvas &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onExport === nextProps.onExport &&
    prevProps.onPrint === nextProps.onPrint &&
    prevProps.canUndo === nextProps.canUndo &&
    prevProps.canRedo === nextProps.canRedo &&
    prevProps.onUndo === nextProps.onUndo &&
    prevProps.onRedo === nextProps.onRedo &&
    prevProps.selectedLayerId === nextProps.selectedLayerId &&
    prevProps.copiedLayer === nextProps.copiedLayer &&
    prevProps.onCopyLayer === nextProps.onCopyLayer &&
    prevProps.onPasteLayer === nextProps.onPasteLayer &&
    prevProps.onDuplicateLayer === nextProps.onDuplicateLayer &&
    prevProps.onMoveLayerUp === nextProps.onMoveLayerUp &&
    prevProps.onMoveLayerDown === nextProps.onMoveLayerDown &&
    prevProps.onMoveLayerToFront === nextProps.onMoveLayerToFront &&
    prevProps.onMoveLayerToBack === nextProps.onMoveLayerToBack &&
    prevProps.canMoveUp === nextProps.canMoveUp &&
    prevProps.canMoveDown === nextProps.canMoveDown
    // Intentionally ignore isPrinting and isConnected
    // as they only affect PrintSection which is memoized separately
  );
};

export default memo(Header, arePropsEqual);
