/**
 * React hook for MXW01 Thermal Printer
 * Based on official example: https://github.com/clementvp/mxw01-thermal-printer/blob/main/examples/react-hook.tsx
 */

import { useEffect, useRef, useCallback, useReducer } from "react";
import { 
  ThermalPrinterClient,
  WebBluetoothAdapter,
  type PrinterState,
  type DitherMethod
} from "mxw01-thermal-printer";
import { logger } from "../lib/logger";

/**
 * Hook state interface
 */
interface HookState {
  isConnected: boolean;
  isPrinting: boolean;
  printerState: PrinterState | null;
  statusMessage: string;
  ditherMethod: DitherMethod;
  printIntensity: number;
}

/**
 * Hook state actions
 */
type HookAction =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_PRINTING"; payload: boolean }
  | { type: "SET_PRINTER_STATE"; payload: PrinterState | null }
  | { type: "SET_STATUS"; payload: string }
  | { type: "SET_DITHER"; payload: DitherMethod }
  | { type: "SET_INTENSITY"; payload: number }
  | { type: "SYNC_CLIENT"; payload: Partial<HookState> };

/**
 * State reducer
 */
function hookReducer(state: HookState, action: HookAction): HookState {
  // Don't log SYNC_CLIENT actions (too noisy, happens every 100ms)
  if (action.type !== "SYNC_CLIENT") {
    logger.debug("usePrinter", `Reducer: ${action.type}`, { 
      before: state, 
      payload: (action as any).payload 
    });
  }
  
  switch (action.type) {
    case "SET_CONNECTED":
      logger.logState("usePrinter", "isConnected", action.payload);
      return { ...state, isConnected: action.payload };
    case "SET_PRINTING":
      logger.logState("usePrinter", "isPrinting", action.payload);
      return { ...state, isPrinting: action.payload };
    case "SET_PRINTER_STATE":
      logger.logState("usePrinter", "printerState", action.payload);
      return { ...state, printerState: action.payload };
    case "SET_STATUS":
      logger.logState("usePrinter", "statusMessage", action.payload);
      return { ...state, statusMessage: action.payload };
    case "SET_DITHER":
      return { ...state, ditherMethod: action.payload };
    case "SET_INTENSITY":
      return { ...state, printIntensity: action.payload };
    case "SYNC_CLIENT":
      // Silently sync state without logging (too noisy)
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

/**
 * Initial state
 */
const initialState: HookState = {
  isConnected: false,
  isPrinting: false,
  printerState: null,
  statusMessage: "Ready to connect printer",
  ditherMethod: "steinberg",
  printIntensity: 0x5d, // 93 decimal
};

export interface ThermalPrinterHook {
  isConnected: boolean;
  isPrinting: boolean;
  printerState: PrinterState | null;
  statusMessage: string;
  ditherMethod: DitherMethod;
  printIntensity: number;
  connectPrinter: () => Promise<void>;
  printCanvas: (
    canvas: HTMLCanvasElement,
    options?: Partial<{
      dither: DitherMethod;
      brightness: number;
      intensity: number;
    }>
  ) => Promise<void>;
  getPrinterStatus: () => Promise<PrinterState | null>;
  disconnect: () => Promise<void>;
  setDitherMethod: (method: DitherMethod) => void;
  setPrintIntensity: (intensity: number) => void;
}

/**
 * React hook for thermal printer
 * Optimized with useReducer and single useEffect
 */
export function usePrinter(): ThermalPrinterHook {
  const clientRef = useRef<ThermalPrinterClient | null>(null);
  const [state, dispatch] = useReducer(hookReducer, initialState);

  // Initialize client and setup event listeners
  useEffect(() => {
    logger.separator("PRINTER HOOK INITIALIZATION");
    logger.info("usePrinter", "Initializing thermal printer client");
    
    try {
      const adapter = new WebBluetoothAdapter();
      const client = new ThermalPrinterClient(adapter);
      clientRef.current = client;
      
      logger.success("usePrinter", "Client created successfully", {
        adapter: "WebBluetoothAdapter",
        client: "ThermalPrinterClient"
      });

      // Subscribe to all client events
      const unsubscribeConnected = client.on("connected", (event) => {
        logger.separator("PRINTER CONNECTED");
        logger.success("usePrinter", "Printer connected event fired", { event });
        logger.info("usePrinter", "Dispatching SET_CONNECTED: true");
        dispatch({ type: "SET_CONNECTED", payload: true });
      });

      const unsubscribeDisconnected = client.on("disconnected", () => {
        logger.separator("PRINTER DISCONNECTED");
        logger.warn("usePrinter", "Printer disconnected event fired");
        logger.info("usePrinter", "Dispatching SET_CONNECTED: false");
        dispatch({ type: "SET_CONNECTED", payload: false });
        dispatch({ type: "SET_PRINTER_STATE", payload: null });
      });

      const unsubscribeStateChange = client.on("stateChange", (event) => {
        logger.logEvent("usePrinter", "stateChange", event.state);
        dispatch({ type: "SET_PRINTER_STATE", payload: event.state });
      });

      const unsubscribeError = client.on("error", (event) => {
        logger.error("usePrinter", "Printer error event", event.error);
      });

      // Sync state from client periodically
      const syncInterval = setInterval(() => {
        const syncData = {
          statusMessage: client.statusMessage,
          isPrinting: client.isPrinting,
        };
        
        // Silently sync state (no logs, would be too noisy at 10/sec)
        dispatch({
          type: "SYNC_CLIENT",
          payload: syncData,
        });
      }, 100);

      logger.info("usePrinter", "Event listeners registered, sync interval started");

      // Cleanup on unmount
      return () => {
        logger.info("usePrinter", "Cleaning up printer hook");
        unsubscribeConnected();
        unsubscribeDisconnected();
        unsubscribeStateChange();
        unsubscribeError();
        clearInterval(syncInterval);
        client.dispose();
        logger.success("usePrinter", "Cleanup complete");
      };
    } catch (error) {
      logger.error("usePrinter", "Failed to initialize printer client", error);
      dispatch({
        type: "SET_STATUS",
        payload: `Initialization error: ${(error as Error).message}`,
      });
    }
  }, []);

  const connectPrinter = useCallback(async () => {
    logger.separator("CONNECT PRINTER");
    logger.info("usePrinter", "connectPrinter() called");
    
    if (!clientRef.current) {
      logger.error("usePrinter", "Client not initialized");
      throw new Error("Printer client not initialized");
    }

    try {
      logger.info("usePrinter", "Calling client.connect()...");
      await clientRef.current.connect();
      
      const status = clientRef.current.statusMessage;
      logger.success("usePrinter", "Connection successful", { 
        status,
        clientExists: !!clientRef.current 
      });
      
      dispatch({ type: "SET_STATUS", payload: status });
      
      // Double check connection state
      logger.debug("usePrinter", "Verifying connection state...");
      setTimeout(() => {
        if (clientRef.current) {
          logger.info("usePrinter", "Post-connection state check", {
            statusMessage: clientRef.current.statusMessage,
            isPrinting: clientRef.current.isPrinting,
          });
        }
      }, 500);
      
    } catch (error) {
      logger.error("usePrinter", "Connection failed", error);
      dispatch({
        type: "SET_STATUS",
        payload: `Connection error: ${(error as Error).message}`,
      });
      throw error;
    }
  }, []);

  const getPrinterStatus = useCallback(async () => {
    if (!clientRef.current) {
      return null;
    }

    const printerState = await clientRef.current.getStatus();
    if (printerState) {
      dispatch({ type: "SET_PRINTER_STATE", payload: printerState });
    }
    dispatch({ type: "SET_STATUS", payload: clientRef.current.statusMessage });
    return printerState;
  }, []);

  const printCanvas = useCallback(
    async (
      canvas: HTMLCanvasElement,
      options: Partial<{
        dither: DitherMethod;
        brightness: number;
        intensity: number;
      }> = {}
    ) => {
      logger.separator("PRINT CANVAS");
      logger.info("usePrinter", "printCanvas() called", { 
        canvasSize: { width: canvas.width, height: canvas.height },
        options 
      });
      
      if (!clientRef.current) {
        logger.error("usePrinter", "Print failed: Client not initialized");
        throw new Error("Printer client not initialized");
      }

      try {
        logger.info("usePrinter", "Setting isPrinting to true");
        dispatch({ type: "SET_PRINTING", payload: true });

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          logger.error("usePrinter", "Failed to get canvas context");
          throw new Error("Failed to get canvas context");
        }

        logger.info("usePrinter", "Extracting image data from canvas");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        logger.debug("usePrinter", "Image data extracted", {
          width: imageData.width,
          height: imageData.height,
          dataLength: imageData.data.length
        });
        
        logger.info("usePrinter", "Calling client.print()...");
        await clientRef.current.print(imageData, options);
        
        logger.success("usePrinter", "Print completed successfully");
        dispatch({ type: "SET_STATUS", payload: clientRef.current.statusMessage });
      } catch (error) {
        logger.error("usePrinter", "Print failed", error);
        dispatch({
          type: "SET_STATUS",
          payload: `Print error: ${(error as Error).message}`,
        });
        throw error;
      } finally {
        logger.info("usePrinter", "Setting isPrinting to false");
        dispatch({ type: "SET_PRINTING", payload: false });
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    if (!clientRef.current) {
      return;
    }

    await clientRef.current.disconnect();
    dispatch({ type: "SET_STATUS", payload: clientRef.current.statusMessage });
  }, []);

  const setDitherMethod = useCallback((method: DitherMethod) => {
    dispatch({ type: "SET_DITHER", payload: method });
    clientRef.current?.setDitherMethod(method);
  }, []);

  const setPrintIntensity = useCallback((intensity: number) => {
    dispatch({ type: "SET_INTENSITY", payload: intensity });
    clientRef.current?.setPrintIntensity(intensity);
  }, []);

  const returnValue = {
    isConnected: state.isConnected,
    isPrinting: state.isPrinting,
    printerState: state.printerState,
    statusMessage: state.statusMessage,
    ditherMethod: state.ditherMethod,
    printIntensity: state.printIntensity,
    connectPrinter,
    printCanvas,
    getPrinterStatus,
    disconnect,
    setDitherMethod,
    setPrintIntensity,
  };
  
  // Log hook state when it changes (but not on every render)
  useEffect(() => {
    logger.debug("usePrinter", "Hook state updated", {
      isConnected: state.isConnected,
      isPrinting: state.isPrinting,
      statusMessage: state.statusMessage,
      hasPrinterState: !!state.printerState,
    });
  }, [state.isConnected, state.isPrinting, state.statusMessage]);
  
  return returnValue;
}

export default usePrinter;

