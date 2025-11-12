/**
 * useCanvasPersistence Hook
 * 
 * Saves and restores canvas state from localStorage
 * Includes layers (except HTMLCanvasElement data) and canvas height
 */

import { useEffect, useCallback } from 'react';
import type { Layer, ImageLayer } from '../types/layer';
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

export function useCanvasPersistence(
  layers: Layer[],
  canvasHeight: number,
  selectedLayerId: string | null,
  nextId: number
) {
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

  // Load state from localStorage
  const loadState = useCallback((): Partial<CanvasState> | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: CanvasState = JSON.parse(stored);
      
      // Restore HTMLCanvasElement from base64
      const restoredLayers = state.layers.map(layer => {
        if (layer.type === 'image') {
          const imageLayer = layer as any;
          
          // Create canvas from base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return layer;

          const img = new Image();
          img.src = imageLayer.imageData;
          
          // Note: This is synchronous for cached images
          canvas.width = layer.width;
          canvas.height = layer.height;
          ctx.drawImage(img, 0, 0);

          return {
            ...layer,
            imageData: canvas,
          };
        }
        return layer;
      });

      logger.info('useCanvasPersistence', 'State loaded', {
        layerCount: restoredLayers.length,
        canvasHeight: state.canvasHeight,
        savedAt: state.savedAt,
      });

      return {
        ...state,
        layers: restoredLayers,
      };
    } catch (error) {
      logger.error('useCanvasPersistence', 'Failed to load state', error);
      return null;
    }
  }, []);

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
    loadState,
    clearSavedState,
  };
}

