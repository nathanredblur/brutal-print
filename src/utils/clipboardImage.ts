import { useLayersStore } from "@/stores/useLayersStore";

const LAYER_COPY_MARKER = "brutal-print:layer-copy";

/**
 * Write a marker to the system clipboard to signal that the most recent
 * copy was an internal layer copy (not an external image).
 */
export async function markClipboardAsLayerCopy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(LAYER_COPY_MARKER);
  } catch {
    // Clipboard write not available — internal copy still works
  }
}

/**
 * Read an image from a ClipboardEvent (paste event).
 * Returns a data URL string or null if no image found.
 */
export function getImageFromPasteEvent(e: ClipboardEvent): Promise<string> | null {
  const imageFile = Array.from(e.clipboardData?.items ?? [])
    .find((item) => item.type.startsWith("image/"))
    ?.getAsFile();

  if (!imageFile) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      dataUrl ? resolve(dataUrl) : reject(new Error("Failed to read image"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Read an image from the system clipboard (Clipboard API).
 * Returns a data URL string or null if no image found.
 * Note: This requires clipboard-read permission and may show a browser prompt.
 */
export async function getImageFromClipboard(): Promise<string | null> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((t) => t.startsWith("image/"));
      if (!imageType) continue;
      const blob = await item.getType(imageType);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          dataUrl ? resolve(dataUrl) : reject(new Error("Failed to read image"));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Permission denied or clipboard empty
  }
  return null;
}

/**
 * Check if the system clipboard contains a pasteable resource
 * (an image or an internal layer copy marker).
 */
export async function canPasteFromClipboard(): Promise<boolean> {
  try {
    const items = await navigator.clipboard.read();
    return items.some((item) =>
      item.types.some((t) => t.startsWith("image/") || t === "text/plain")
    );
  } catch {
    return false;
  }
}

/**
 * Paste an image data URL as a new image layer.
 */
export async function pasteImageAsLayer(
  dataUrl: string,
  position?: { x: number; y: number }
): Promise<void> {
  await useLayersStore.getState().addImageLayer(dataUrl, undefined, {
    x: position?.x ?? 0,
    y: position?.y ?? 0,
  });
}
