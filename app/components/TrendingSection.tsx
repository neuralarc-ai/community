import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { TrendingUp, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock data for frontend-first implementation
const trendingTopics = [
  {
    id: '1',
    title: 'Context Injection for the LLM model',
    commentCount: 42,
    time: '2h ago',
    tag: 'AI/ML'
  },
  {
    id: '2',
    title: 'Understanding Koszul duality',
    commentCount: 28,
    time: '4h ago',
    tag: 'Math'
  },
  {
    id: '3',
    title: 'Best practices for React Server Components',
    commentCount: 15,
    time: '1h ago',
    tag: 'Web Dev'
  }
];

export default function TrendingSection() {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                <TrendingUp size={18} />
                Trending
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2">
            {trendingTopics.map((topic) => (
                <div 
                    key={topic.id} 
                    className="group p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {topic.tag}
                        </span>
                        <div className="flex items-center text-[10px] text-muted-foreground">
                            <Clock size={10} className="mr-1" />
                            {topic.time}
                        </div>
                    </div>
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                        {topic.title}
                    </h3>
                    <div className="flex items-center text-[11px] text-muted-foreground">
                        <MessageCircle size={12} className="mr-1" />
                        {topic.commentCount} comments
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

