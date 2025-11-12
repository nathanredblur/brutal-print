/**
 * useLayers Hook
 * 
 * Manages canvas layers (add, remove, reorder, select)
 * Provides non-destructive editing capabilities
 */

import { useState, useCallback } from 'react';
import type { Layer, LayerState, ImageLayer, TextLayer } from '../types/layer';
import { logger } from '../lib/logger';

export function useLayers() {
  const [state, setState] = useState<LayerState>({
    layers: [],
    selectedLayerId: null,
    nextId: 1,
  });

  // Add image layer
  const addImageLayer = useCallback((
    imageData: HTMLCanvasElement,
    options?: Partial<ImageLayer>
  ) => {
    setState(prev => {
      const newLayer: ImageLayer = {
        id: `layer-${prev.nextId}`,
        type: 'image',
        name: options?.name || `Image ${prev.nextId}`,
        visible: true,
        locked: false,
        x: options?.x ?? 0,
        y: options?.y ?? 0,
        width: imageData.width,
        height: imageData.height,
        opacity: 1,
        rotation: 0,
        imageData,
        ditherMethod: options?.ditherMethod,
      };

      logger.info('useLayers', 'Image layer added', {
        id: newLayer.id,
        name: newLayer.name,
        size: { width: newLayer.width, height: newLayer.height },
      });

      return {
        ...prev,
        layers: [...prev.layers, newLayer],
        selectedLayerId: newLayer.id,
        nextId: prev.nextId + 1,
      };
    });
  }, []);

  // Add text layer
  const addTextLayer = useCallback((
    text: string,
    options: Partial<TextLayer>
  ) => {
    setState(prev => {
      const fontSize = options.fontSize || 24;
      const newLayer: TextLayer = {
        id: `layer-${prev.nextId}`,
        type: 'text',
        name: options.name || `Text ${prev.nextId}`,
        visible: true,
        locked: false,
        x: options.x ?? 50,
        y: options.y ?? 50,
        width: 200, // Approximate, will be calculated on render
        height: fontSize * 1.2,
        opacity: 1,
        rotation: 0,
        text,
        fontSize,
        fontFamily: options.fontFamily || 'Inter',
        bold: options.bold ?? false,
        italic: options.italic ?? false,
        align: options.align || 'left',
        color: options.color || '#000000',
      };

      logger.info('useLayers', 'Text layer added', {
        id: newLayer.id,
        name: newLayer.name,
        text: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
      });

      return {
        ...prev,
        layers: [...prev.layers, newLayer],
        selectedLayerId: newLayer.id,
        nextId: prev.nextId + 1,
      };
    });
  }, []);

  // Remove layer
  const removeLayer = useCallback((id: string) => {
    setState(prev => {
      const layer = prev.layers.find(l => l.id === id);
      
      logger.info('useLayers', 'Layer removed', {
        id,
        name: layer?.name,
      });

      return {
        ...prev,
        layers: prev.layers.filter(l => l.id !== id),
        selectedLayerId: prev.selectedLayerId === id ? null : prev.selectedLayerId,
      };
    });
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  }, []);

  // Toggle lock
  const toggleLock = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      ),
    }));
  }, []);

  // Select layer
  const selectLayer = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedLayerId: id,
    }));
  }, []);

  // Move layer (reorder)
  const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newLayers = [...prev.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);

      logger.debug('useLayers', 'Layer reordered', {
        from: fromIndex,
        to: toIndex,
        layerId: removed.id,
      });

      return {
        ...prev,
        layers: newLayers,
      };
    });
  }, []);

  // Update layer position
  const updateLayerPosition = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === id ? { ...layer, x, y } : layer
      ),
    }));
  }, []);

  // Rename layer
  const renameLayer = useCallback((id: string, name: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === id ? { ...layer, name } : layer
      ),
    }));
  }, []);

  // Clear all layers
  const clearLayers = useCallback(() => {
    logger.info('useLayers', 'All layers cleared');
    setState({
      layers: [],
      selectedLayerId: null,
      nextId: 1,
    });
  }, []);

  // Get selected layer
  const getSelectedLayer = useCallback(() => {
    return state.layers.find(l => l.id === state.selectedLayerId) || null;
  }, [state.layers, state.selectedLayerId]);

  return {
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    selectedLayer: getSelectedLayer(),
    addImageLayer,
    addTextLayer,
    removeLayer,
    toggleVisibility,
    toggleLock,
    selectLayer,
    moveLayer,
    updateLayerPosition,
    renameLayer,
    clearLayers,
  };
}

