import React from 'react';

interface PostListProps {
  children: React.ReactNode;
}

export default function PostList({ children }: PostListProps) {
  return (
    <div className="max-w-[1000px] mx-auto space-y-6 px-4 md:px-0">
      {children}
    </div>
  );
}

