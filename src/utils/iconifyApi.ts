/**
 * Iconify API Client
 * Fetches icon collections, searches icons, and converts SVGs for canvas use.
 */

import { CANVAS_WIDTH } from "@/constants/canvasStyles";

const API_BASE = "https://api.iconify.design";

export interface IconCollection {
  name: string;
  total: number;
  category?: string;
  samples: string[];
}

export interface SearchResult {
  icons: string[];
  total: number;
  collections: Record<string, IconCollection>;
}

export interface CollectionDetail {
  prefix: string;
  total: number;
  title: string;
  categories?: Record<string, string[]>;
  uncategorized?: string[];
}

let collectionsCache: Record<string, IconCollection> | null = null;
let collectionsPending: Promise<Record<string, IconCollection>> | null = null;

export async function fetchCollections(): Promise<
  Record<string, IconCollection>
> {
  if (collectionsCache) return collectionsCache;
  if (collectionsPending) return collectionsPending;

  collectionsPending = fetch(`${API_BASE}/collections`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch collections: ${response.statusText}`,
        );
      }
      const data = (await response.json()) as Record<string, IconCollection>;
      collectionsCache = data;
      return data;
    })
    .finally(() => {
      collectionsPending = null;
    });

  return collectionsPending;
}

export async function searchIcons(
  query: string,
  prefix?: string,
  limit = 64,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  if (prefix) params.set("prefix", prefix);

  const response = await fetch(`${API_BASE}/search?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json() as Promise<SearchResult>;
}

export async function fetchCollectionIcons(
  prefix: string,
): Promise<CollectionDetail> {
  const response = await fetch(
    `${API_BASE}/collection?prefix=${encodeURIComponent(prefix)}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch collection icons: ${response.statusText}`,
    );
  }

  return response.json() as Promise<CollectionDetail>;
}

export function getIconSvgUrl(prefix: string, name: string): string {
  return `${API_BASE}/${prefix}/${name}.svg?width=${CANVAS_WIDTH}&color=%23000000`;
}

/**
 * Fetches an SVG from Iconify and converts it to a PNG data URL
 * via an offscreen canvas. Sets explicit dimensions to ensure the
 * SVG renders at the correct size regardless of its intrinsic size.
 */
export async function svgUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.statusText}`);
  }

  const svgText = await response.text();

  // Parse SVG to extract viewBox dimensions for correct aspect ratio
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) throw new Error("Invalid SVG");

  // Force explicit dimensions so the browser renders at the right size
  svgEl.setAttribute("width", String(CANVAS_WIDTH));
  svgEl.removeAttribute("height"); // Let height scale from viewBox

  const serializer = new XMLSerializer();
  const fixedSvg = serializer.serializeToString(svgEl);
  const blob = new Blob([fixedSvg], { type: "image/svg+xml" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas 2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load SVG as image"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
