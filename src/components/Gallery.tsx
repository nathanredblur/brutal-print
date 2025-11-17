/**
 * Gallery Component - Reusable gallery with fuzzy search
 * Can display any type of items with custom rendering
 */

import { useState, useMemo } from "react";
import type { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="gallery">
      {/* Search Input */}
      <div className="gallery-search">
        <Search size={14} className="search-icon" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="border-0 shadow-none h-auto px-0 py-0 focus-visible:ring-0"
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
      <div className="gallery-grid">
        {filteredItems.length === 0 ? (
          <div className="gallery-empty">
            <Search size={36} />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Button
              key={item.id}
              variant="neuro-ghost"
              className="gallery-item"
              onClick={() => onItemSelect(item)}
              title={item.name}
            >
              {item.preview}
            </Button>
          ))
        )}
      </div>

      <style>{`
        .gallery {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }

        .gallery-search {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          gap: 0.5rem;
        }

        .search-icon {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .gallery-grid {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.5rem;
          padding: 0.25rem;
        }

        .gallery-grid::-webkit-scrollbar {
          width: 6px;
        }

        .gallery-grid::-webkit-scrollbar-track {
          background: transparent;
        }

        .gallery-grid::-webkit-scrollbar-thumb {
          background: var(--color-slate-dark);
          border-radius: 3px;
        }

        .gallery-item {
          aspect-ratio: 1;
          height: auto;
          padding: 0.75rem;
        }

        .gallery-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(167, 139, 250, 0.2);
        }

        .gallery-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem 1rem;
          color: var(--color-text-muted);
        }

        .gallery-empty svg {
          opacity: 0.3;
        }

        .gallery-empty p {
          font-size: 0.75rem;
          margin: 0;
        }
      `}</style>
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

