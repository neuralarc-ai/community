import React from 'react';

interface PostListProps {
  children: React.ReactNode;
}

export default function PostList({ children }: PostListProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
}

