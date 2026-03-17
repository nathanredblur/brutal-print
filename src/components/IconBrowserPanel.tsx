/**
 * IconBrowserPanel Component
 * Browse and insert icons from Iconify into the canvas.
 */

import { useState, useEffect, useCallback, useRef, type FC } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import {
  fetchCollections,
  searchIcons,
  fetchCollectionIcons,
  getIconSvgUrl,
  svgUrlToDataUrl,
  isAnimatedCollection,
  type IconCollection,
  type SearchResult,
  type CollectionDetail,
} from "@/utils/iconifyApi";

/** Collections shown by default when panel opens */
const POPULAR_PREFIXES = [
  "mdi",
  "lucide",
  "ph",
  "tabler",
  "solar",
  "ri",
  "carbon",
  "fluent",
  "heroicons",
  "bi",
];

function filterAnimatedIcons(result: SearchResult | null): string[] {
  if (!result) return [];
  const animatedPrefixes = new Set(
    Object.entries(result.collections)
      .filter(([, col]) => isAnimatedCollection(col))
      .map(([prefix]) => prefix),
  );
  return result.icons.filter((id) => {
    const prefix = id.split(":")[0];
    return !animatedPrefixes.has(prefix);
  });
}

interface IconBrowserPanelProps {
  onIconSelect: (dataUrl: string, name: string) => void;
  onClose: () => void;
}

type ViewMode =
  | { kind: "browse" }
  | { kind: "collection"; prefix: string; title: string }
  | { kind: "search"; query: string };

const IconBrowserPanel: FC<IconBrowserPanelProps> = ({
  onIconSelect,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>({ kind: "browse" });
  const [collections, setCollections] = useState<
    Record<string, IconCollection>
  >({});
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [collectionDetail, setCollectionDetail] =
    useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [insertingIcon, setInsertingIcon] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  // Load collections on mount
  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => setLoadError(true));
  }, []);

  // Debounced search with AbortController to cancel stale fetches
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!value.trim()) {
      setView({ kind: "browse" });
      setSearchResult(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setView({ kind: "search", query: value });
      try {
        const result = await searchIcons(
          value,
          undefined,
          64,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setSearchResult(result);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSearchResult(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);
  }, []);

  // Open a collection
  const handleOpenCollection = useCallback(
    async (prefix: string, title: string) => {
      setLoading(true);
      setView({ kind: "collection", prefix, title });
      try {
        const detail = await fetchCollectionIcons(prefix);
        setCollectionDetail(detail);
      } catch {
        setCollectionDetail(null);
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Go back to browse
  const handleBack = useCallback(() => {
    setView({ kind: "browse" });
    setCollectionDetail(null);
    setQuery("");
    setSearchResult(null);
  }, []);

  // Insert icon into canvas (blocks all clicks while inserting)
  const handleIconClick = useCallback(
    async (prefix: string, name: string) => {
      setInsertingIcon(`${prefix}:${name}`);
      try {
        const url = getIconSvgUrl(prefix, name);
        const dataUrl = await svgUrlToDataUrl(url);
        onIconSelect(dataUrl, name);
      } catch {
        toast.error("Failed to load icon");
      } finally {
        setInsertingIcon(null);
      }
    },
    [onIconSelect],
  );

  // Build icon list for collection view
  const collectionIcons: string[] = (() => {
    if (!collectionDetail) return [];
    const icons: string[] = [];
    if (collectionDetail.categories) {
      for (const names of Object.values(collectionDetail.categories)) {
        icons.push(...names);
      }
    }
    if (collectionDetail.uncategorized) {
      icons.push(...collectionDetail.uncategorized);
    }
    return [...new Set(icons)];
  })();

  return (
    <div className="flex flex-col h-full gap-3">
      <PanelHeader
        title="ICONS"
        onClose={onClose}
        className="pb-3 border-b border-slate-700"
      />

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search icons..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm bg-slate-800/50 border-slate-700"
        />
      </div>

      {/* Back button for collection view */}
      {view.kind === "collection" && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-1"
          onClick={handleBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to collections
        </Button>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <LoadingState />
        ) : view.kind === "browse" ? (
          <CollectionGrid
            collections={collections}
            loadError={loadError}
            onOpen={handleOpenCollection}
          />
        ) : view.kind === "search" ? (
          <IconGrid
            icons={filterAnimatedIcons(searchResult)}
            insertingIcon={insertingIcon}
            onIconClick={handleIconClick}
            emptyMessage="No icons found"
          />
        ) : view.kind === "collection" ? (
          <IconGrid
            icons={collectionIcons.map((n) => `${view.prefix}:${n}`)}
            insertingIcon={insertingIcon}
            onIconClick={handleIconClick}
            emptyMessage="No icons in this collection"
          />
        ) : null}
      </div>
    </div>
  );
};

/** Grid of popular collections */
function CollectionGrid({
  collections,
  loadError,
  onOpen,
}: {
  collections: Record<string, IconCollection>;
  loadError: boolean;
  onOpen: (prefix: string, title: string) => void;
}) {
  const popular = POPULAR_PREFIXES.filter(
    (p) => p in collections && !isAnimatedCollection(collections[p]),
  );

  if (loadError) {
    return (
      <p className="text-xs text-slate-500 text-center py-6">
        Failed to load collections. Check your connection.
      </p>
    );
  }

  if (popular.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-6">
        Loading collections...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500 mb-1">
        Popular Collections
      </div>
      {popular.map((prefix) => {
        const col = collections[prefix];
        if (!col) return null;
        return (
          <button
            key={prefix}
            type="button"
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-left hover:bg-slate-700/50 transition-colors group"
            onClick={() => onOpen(prefix, col.name)}
          >
            <div className="flex gap-1 shrink-0">
              {col.samples.slice(0, 3).map((sample) => (
                <img
                  key={sample}
                  src={getIconSvgUrl(prefix, sample)}
                  alt=""
                  className="w-5 h-5 invert opacity-60 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              ))}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">
                {col.name}
              </div>
              <div className="text-[0.625rem] text-slate-500">
                {col.total.toLocaleString()} icons
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Grid of individual icons */
function IconGrid({
  icons,
  insertingIcon,
  onIconClick,
  emptyMessage,
}: {
  icons: string[];
  insertingIcon: string | null;
  onIconClick: (prefix: string, name: string) => void;
  emptyMessage: string;
}) {
  if (icons.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-6">{emptyMessage}</p>
    );
  }

  const isAnyInserting = insertingIcon !== null;

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {icons.map((iconId) => {
        const [prefix, name] = iconId.split(":");
        if (!prefix || !name) return null;
        const isThisInserting = insertingIcon === iconId;

        return (
          <button
            key={iconId}
            type="button"
            disabled={isAnyInserting}
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-slate-700/50 transition-colors group disabled:pointer-events-none"
            onClick={() => onIconClick(prefix, name)}
            title={name}
          >
            {isThisInserting ? (
              <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
            ) : (
              <img
                src={getIconSvgUrl(prefix, name)}
                alt={name}
                className="w-7 h-7 invert opacity-70 group-hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            )}
            <span className="text-[0.5625rem] text-slate-500 truncate w-full text-center group-hover:text-slate-300">
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Loading skeleton */
function LoadingState() {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1 p-2">
          <div className="w-7 h-7 rounded bg-slate-700/50 animate-pulse" />
          <div className="w-10 h-2 rounded bg-slate-700/30 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default IconBrowserPanel;
