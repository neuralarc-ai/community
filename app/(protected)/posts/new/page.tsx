'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Tag, Type, AlignLeft, ChevronLeft } from 'lucide-react'
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
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.back()}
                  className="p-3 rounded-full bg-white/5 hover:bg-yellow-500/20 text-muted-foreground hover:text-white transition-all border border-white/5 shadow-lg group"
                >
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-4xl font-heading font-bold text-white tracking-tight mb-1">Create New Post</h1>
                  <p className="text-lg text-muted-foreground">Share your thoughts, questions, or ideas with the community.</p>
                </div>
              </div>
            </div>

            <Card className="bg-card/40 backdrop-blur-md border border-white/5 overflow-hidden shadow-2xl hover:border-yellow-500/30 transition-all duration-300">
                <div className="h-24 bg-yellow-500/10 relative border-b border-yellow-500/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
                </div>
                <CardContent className="p-10 relative">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-10">
                            {/* Title Field */}
                            <div className="space-y-4">
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                    <Type size={14} className="text-yellow-500" />
                                    Title <span className="text-yellow-500/50">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner"
                                        placeholder="Enter your post title..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Body Field */}
                            <div className="space-y-4">
                                <label htmlFor="body" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                    <AlignLeft size={14} className="text-yellow-500" />
                                    Body <span className="text-yellow-500/50">*</span>
                                </label>
                                <div className="relative group">
                                    <textarea
                                        id="body"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={12}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all resize-vertical leading-relaxed group-hover:bg-white/10 group-hover:border-white/20 shadow-inner"
                                        placeholder="Write your post content here..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tags Field */}
                            <div className="space-y-4">
                                <label htmlFor="tags" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                    <Tag size={14} className="text-yellow-500" />
                                    Tags <span className="text-muted-foreground/50 font-normal text-xs lowercase italic">(optional)</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="tags"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner"
                                        placeholder="e.g., general, question, feedback"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground/60 ml-2 italic">
                                    Separate multiple tags with commas
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-10 flex items-center justify-end gap-6 border-t border-white/10 mt-6">
                            <Link href="/posts">
                                <Button variant="ghost" type="button" className="text-muted-foreground hover:text-white hover:bg-white/5 px-8 py-6 rounded-2xl transition-all">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="px-12 py-7 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.25)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-all flex items-center gap-4 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={24} />
                                        <span>Create Post</span>
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
