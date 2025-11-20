/**
 * Project Actions Utilities
 * Reusable functions for project operations (new, open, save)
 * Used by both Header and useKeyboardShortcuts
 */

import { toast } from "sonner";
import { useProjectStore } from "../stores/useProjectStore";
import { useConfirmDialogStore } from "../stores/useConfirmDialogStore";

/**
 * Handle creating a new project
 * Checks for unsaved changes and confirms before proceeding
 */
export async function handleNewProject(): Promise<void> {
  const { newProject, isDirty } = useProjectStore.getState();
  const { confirm } = useConfirmDialogStore.getState();

  // Check for unsaved changes
  if (isDirty) {
    const confirmed = await confirm(
      "Unsaved changes",
      "You have unsaved changes. Creating a new project will discard them. Continue?",
      {
        confirmText: "Create new",
        cancelText: "Cancel",
      }
    );
    if (!confirmed) return;
  }

  try {
    await newProject();
    toast.success("New project created", {
      description: "Canvas cleared and ready for a new design",
    });
  } catch (error) {
    toast.error("Failed to create new project", {
      description: (error as Error).message,
    });
  }
}

/**
 * Handle opening a project
 * Checks for unsaved changes and confirms before proceeding
 */
export async function handleOpenProject(): Promise<void> {
  const { openProject, isDirty } = useProjectStore.getState();
  const { confirm } = useConfirmDialogStore.getState();

  // Check for unsaved changes
  if (isDirty) {
    const confirmed = await confirm(
      "Unsaved changes",
      "You have unsaved changes. Opening a new project will discard them. Continue?",
      {
        confirmText: "Open anyway",
        cancelText: "Cancel",
      }
    );
    if (!confirmed) return;
  }

  try {
    await openProject();
    toast.success("Project opened", {
      description: "Your project has been loaded successfully",
    });
  } catch (error) {
    // Don't show error if user just cancelled the file dialog
    if ((error as Error).message !== "No file selected") {
      toast.error("Failed to open project", {
        description: (error as Error).message,
      });
    }
  }
}

/**
 * Handle saving a project
 */
export async function handleSaveProject(): Promise<void> {
  const { saveProject } = useProjectStore.getState();

  try {
    await saveProject();
    toast.success("Project saved", {
      description: "Your project has been saved successfully",
    });
  } catch (error) {
    toast.error("Failed to save project", {
      description: (error as Error).message,
    });
  }
}

