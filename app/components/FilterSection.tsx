import React from 'react';
import { Tag } from 'lucide-react';

interface FilterSectionProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function FilterSection({ tags, selectedTag, onSelectTag }: FilterSectionProps) {
  return (
    <div className="mb-6 overflow-x-auto pb-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-sm text-muted-foreground mr-2">
            <Tag size={16} className="mr-1" />
            Filters:
        </div>
        
        <button
            onClick={() => onSelectTag(null)}
            className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedTag === null 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}
            `}
        >
            All Posts
        </button>

        {tags.map((tag) => (
            <button
                key={tag}
                onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
                className={`
                    whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${selectedTag === tag 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}
                `}
            >
                {tag}
            </button>
        ))}
      </div>
    </div>
  );
}

