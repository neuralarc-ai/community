import { Post, Workshop, Meeting, StatCard, ActivityItem } from '@/app/types'

export const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Sarah Johnson',
    avatar: 'SJ',
    time: '5 minutes ago',
    category: 'question',
    title: 'How to integrate third-party APIs?',
    content: 'I\'m working on a project that requires integration with multiple third-party APIs. What are the best practices for handling authentication and rate limiting?',
    replies: 12,
    likes: 24,
    status: 'unanswered'
  },
  {
    id: 2,
    author: 'Michael Chen',
    avatar: 'MC',
    time: '1 hour ago',
    category: 'general',
    title: 'Welcome to our new members!',
    content: 'We\'re excited to have 12 new members joining our community today. Feel free to introduce yourselves and let us know what brings you here!',
    replies: 8,
    likes: 45,
    status: 'trending'
  },
  {
    id: 3,
    author: 'Emily Rodriguez',
    avatar: 'ER',
    time: '2 hours ago',
    category: 'announcement',
    title: 'Community Guidelines Update',
    content: 'We\'ve updated our community guidelines to ensure a better experience for everyone. Please take a moment to review the changes.',
    replies: 5,
    likes: 32,
    status: 'all'
  },
  {
    id: 4,
    author: 'David Kim',
    avatar: 'DK',
    time: '3 hours ago',
    category: 'feedback',
    title: 'Suggestions for upcoming workshops',
    content: 'What topics would you like to see covered in our next series of workshops? Drop your suggestions below!',
    replies: 18,
    likes: 56,
    status: 'trending'
  },
  {
    id: 5,
    author: 'Lisa Anderson',
    avatar: 'LA',
    time: '4 hours ago',
    category: 'question',
    title: 'Best practices for code reviews?',
    content: 'I\'m looking for advice on conducting effective code reviews. What tools and processes do you recommend?',
    replies: 0,
    likes: 15,
    status: 'unanswered'
  },
  {
    id: 6,
    author: 'James Wilson',
    avatar: 'JW',
    time: '5 hours ago',
    category: 'general',
    title: 'Sharing my latest project',
    content: 'Just finished building a community dashboard. Would love to get your feedback and suggestions for improvements!',
    replies: 22,
    likes: 67,
    status: 'trending'
  }
]

export const mockWorkshops: Workshop[] = [
  {
    id: 1,
    title: 'Advanced JavaScript Patterns',
    description: 'Deep dive into advanced JavaScript design patterns, closures, and functional programming concepts.',
    date: '2025-12-10',
    time: '14:00',
    duration: 3,
    maxParticipants: 50,
    enrolled: 38,
    link: 'https://meet.example.com/js-patterns'
  },
  {
    id: 2,
    title: 'Building Scalable APIs',
    description: 'Learn how to design and build RESTful APIs that can scale to millions of users.',
    date: '2025-12-12',
    time: '15:00',
    duration: 2,
    maxParticipants: 40,
    enrolled: 32,
    link: 'https://meet.example.com/scalable-apis'
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of user interface and user experience design for modern applications.',
    date: '2025-12-15',
    time: '13:00',
    duration: 4,
    maxParticipants: 60,
    enrolled: 45,
    link: 'https://meet.example.com/ui-ux'
  },
  {
    id: 4,
    title: 'Database Optimization Techniques',
    description: 'Optimize your database queries and improve application performance with proven techniques.',
    date: '2025-12-18',
    time: '16:00',
    duration: 2,
    maxParticipants: 35,
    enrolled: 28,
    link: 'https://meet.example.com/db-optimization'
  }
]

export const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: 'Weekly Community Sync',
    agenda: 'Review community metrics, discuss upcoming events, and address member feedback.',
    date: '2025-12-06',
    time: '10:00',
    duration: 60,
    type: 'general',
    link: 'https://meet.example.com/weekly-sync'
  },
  {
    id: 2,
    title: 'Content Planning Session',
    agenda: 'Plan content calendar for next month, assign responsibilities, and review content performance.',
    date: '2025-12-07',
    time: '14:00',
    duration: 90,
    type: 'planning',
    link: 'https://meet.example.com/content-planning'
  },
  {
    id: 3,
    title: 'Team Retrospective',
    agenda: 'Reflect on the past sprint, celebrate wins, and identify areas for improvement.',
    date: '2025-12-08',
    time: '11:00',
    duration: 60,
    type: 'review',
    link: 'https://meet.example.com/retrospective'
  },
  {
    id: 4,
    title: 'New Member Orientation',
    agenda: 'Welcome new members, introduce community guidelines, and answer questions.',
    date: '2025-12-09',
    time: '15:00',
    duration: 45,
    type: 'general',
    link: 'https://meet.example.com/orientation'
  }
]

export const mockStats: StatCard[] = [
  {
    id: 'members',
    title: 'Total Members',
    value: '2,847',
    change: '+12% this month',
    icon: 'users'
  },
  {
    id: 'posts',
    title: 'Active Posts',
    value: '156',
    change: '+8% this week',
    icon: 'message-square'
  },
  {
    id: 'workshops',
    title: 'Workshops',
    value: '24',
    change: '6 upcoming',
    icon: 'presentation'
  },
  {
    id: 'meetings',
    title: 'Meetings',
    value: '18',
    change: '3 today',
    icon: 'video'
  }
]

export const mockActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'post',
    title: 'Sarah Johnson posted a new question',
    description: 'How to integrate third-party APIs?',
    time: '5 minutes ago',
    author: 'Sarah Johnson'
  },
  {
    id: 2,
    type: 'workshop',
    title: 'Workshop "Advanced JavaScript" scheduled',
    description: 'Deep dive into advanced JavaScript design patterns',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'member',
    title: '12 new members joined the community',
    description: 'Welcome to our growing community!',
    time: '3 hours ago'
  }
]
