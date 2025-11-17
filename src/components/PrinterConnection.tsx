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
    <div className="printer-connection">
      {/* Connection Status */}
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          <span className="status-text">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {batteryLevel !== null && (
          <div className="battery-indicator">
            <Battery size={20} />
            <span>{batteryLevel}%</span>
          </div>
        )}
      </div>

      {/* Status Message */}
      <div className="status-message">
        {statusMessage}
      </div>

      {/* Action Buttons */}
      <div className="connection-actions">
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
                  <div className="spinner"></div>
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

      <style>{`
        .printer-connection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .connection-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-slate-medium);
          animation: pulse 2s infinite;
        }

        .connected .status-dot {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .disconnected .status-dot {
          background: var(--color-slate-medium);
          animation: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          font-size: 0.875rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .battery-indicator {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .status-message {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          padding: 0.5rem 0.75rem;
          background: rgba(167, 139, 250, 0.05);
          border-radius: var(--radius-sm);
          border-left: 2px solid var(--color-purple-primary);
        }


        .connection-actions {
          display: flex;
          gap: 0.5rem;
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

