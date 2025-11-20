/**
 * Utility to mark project as dirty (has unsaved changes)
 * Used by stores to notify when changes are made
 */

import { useProjectStore } from "../stores/useProjectStore";

/**
 * Mark the project as having unsaved changes
 * Call this whenever layers or canvas settings are modified
 */
export function markProjectDirty(): void {
  useProjectStore.getState().markDirty();
}
