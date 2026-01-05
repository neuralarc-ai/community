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
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedTag === null
                    ? activeColor
                    : `bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white ${hoverColor}`
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
                    whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedTag === tag
                        ? activeColor
                        : `bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white ${hoverColor}`
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
