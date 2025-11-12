/**
 * App Component - Wrapper that includes Provider + CanvasManager
 * 
 * This is needed because Astro's client:load directive doesn't
 * propagate to children. We need both Provider and Manager to
 * hydrate together on the client.
 */

import { PrinterProvider } from '../contexts/PrinterContext';
import CanvasManager from './CanvasManager';

export default function App() {
  return (
    <PrinterProvider>
      <CanvasManager />
    </PrinterProvider>
  );
}

