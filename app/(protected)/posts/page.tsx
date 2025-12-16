'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { Post } from '@/app/types'
import { MessageCircle, Heart, Reply } from 'lucide-react'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    return post.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading posts...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="page-title mb-2">Community Posts</h1>
            <p className="page-subtitle">Manage and respond to community discussions</p>
          </div>
          <button className="btn-primary self-start">
            New Post
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'unanswered', 'trending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-[var(--accent-yellow)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-50 border border-[var(--border-color)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Posts
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--accent-yellow)] rounded-full flex items-center justify-center font-semibold text-[var(--text-primary)] flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[var(--text-primary)] truncate">{post.author}</h4>
                    <span className="text-sm text-[var(--text-muted)]">{post.time}</span>
                  </div>
                </div>
                <span className="badge self-start">
                  {post.category}
                </span>
              </div>

              <h3 className="card-title mb-3">{post.title}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{post.content}</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.replies} replies</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Heart size={18} />
                    <span className="text-sm">{post.likes} likes</span>
                  </div>
                </div>
                <button className="btn-secondary self-start">
                  <Reply size={16} />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
