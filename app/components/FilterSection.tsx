import React from 'react';
import { Tag } from 'lucide-react';

interface FilterSectionProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function FilterSection({ tags, selectedTag, onSelectTag }: FilterSectionProps) {
  return (
    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">
            <Tag size={14} className="mr-1.5" />
            Filters:
        </div>
        
        <button
            onClick={() => onSelectTag(null)}
            className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${selectedTag === null 
                    ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)]' 
                    : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white'}
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
                    ${selectedTag === tag 
                        ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)]' 
                        : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white'}
                `}
            >
                {tag}
            </button>
        ))}
      </div>
    </div>
  );
}

