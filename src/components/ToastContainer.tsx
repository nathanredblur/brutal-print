/**
 * Toast Container
 * 
 * Renders all active toast notifications with Neuro Core styling
 */

import { useEffect, useState } from 'react';
import type { Toast } from '../types/toast';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[400px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-l-4 border-l-cyan-500',
          icon: 'bg-cyan-500/20 text-cyan-500'
        };
      case 'error':
        return {
          border: 'border-l-4 border-l-purple-400',
          icon: 'bg-purple-400/20 text-purple-400'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-l-amber-500',
          icon: 'bg-amber-500/20 text-amber-500'
        };
      case 'info':
      default:
        return {
          border: 'border-l-4 border-l-blue-400',
          icon: 'bg-blue-400/20 text-blue-400'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 px-5
        bg-gradient-to-br from-slate-900/95 to-slate-950/[0.98] backdrop-blur-xl
        border border-slate-700 rounded-lg
        shadow-2xl shadow-black/50 ring-1 ring-blue-500/10
        min-w-[300px] max-w-[400px]
        transition-all duration-300 ease-out
        ${colorClasses.border}
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${isExiting ? 'opacity-0 translate-x-full' : ''}
        sm:min-w-[300px] sm:max-w-[400px]
        max-sm:min-w-[calc(100vw-2rem)] max-sm:max-w-[calc(100vw-2rem)]
      `}
      role="alert"
    >
      <div className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-base font-bold ${colorClasses.icon}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-[0.95rem] font-semibold text-slate-100 tracking-wide">
          {toast.title}
        </div>
        {toast.message && (
          <div className="text-sm text-slate-400 leading-relaxed">
            {toast.message}
          </div>
        )}
        {toast.action && (
          <Button 
            variant="neuro-ghost" 
            size="sm"
            className="mt-2 self-start" 
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon-sm"
        onClick={handleClose} 
        aria-label="Close notification"
        className="shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

