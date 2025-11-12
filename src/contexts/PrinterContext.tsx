/**
 * Printer Context - Shares printer state across all components
 * 
 * This solves the issue where CanvasManager and PrinterConnection
 * were using separate instances of usePrinter hook, causing state
 * to not be synchronized between them.
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePrinter, type ThermalPrinterHook } from '../hooks/usePrinter';
import { logger } from '../lib/logger';

// Create context
const PrinterContext = createContext<ThermalPrinterHook | null>(null);

// Provider component
export function PrinterProvider({ children }: { children: ReactNode }) {
  // Single instance of the printer hook
  const printerHook = usePrinter();
  
  // Log only once on mount (not on every render!)
  useEffect(() => {
    logger.info("PrinterContext", "PrinterProvider mounted", {
      isConnected: printerHook.isConnected,
      isPrinting: printerHook.isPrinting,
    });
  }, []); // Empty deps = only on mount
  
  return (
    <PrinterContext.Provider value={printerHook}>
      {children}
    </PrinterContext.Provider>
  );
}

// Hook to use the printer context
export function usePrinterContext(): ThermalPrinterHook {
  const context = useContext(PrinterContext);
  
  // During SSR, context might be null - return a safe default
  // This prevents the error during server-side rendering
  if (!context) {
    // Only log error in browser (not during SSR)
    if (typeof window !== 'undefined') {
      logger.error("PrinterContext", "usePrinterContext must be used within PrinterProvider");
    }
    
    // Return a mock printer hook for SSR
    // This will be replaced with the real one when hydrated on client
    return {
      isConnected: false,
      isPrinting: false,
      printerState: null,
      statusMessage: "Initializing...",
      ditherMethod: "steinberg",
      printIntensity: 0x5d,
      connectPrinter: async () => {},
      printCanvas: async () => {},
      getPrinterStatus: async () => null,
      disconnect: async () => {},
      setDitherMethod: () => {},
      setPrintIntensity: () => {},
    } as ThermalPrinterHook;
  }
  
  return context;
}

