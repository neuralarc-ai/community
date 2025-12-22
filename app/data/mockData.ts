// Mock data for dashboard and events (keeping for backward compatibility)
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
