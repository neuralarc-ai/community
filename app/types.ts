// Database-backed Post interface
export interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    full_name: string;
    avatar_url: string;
    role: 'user' | 'admin';
  };
  vote_score: number;
  user_vote?: -1 | 0 | 1;
  comments?: Comment[];
  comment_count?: number;
  is_pinned?: boolean;
}

// Database-backed Comment interface
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author?: {
    username: string;
    full_name: string;
    avatar_url: string;
    role?: 'user' | 'admin';
  };
  vote_score: number;
  replies?: Comment[];
  user_vote?: -1 | 0 | 1;
}

// Database-backed Vote interface
export interface Vote {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  value: -1 | 1;
  created_at: string;
}

// Legacy interface for backward compatibility (used in existing mock data)
export interface LegacyPost {
  id: number;
  author: string;
  avatar: string;
  time: string;
  category: 'general' | 'question' | 'announcement' | 'feedback';
  title: string;
  content: string;
  replies: number;
  likes: number;
  status: 'all' | 'unanswered' | 'trending';
}

export interface Workshop {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  start_time: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'; // Assuming 'ENDED' is equivalent to 'COMPLETED'
  type: 'AUDIO' | 'VIDEO';
  recording_url?: string | null;
  ended_at?: string | null;
  created_at: string;
  is_archived?: boolean;
  host?: { // Add host details for easier access
    username: string;
    full_name: string;
    avatar_url: string;
  };
  waitlist_count?: number; // Add for displaying waitlist size
}

export interface Meeting {
  id: number;
  title: string;
  agenda: string;
  date: string;
  time: string;
  duration: number;
  type: 'general' | 'team' | 'planning' | 'review';
  link: string;
}

export interface ActivityItem {
  id: number;
  type: 'post' | 'workshop' | 'meeting' | 'member';
  title: string;
  description: string;
  time: string;
  author?: string;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  dob: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  total_flux?: number;
  posts_count?: number;
  comments_count?: number;
  conclaves_attended?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  profile?: Profile;
}
