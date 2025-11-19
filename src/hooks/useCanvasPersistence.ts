/**
 * useCanvasPersistence Hook
 * 
 * Saves and restores canvas state from localStorage
 * Includes layers (except HTMLCanvasElement data) and canvas height
 * Now works with Zustand store
 */

import { useEffect, useCallback } from 'react';
import type { Layer, ImageLayer } from '../types/layer';
import { useLayersStore } from '../stores/useLayersStore';
import { logger } from '../lib/logger';

const STORAGE_KEY = 'thermal-print-studio-canvas-state';
const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

export interface CanvasState {
  layers: Layer[];
  canvasHeight: number;
  selectedLayerId: string | null;
  nextId: number;
  savedAt: string;
}

export function useCanvasPersistence(canvasHeight: number) {
  // Get state from Zustand store
  const layers = useLayersStore((state) => state.layers);
  const selectedLayerId = useLayersStore((state) => state.selectedLayerId);
  const nextId = useLayersStore((state) => state.nextId);
  const loadState = useLayersStore((state) => state.loadState);

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      // Serialize layers (convert HTMLCanvasElement to base64)
      const serializedLayers = layers.map(layer => {
        if (layer.type === 'image') {
          const imageLayer = layer as ImageLayer;
          return {
            ...layer,
            imageData: imageLayer.imageData.toDataURL(), // Convert canvas to base64
          };
        }
        return layer;
      });

      const state: CanvasState = {
        layers: serializedLayers,
        canvasHeight,
        selectedLayerId,
        nextId,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      logger.debug('useCanvasPersistence', 'State saved', {
        layerCount: layers.length,
        canvasHeight,
      });
    } catch (error) {
      logger.error('useCanvasPersistence', 'Failed to save state', error);
    }
  }, [layers, canvasHeight, selectedLayerId, nextId]);

  // Load state from localStorage and update Zustand store
  const loadStateFromStorage = useCallback(async (): Promise<Partial<CanvasState> | null> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: CanvasState = JSON.parse(stored);
      
      // Restore HTMLCanvasElement from base64 (wait for images to load)
      const restoredLayers = await Promise.all(state.layers.map(async layer => {
        if (layer.type === 'image') {
          const imageLayer = layer as any;
          
          // Create canvas from base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return layer;

          // Wait for image to load
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = imageLayer.imageData;
          });
          
          canvas.width = layer.width;
          canvas.height = layer.height;
          ctx.drawImage(img, 0, 0, layer.width, layer.height);

          return {
            ...layer,
            imageData: canvas,
          };
        }
        return layer;
      }));

      logger.info('useCanvasPersistence', 'State loaded', {
        layerCount: restoredLayers.length,
        canvasHeight: state.canvasHeight,
        savedAt: state.savedAt,
      });

      // Update Zustand store with loaded state
      loadState({
        layers: restoredLayers,
        selectedLayerId: state.selectedLayerId,
        nextId: state.nextId,
      });

      return {
        ...state,
        layers: restoredLayers,
      };
    } catch (error) {
      logger.error('useCanvasPersistence', 'Failed to load state', error);
      return null;
    }
  }, [loadState]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      logger.info('useCanvasPersistence', 'Saved state cleared');
    } catch (error) {
      logger.error('useCanvasPersistence', 'Failed to clear state', error);
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (layers.length > 0) {
        saveState();
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [layers, canvasHeight, selectedLayerId, nextId, saveState]);

  return {
    saveState,
    loadState: loadStateFromStorage,
    clearSavedState,
  };
}

