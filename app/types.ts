export interface Post {
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
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  enrolled: number;
  link: string;
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

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}
