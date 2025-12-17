import React from 'react';

interface PostListProps {
  children: React.ReactNode;
}

export default function PostList({ children }: PostListProps) {
  return (
    <div className="min-w-0 overflow-hidden">
      {children}
    </div>
  );
}

