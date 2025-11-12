/**
 * Toast Container
 * 
 * Renders all active toast notifications with Neuro Core styling
 */

import { useEffect, useState } from 'react';
import type { Toast } from '../types/toast';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
          max-width: 400px;
        }

        .toast-container > * {
          pointer-events: all;
        }
      `}</style>
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

  const getColorClass = () => {
    switch (toast.type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'toast-info';
    }
  };

  return (
    <div
      className={`toast ${getColorClass()} ${isVisible && !isExiting ? 'toast-enter' : ''} ${
        isExiting ? 'toast-exit' : ''
      }`}
      role="alert"
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
        {toast.action && (
          <button className="toast-action" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        )}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        ×
      </button>

      <style>{`
        .toast {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.95) 0%, rgba(12, 15, 38, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1);
          min-width: 300px;
          max-width: 400px;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toast-enter {
          opacity: 1;
          transform: translateX(0);
        }

        .toast-exit {
          opacity: 0;
          transform: translateX(100%);
        }

        .toast-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 1rem;
          font-weight: bold;
        }

        .toast-success {
          border-left: 4px solid var(--color-cyan);
        }

        .toast-success .toast-icon {
          background: rgba(6, 182, 212, 0.2);
          color: var(--color-cyan);
        }

        .toast-error {
          border-left: 4px solid var(--color-purple-accent);
        }

        .toast-error .toast-icon {
          background: rgba(181, 107, 255, 0.2);
          color: var(--color-purple-accent);
        }

        .toast-warning {
          border-left: 4px solid #F59E0B;
        }

        .toast-warning .toast-icon {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
        }

        .toast-info {
          border-left: 4px solid var(--color-blue-accent);
        }

        .toast-info .toast-icon {
          background: rgba(74, 163, 255, 0.2);
          color: var(--color-blue-accent);
        }

        .toast-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .toast-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: 0.01em;
        }

        .toast-message {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }

        .toast-action {
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid var(--color-blue-primary);
          border-radius: var(--radius-sm);
          color: var(--color-blue-accent);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .toast-action:hover {
          background: rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }

        .toast-close {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s ease;
          line-height: 1;
        }

        .toast-close:hover {
          color: var(--color-text-primary);
        }

        @media (max-width: 640px) {
          .toast {
            min-width: calc(100vw - 2rem);
            max-width: calc(100vw - 2rem);
          }
        }
      `}</style>
    </div>
  );
}

