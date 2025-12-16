import { NextRequest, NextResponse } from 'next/server'
import { mockPosts } from '@/app/data/mockData'
import { Post } from '@/app/types'

export async function GET() {
  try {
    return NextResponse.json(mockPosts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newPost: Post = {
      id: mockPosts.length + 1,
      author: body.author || 'Community Manager',
      avatar: body.avatar || 'CM',
      time: 'Just now',
      category: (body.category || 'general') as Post['category'],
      title: body.title,
      content: body.content,
      replies: 0,
      likes: 0,
      status: 'all' as const
    }

    mockPosts.unshift(newPost)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
