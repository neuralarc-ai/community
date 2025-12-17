export type User = {
  name: string;
  avatarUrl: string;
  karma: number;
};

export type Comment = {
  id: string;
  author: User;
  timestamp: string;
  content: string;
  karma: number;
  replies: Comment[];
  isFlagged?: boolean;
  flagReason?: string;
};

export type Post = {
  id: string;
  title: string;
  author: User;
  timestamp: string;
  content: string;
  karma: number;
  comments: Comment[];
};
