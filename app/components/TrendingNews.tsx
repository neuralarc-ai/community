'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, MoreHorizontal, MessageCircle, Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const newsItems = [
  {
    id: '1',
    title: 'Messi Wears Team India Jersey at Delhi Adidas Event',
    time: '2 hours ago',
    category: 'Sports',
    posts: '3,435 posts',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Messi',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Adidas',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Delhi'
    ]
  },
  {
    id: '2',
    title: 'Thalapathy Vijay Holds First Major Rally in Erode After Karur Tragedy',
    time: '5 hours ago',
    category: 'News',
    posts: '14.9K posts',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Erode'
    ]
  },
  {
    id: '3',
    title: 'Ram V. Sutar, Statue of Unity Creator, Dies at 100',
    time: '2 hours ago',
    category: 'News',
    posts: '2,881 posts',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sutar',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Statue',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Unity'
    ]
  }
];

const trendingTopics = [
  {
    id: 't1',
    label: 'Bihar • Trending',
    title: 'भिखारी ठाकुर',
    posts: '2,609 posts'
  },
  {
    id: 't2',
    label: 'Entertainment • Trending',
    title: 'Kartik Aaryan',
    posts: '12.4K posts'
  },
  {
    id: 't3',
    label: 'Trending in India',
    title: '#தீயசக்தி_திமுக',
    posts: '2,609 posts'
  },
  {
    id: 't4',
    label: 'Politics • Trending',
    title: 'Adani',
    posts: '14.6K posts'
  }
];

export default function TrendingNews() {
  return (
    <div className="space-y-6">
      {/* Today's News */}
      <Card className="bg-card/30 backdrop-blur-md border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-white/5">
          <CardTitle className="text-lg font-heading font-bold text-white tracking-tight flex items-center gap-2">
            Today's Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {newsItems.map((item) => (
              <div key={item.id} className="p-5 hover:bg-white/[0.03] transition-all cursor-pointer group">
                <h3 className="font-heading font-bold text-sm text-white mb-3 leading-snug group-hover:text-yellow-100 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {item.avatars.map((avatar, i) => (
                      <div key={i} className="relative w-6 h-6 rounded-full border-2 border-[#141414] overflow-hidden">
                        <img src={avatar} alt="User" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-sans">
                    <span>{item.time}</span>
                    <span className="text-white/20">•</span>
                    <span>{item.category}</span>
                    <span className="text-white/20">•</span>
                    <span>{item.posts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What's happening */}
      <Card className="bg-card/30 backdrop-blur-md border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-white/5">
          <CardTitle className="text-lg font-heading font-bold text-white tracking-tight">
            What's happening
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 font-sans">
          <div className="divide-y divide-white/5">
            {trendingTopics.map((topic) => (
              <div key={topic.id} className="p-5 hover:bg-white/[0.03] transition-all cursor-pointer group flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{topic.label}</span>
                  <button className="text-muted-foreground hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <h4 className="font-heading font-bold text-base text-white group-hover:text-yellow-50 transition-colors">
                  {topic.title}
                </h4>
                {topic.posts && (
                  <span className="text-[11px] text-muted-foreground">{topic.posts}</span>
                )}
              </div>
            ))}
            <button className="w-full p-4 text-left text-sm font-medium text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all">
              Show more
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

