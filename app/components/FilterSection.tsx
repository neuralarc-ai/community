import React from "react";
import { ListFilter, Tag } from "lucide-react";

interface FilterSectionProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  activeColor: string;
  hoverColor: string;
}

export default function FilterSection({
  tags,
  selectedTag,
  onSelectTag,
  activeColor,
  hoverColor,
}: FilterSectionProps) {
  return (
    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2 font-heading">
          <ListFilter size={14} className="mr-1.5" />
          Filters:
        </div>

        <button
          onClick={() => onSelectTag(null)}
          className={`
                foregroundspace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedTag === null
                    ? activeColor
                    : `bg-foreground/5 text-muted-foreground border border-foreground/5 hover:bg-foreground/10 hover:text-foreground ${hoverColor}`
                }
            `}
        >
          All Posts
        </button>

        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
            className={`
                    foregroundspace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedTag === tag
                        ? activeColor
                        : `bg-foreground/5 text-muted-foreground border border-foreground/5 hover:bg-foreground/10 hover:text-foreground ${hoverColor}`
                    }
                `}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
