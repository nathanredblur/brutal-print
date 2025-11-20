/**
 * Zustand Store for Thermal Printer Management
 * Replaces PrinterContext with a more efficient Zustand store
 */

import { create } from "zustand";
import {
  ThermalPrinterClient,
  WebBluetoothAdapter,
  type PrinterState,
  type DitherMethod,
} from "mxw01-thermal-printer";
import { logger } from "../lib/logger";

interface PrinterStore {
  // State
  isConnected: boolean;
  isPrinting: boolean;
  printerState: PrinterState | null;
  statusMessage: string;
  ditherMethod: DitherMethod;
  printIntensity: number;

  // Internal
  _client: ThermalPrinterClient | null;
  _syncInterval: NodeJS.Timeout | null;

  // Actions
  initialize: () => void;
  connectPrinter: () => Promise<void>;
  disconnect: () => Promise<void>;
  printCanvas: (
    canvas: HTMLCanvasElement,
    options?: Partial<{
      dither: DitherMethod;
      brightness: number;
      intensity: number;
    }>
  ) => Promise<void>;
  getPrinterStatus: () => Promise<PrinterState | null>;
  setDitherMethod: (method: DitherMethod) => void;
  setPrintIntensity: (intensity: number) => void;
  cleanup: () => void;
}

export const usePrinterStore = create<PrinterStore>((set, get) => ({
  // Initial state
  isConnected: false,
  isPrinting: false,
  printerState: null,
  statusMessage: "Ready to connect printer",
  ditherMethod: "steinberg",
  printIntensity: 0x5d, // 93 decimal

  // Internal state
  _client: null,
  _syncInterval: null,

  // Initialize printer client and event listeners
  initialize: () => {
    const state = get();
    
    // Don't initialize twice
    if (state._client) {
      logger.warn("usePrinterStore", "Client already initialized");
      return;
    }

    logger.separator("PRINTER STORE INITIALIZATION");
    logger.info("usePrinterStore", "Initializing thermal printer client");

    try {
      const adapter = new WebBluetoothAdapter();
      const client = new ThermalPrinterClient(adapter);

      logger.success("usePrinterStore", "Client created successfully", {
        adapter: "WebBluetoothAdapter",
        client: "ThermalPrinterClient",
      });

      // Subscribe to client events
      client.on("connected", (event) => {
        logger.separator("PRINTER CONNECTED");
        logger.success("usePrinterStore", "Printer connected event fired", {
          event,
        });
        set({ isConnected: true });
      });

      client.on("disconnected", () => {
        logger.separator("PRINTER DISCONNECTED");
        logger.warn("usePrinterStore", "Printer disconnected event fired");
        set({ isConnected: false, printerState: null });
      });

      client.on("stateChange", (event) => {
        logger.logEvent("usePrinterStore", "stateChange", event.state);
        set({ printerState: event.state });
      });

      client.on("error", (event) => {
        logger.error("usePrinterStore", "Printer error event", event.error);
      });

      // Sync state from client periodically
      const syncInterval = setInterval(() => {
        const currentState = get();
        if (currentState._client) {
          set({
            statusMessage: currentState._client.statusMessage,
            isPrinting: currentState._client.isPrinting,
          });
        }
      }, 100);

      set({ _client: client, _syncInterval: syncInterval });

      logger.info(
        "usePrinterStore",
        "Event listeners registered, sync interval started"
      );
    } catch (error) {
      logger.error(
        "usePrinterStore",
        "Failed to initialize printer client",
        error
      );
      set({
        statusMessage: `Initialization error: ${(error as Error).message}`,
      });
    }
  },

  // Connect to printer
  connectPrinter: async () => {
    logger.separator("CONNECT PRINTER");
    logger.info("usePrinterStore", "connectPrinter() called");

    const state = get();
    if (!state._client) {
      logger.error("usePrinterStore", "Client not initialized");
      throw new Error("Printer client not initialized");
    }

    try {
      logger.info("usePrinterStore", "Calling client.connect()...");
      await state._client.connect();

      const status = state._client.statusMessage;
      logger.success("usePrinterStore", "Connection successful", { status });

      set({ statusMessage: status });

      // Verify connection state
      logger.debug("usePrinterStore", "Verifying connection state...");
      setTimeout(() => {
        const currentState = get();
        if (currentState._client) {
          logger.info("usePrinterStore", "Post-connection state check", {
            statusMessage: currentState._client.statusMessage,
            isPrinting: currentState._client.isPrinting,
          });
        }
      }, 500);
    } catch (error) {
      logger.error("usePrinterStore", "Connection failed", error);
      set({
        statusMessage: `Connection error: ${(error as Error).message}`,
      });
      throw error;
    }
  },

  // Disconnect from printer
  disconnect: async () => {
    const state = get();
    if (!state._client) {
      return;
    }

    await state._client.disconnect();
    set({ statusMessage: state._client.statusMessage });
  },

  // Print canvas
  printCanvas: async (canvas, options = {}) => {
    logger.separator("PRINT CANVAS");
    logger.info("usePrinterStore", "printCanvas() called", {
      canvasSize: { width: canvas.width, height: canvas.height },
      options,
    });

    const state = get();
    if (!state._client) {
      logger.error("usePrinterStore", "Print failed: Client not initialized");
      throw new Error("Printer client not initialized");
    }

    try {
      logger.info("usePrinterStore", "Setting isPrinting to true");
      set({ isPrinting: true });

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        logger.error("usePrinterStore", "Failed to get canvas context");
        throw new Error("Failed to get canvas context");
      }

      logger.info("usePrinterStore", "Extracting image data from canvas");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      logger.debug("usePrinterStore", "Image data extracted", {
        width: imageData.width,
        height: imageData.height,
        dataLength: imageData.data.length,
      });

      logger.info("usePrinterStore", "Calling client.print()...");
      await state._client.print(imageData, options);

      logger.success("usePrinterStore", "Print completed successfully");
      set({ statusMessage: state._client.statusMessage });
    } catch (error) {
      logger.error("usePrinterStore", "Print failed", error);
      set({
        statusMessage: `Print error: ${(error as Error).message}`,
      });
      throw error;
    } finally {
      logger.info("usePrinterStore", "Setting isPrinting to false");
      set({ isPrinting: false });
    }
  },

  // Get printer status
  getPrinterStatus: async () => {
    const state = get();
    if (!state._client) {
      return null;
    }

    const printerState = await state._client.getStatus();
    if (printerState) {
      set({ printerState });
    }
    set({ statusMessage: state._client.statusMessage });
    return printerState;
  },

  // Set dither method
  setDitherMethod: (method) => {
    const state = get();
    set({ ditherMethod: method });
    state._client?.setDitherMethod(method);
  },

  // Set print intensity
  setPrintIntensity: (intensity) => {
    const state = get();
    set({ printIntensity: intensity });
    state._client?.setPrintIntensity(intensity);
  },

  // Cleanup
  cleanup: () => {
    const state = get();
    logger.info("usePrinterStore", "Cleaning up printer store");

    if (state._syncInterval) {
      clearInterval(state._syncInterval);
    }

    if (state._client) {
      state._client.dispose();
    }

    set({
      _client: null,
      _syncInterval: null,
      isConnected: false,
      isPrinting: false,
      printerState: null,
    });

    logger.success("usePrinterStore", "Cleanup complete");
  },
}));

// Initialize the store when imported (only in browser)
if (typeof window !== "undefined") {
  usePrinterStore.getState().initialize();
}

