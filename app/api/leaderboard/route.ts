import { NextRequest, NextResponse } from 'next/server';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

export async function GET(request: NextRequest) {
  try {
    const leaderboard = [
      {
        id: '1',
        rank: 1,
        username: 'shannon_kautzer',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        flux: 1671.57,
        activity: 'Increased Flux by 1.2%',
      },
      {
        id: '2',
        rank: 2,
        username: 'marion_stiedemann',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        flux: 1671.57,
        activity: 'Posted a new discussion',
      },
      {
        id: '3',
        rank: 3,
        username: 'billy_mraz',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        flux: 1671.57,
        activity: 'Commented on a post',
      },
      {
        id: '4',
        rank: 4,
        username: 'arthur_grimes',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        flux: 1200.00,
        activity: 'Earned 50 Flux',
      },
      {
        id: '5',
        rank: 5,
        username: 'alberta_spencer',
        avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        flux: 1100.00,
        activity: 'Joined a conclave',
      },
      {
        id: '6',
        rank: 6,
        username: 'leo_roecker',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        flux: 950.00,
        activity: 'Created a workshop',
      },
      {
        id: '7',
        rank: 7,
        username: 'rudolph_boehm',
        avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        flux: 800.00,
        activity: 'Participated in a meeting',
      },
    ];

    const recentActivity = [
      {
        id: '1',
        username: 'shannon_kautzer',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        action: 'posted a new discussion',
        fluxGained: 10,
        timestamp: '2 minutes ago',
      },
      {
        id: '2',
        username: 'marion_stiedemann',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        action: 'commented on a post',
        fluxGained: 5,
        timestamp: '5 minutes ago',
      },
      {
        id: '3',
        username: 'billy_mraz',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        action: 'joined the community',
        fluxGained: 20,
        timestamp: '15 minutes ago',
      },
      {
        id: '4',
        username: 'arthur_grimes',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        action: 'earned a badge',
        fluxGained: 25,
        timestamp: '1 hour ago',
      },
      {
        id: '5',
        username: 'alberta_spencer',
        avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        action: 'created a new workshop',
        fluxGained: 50,
        timestamp: '2 hours ago',
      },
    ];

    const successResponse = NextResponse.json({ leaderboard, recentActivity });
    return setCorsHeaders(request, successResponse);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
