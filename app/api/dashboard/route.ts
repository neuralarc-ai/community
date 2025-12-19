import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for dashboard stats
    const stats = [
      {
        id: 'total-flux',
        title: 'Total Flux Earned',
        value: 12450,
        unit: '⚡',
        change: '+15%',
        period: 'last month',
      },
      {
        id: 'posts-created',
        title: 'Posts Created',
        value: 120,
        change: '+8%',
        period: 'last month',
      },
      {
        id: 'comments-added',
        title: 'Comments Added',
        value: 340,
        change: '+12%',
        period: 'last month',
      },
      {
        id: 'community-rank',
        title: 'Community Rank',
        value: 12,
        unit: '#',
        change: '-2 positions',
        period: 'last month',
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

