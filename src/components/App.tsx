/**
 * App Component - Wrapper that includes Providers + CanvasManager
 * 
 * This is needed because Astro's client:load directive doesn't
 * propagate to children. We need all providers and components to
 * hydrate together on the client.
 */

import { PrinterProvider } from '../contexts/PrinterContext';
import { ToastProvider } from '../contexts/ToastContext';
import CanvasManager from './CanvasManager';

export default function App() {
  return (
    <ToastProvider>
      <PrinterProvider>
        <CanvasManager />
      </PrinterProvider>
    </ToastProvider>
  );
}

