/**
 * Toast Context
 * 
 * Provides global access to toast notifications throughout the app
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useToast, type UseToastReturn } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext<UseToastReturn | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastHook = useToast();

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer toasts={toastHook.toasts} onClose={toastHook.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext(): UseToastReturn {
  const context = useContext(ToastContext);

  if (!context) {
    // SSR safety - return mock functions
    if (typeof window === 'undefined') {
      return {
        toasts: [],
        addToast: () => '',
        removeToast: () => {},
        success: () => '',
        error: () => '',
        info: () => '',
        warning: () => '',
      };
    }

    throw new Error('useToastContext must be used within ToastProvider');
  }

  return context;
}

