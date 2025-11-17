/**
 * Gallery Component - Reusable gallery with fuzzy search
 * Can display any type of items with custom rendering
 */

import { useState, useMemo } from "react";
import type { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { X, Search } from "lucide-react";

export interface GalleryItem {
  id: string;
  name: string;
  tags?: string[];
  preview?: ReactNode;
  data?: any;
}

interface GalleryProps {
  items: GalleryItem[];
  onItemSelect: (item: GalleryItem) => void;
  placeholder?: string;
  emptyMessage?: string;
}

const Gallery: FC<GalleryProps> = ({
  items,
  onItemSelect,
  placeholder = "Search...",
  emptyMessage = "No items found",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fuzzy search implementation
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();

    return items.filter((item) => {
      // Search in name
      if (item.name.toLowerCase().includes(query)) return true;

      // Search in tags
      if (item.tags?.some((tag) => tag.toLowerCase().includes(query))) {
        return true;
      }

      // Fuzzy match in name (allows for typos)
      const nameMatch = fuzzyMatch(query, item.name.toLowerCase());
      if (nameMatch) return true;

      return false;
    });
  }, [items, searchQuery]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search Input */}
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-2 py-2 gap-2">
        <Search size={14} className="text-slate-400 shrink-0" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="border-0 shadow-none h-auto px-0 py-0 focus-visible:ring-0 bg-transparent"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchQuery("")}
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={Search} title={emptyMessage} iconSize={36} />
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className="aspect-square h-auto p-3 cursor-pointer transition-all duration-200 flex items-center justify-center bg-slate-800/50 border-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2 active:translate-y-0"
              onClick={() => onItemSelect(item)}
              title={item.name}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onItemSelect(item);
                }
              }}
            >
              {item.preview}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Simple fuzzy match implementation
function fuzzyMatch(pattern: string, text: string): boolean {
  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < pattern.length && textIdx < text.length) {
    if (pattern[patternIdx] === text[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === pattern.length;
}

export default Gallery;
