// Printer connection component with status display
import { usePrinterContext } from '../contexts/PrinterContext';
import { logger } from '../lib/logger';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Battery, Printer } from 'lucide-react';

interface PrinterConnectionProps {
  onPrint?: () => void;
}

export default function PrinterConnection({ onPrint }: PrinterConnectionProps) {
  // Use shared printer context instead of separate hook instance
  const {
    isConnected,
    isPrinting,
    printerState,
    statusMessage,
    connectPrinter,
    disconnect,
  } = usePrinterContext();
  
  const batteryLevel = printerState?.batteryLevel || null;
  
  // Log state changes (only when they actually change)
  useEffect(() => {
    logger.info("PrinterConnection", "Component state updated", {
      isConnected,
      isPrinting,
      statusMessage,
      batteryLevel,
      source: "usePrinterContext (shared)"
    });
  }, [isConnected, isPrinting, statusMessage, batteryLevel]);

  const handleConnect = async () => {
    logger.separator("PRINTER CONNECTION UI");
    logger.info("PrinterConnection", "Connect button clicked");
    
    try {
      logger.info("PrinterConnection", "Calling connectPrinter()...");
      await connectPrinter();
      logger.success("PrinterConnection", "connectPrinter() completed successfully");
    } catch (err) {
      logger.error("PrinterConnection", "Connection error", err);
    }
  };

  const handleDisconnect = async () => {
    logger.info("PrinterConnection", "Disconnect button clicked");
    
    try {
      await disconnect();
      logger.success("PrinterConnection", "Disconnected successfully");
    } catch (err) {
      logger.error("PrinterConnection", "Disconnect error", err);
    }
  };

  const handlePrint = () => {
    logger.info("PrinterConnection", "Print button clicked", {
      isConnected,
      isPrinting,
      hasOnPrintCallback: !!onPrint,
    });
    
    if (onPrint) {
      logger.info("PrinterConnection", "Calling onPrint callback");
      onPrint();
    } else {
      logger.warn("PrinterConnection", "No onPrint callback provided");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Connection Status */}
      <div className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`
            w-2 h-2 rounded-full 
            ${isConnected 
              ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
              : 'bg-slate-500'
            }
          `} />
          <span className="text-sm text-slate-200 font-semibold">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {batteryLevel !== null && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Battery size={20} />
            <span>{batteryLevel}%</span>
          </div>
        )}
      </div>

      {/* Status Message */}
      <div className="text-xs text-slate-400 px-3 py-2 bg-purple-500/5 rounded-md border-l-2 border-purple-500">
        {statusMessage}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isConnected ? (
          <Button 
            variant="neuro"
            className="w-full"
            onClick={handleConnect}
            disabled={isPrinting}
          >
            <Printer size={16} />
            Connect Printer
          </Button>
        ) : (
          <>
            <Button
              variant="neuro-ghost"
              className="flex-1"
              onClick={handleDisconnect}
              disabled={isPrinting}
            >
              Disconnect
            </Button>
            <Button
              variant="neuro"
              className="flex-1"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Printing...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  Print
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

