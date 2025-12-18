// Mock data for dashboard and events (keeping for backward compatibility)
export const mockStats = [
  {
    id: '1',
    title: 'Total Members',
    value: '1,234',
    change: '+12%',
    icon: 'Users'
  },
  {
    id: '2',
    title: 'Active Discussions',
    value: '89',
    change: '+5%',
    icon: 'MessageSquare'
  },
  {
    id: 'conclaves',
    title: 'Conclave This Month',
    value: '12',
    change: '+8%',
    icon: 'Presentation'
  },
  {
    id: '4',
    title: 'Meetings Scheduled',
    value: '6',
    change: '+2%',
    icon: 'Video'
  },
  {
    id: '5',
    title: 'Total Likes',
    value: '5,432',
    change: '+15%',
    icon: 'Heart'
  },
  {
    id: '6',
    title: 'Total Comments',
    value: '2,105',
    change: '+10%',
    icon: 'MessageSquare'
  },
  {
    id: '7',
    title: 'Posts Shared',
    value: '876',
    change: '+7%',
    icon: 'Share2'
  },
  {
    id: '8',
    title: 'Posts Saved',
    value: '1,502',
    change: '+18%',
    icon: 'Bookmark'
  }
]

export const mockActivity = [
  {
    id: 1,
    type: 'post' as const,
    title: 'New community guidelines discussion',
    description: 'Sarah Johnson started a discussion about updating our community guidelines',
    time: '5 minutes ago',
    author: 'Sarah Johnson'
  },
  {
    id: 2,
    type: 'workshop' as const,
    title: 'React Advanced Patterns Conclave',
    description: 'Mike Chen is hosting a conclave on advanced React patterns',
    time: '1 hour ago',
    author: 'Mike Chen'
  },
  {
    id: 3,
    type: 'meeting' as const,
    title: 'Monthly Community Sync',
    description: 'Monthly community meeting to discuss upcoming events',
    time: '2 hours ago'
  },
  {
    id: 4,
    type: 'member' as const,
    title: 'New member joined',
    description: 'Welcome Alex Rodriguez to our community!',
    time: '3 hours ago',
    author: 'Alex Rodriguez'
  }
]

export const mockWorkshops = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    description: 'Learn advanced React patterns and best practices for building scalable applications.',
    date: '2024-02-15',
    time: '14:00',
    duration: 120,
    maxParticipants: 50,
    enrolled: 32,
    link: 'https://meet.google.com/workshop1'
  },
  {
    id: 2,
    title: 'Database Design Fundamentals',
    description: 'Understanding database design principles and normalization techniques.',
    date: '2024-02-20',
    time: '10:00',
    duration: 90,
    maxParticipants: 40,
    enrolled: 28,
    link: 'https://meet.google.com/workshop2'
  }
]

export const mockMeetings = [
  {
    id: 1,
    title: 'Monthly Community Sync',
    agenda: 'Discuss community updates, upcoming events, and gather feedback',
    date: '2024-02-10',
    time: '15:00',
    duration: 60,
    type: 'general' as const,
    link: 'https://meet.google.com/meeting1'
  },
  {
    id: 2,
    title: 'Technical Team Standup',
    agenda: 'Review current projects, blockers, and next steps',
    date: '2024-02-12',
    time: '09:00',
    duration: 30,
    type: 'team' as const,
    link: 'https://meet.google.com/meeting2'
  }
]
