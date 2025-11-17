/**
 * Zustand Store for Confirm Dialog
 * Global state management for confirmation dialogs
 */

import { create } from "zustand";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogStore extends ConfirmDialogState {
  confirm: (
    title: string,
    description: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => Promise<boolean>;
  close: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmDialogStore = create<ConfirmDialogStore>((set, get) => ({
  // State
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  onConfirm: undefined,
  onCancel: undefined,

  // Actions
  confirm: (title, description, options = {}) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title,
        description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        onConfirm: () => {
          get().close();
          resolve(true);
        },
        onCancel: () => {
          get().close();
          resolve(false);
        },
      });
    });
  },

  close: () => {
    set({
      isOpen: false,
    });
  },

  handleConfirm: () => {
    const { onConfirm } = get();
    onConfirm?.();
  },

  handleCancel: () => {
    const { onCancel } = get();
    onCancel?.();
  },
}));
