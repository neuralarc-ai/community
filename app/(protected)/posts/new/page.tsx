'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Tag, Type, AlignLeft } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      router.push('/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link
                    href="/posts"
                    className="text-muted-foreground hover:text-white flex items-center gap-2 text-sm font-medium transition-colors w-fit group mb-4"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Posts
                </Link>
                <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Create New Post</h1>
                <p className="text-lg text-muted-foreground">Share your thoughts, questions, or ideas with the community.</p>
            </div>

            <Card className="bg-card/40 backdrop-blur-md border border-white/5 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Title Field */}
                            <div className="space-y-2">
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-white/80 ml-1">
                                    <Type size={14} className="text-muted-foreground" />
                                    Title <span className="text-white/30">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all group-hover:border-white/20"
                                        placeholder="Enter your post title..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Body Field */}
                            <div className="space-y-2">
                                <label htmlFor="body" className="flex items-center gap-2 text-sm font-medium text-white/80 ml-1">
                                    <AlignLeft size={14} className="text-muted-foreground" />
                                    Body <span className="text-white/30">*</span>
                                </label>
                                <div className="relative group">
                                    <textarea
                                        id="body"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all resize-vertical leading-relaxed group-hover:border-white/20"
                                        placeholder="Write your post content here..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tags Field */}
                            <div className="space-y-2">
                                <label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium text-white/80 ml-1">
                                    <Tag size={14} className="text-muted-foreground" />
                                    Tags <span className="text-muted-foreground/50 font-normal">(optional)</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="tags"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all group-hover:border-white/20"
                                        placeholder="e.g., general, question, feedback"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    Separate multiple tags with commas
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-white/5">
                            <Link href="/posts">
                                <Button variant="ghost" type="button" className="text-muted-foreground hover:text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="px-8 bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} className="mr-2" />
                                        Create Post
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
