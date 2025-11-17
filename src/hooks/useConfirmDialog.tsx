/**
 * useConfirmDialog - Hook for confirmation dialogs
 * Provides a Promise-based API for AlertDialog
 */

import { useState, useCallback } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const initialState: ConfirmDialogState = {
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
};

export function useConfirmDialog() {
  const [dialogState, setDialogState] =
    useState<ConfirmDialogState>(initialState);

  const confirm = useCallback(
    (
      title: string,
      description: string,
      options?: {
        confirmText?: string;
        cancelText?: string;
      }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          title,
          description,
          confirmText: options?.confirmText || "Confirm",
          cancelText: options?.cancelText || "Cancel",
          onConfirm: () => {
            setDialogState(initialState);
            resolve(true);
          },
          onCancel: () => {
            setDialogState(initialState);
            resolve(false);
          },
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    setDialogState(initialState);
  }, []);

  return {
    confirm,
    close,
    dialogState,
  };
}
