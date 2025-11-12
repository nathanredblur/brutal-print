/**
 * Confirm Dialog Component
 * 
 * Modal dialog for confirming destructive actions with Neuro Core styling
 */

import { useEffect, useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger enter animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'danger':
        return 'dialog-danger';
      case 'warning':
        return 'dialog-warning';
      case 'info':
      default:
        return 'dialog-info';
    }
  };

  return (
    <div
      className={`dialog-backdrop ${isVisible ? 'dialog-backdrop-visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`dialog ${getVariantClass()} ${isVisible ? 'dialog-visible' : ''}`}>
        <div className="dialog-header">
          <h3 className="dialog-title">{title}</h3>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">{message}</p>
        </div>

        <div className="dialog-footer">
          <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="dialog-btn dialog-btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 14, 26, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .dialog-backdrop-visible {
          opacity: 1;
        }

        .dialog {
          background: linear-gradient(135deg, rgba(21, 24, 54, 0.98) 0%, rgba(12, 15, 38, 1) 100%);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15);
          max-width: 450px;
          width: calc(100% - 2rem);
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dialog-visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .dialog-danger {
          border-left: 4px solid var(--color-purple-accent);
        }

        .dialog-warning {
          border-left: 4px solid #F59E0B;
        }

        .dialog-info {
          border-left: 4px solid var(--color-blue-accent);
        }

        .dialog-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(var(--color-border-rgb, 42, 47, 72), 0.5);
        }

        .dialog-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: 0.02em;
        }

        .dialog-body {
          padding: 1.5rem;
        }

        .dialog-message {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .dialog-footer {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .dialog-btn {
          padding: 0.625rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: var(--radius-md);
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }

        .dialog-btn-cancel {
          background: transparent;
          border-color: var(--color-border);
          color: var(--color-text-secondary);
        }

        .dialog-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-border-light);
          color: var(--color-text-primary);
        }

        .dialog-btn-confirm {
          background: linear-gradient(135deg, var(--color-purple-dark) 0%, var(--color-purple-primary) 100%);
          border-color: var(--color-purple-accent);
          color: var(--color-text-primary);
        }

        .dialog-btn-confirm:hover {
          background: linear-gradient(135deg, var(--color-purple-primary) 0%, var(--color-purple-accent) 100%);
          box-shadow: 0 0 15px rgba(181, 107, 255, 0.4);
          transform: translateY(-1px);
        }

        .dialog-btn-confirm:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .dialog {
            max-width: calc(100vw - 2rem);
          }

          .dialog-footer {
            flex-direction: column-reverse;
          }

          .dialog-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

