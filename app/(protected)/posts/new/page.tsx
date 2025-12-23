'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Tag, Type, AlignLeft, ChevronLeft, Image as ImageIcon, X } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/components/ui/use-toast'
import { uploadPostImages } from '@/app/lib/uploadPostImages'; // Import the new helper function
import { createClient } from '@/app/lib/supabaseClient'; // Import Supabase client to get user ID

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      // Enforce max 3 images
      if (selectedFiles.length + newFiles.length > 3) {
        toast({
          title: "Too many images",
          description: "You can only upload a maximum of 3 images per post.",
          variant: "destructive",
        })
        return
      }

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
    setPreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[indexToRemove]) // Clean up memory
      return prevPreviews.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation: Ensure content OR images exist
    if (!title.trim() && !body.trim() && selectedFiles.length === 0) {
      setError('Please provide content or at least one image for your post.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated.');
      }

      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        toast({
          title: "Uploading images...",
          description: "Please wait while your images are being uploaded.",
        });
        imageUrls = await uploadPostImages(user.id, selectedFiles);
        toast({
            title: "Images uploaded!",
            description: `${imageUrls.length} image(s) uploaded successfully.`,
        });
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          image_urls: imageUrls, // Pass the image URLs to the backend
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      toast({
        title: "Post created!",
        description: "Your post has been successfully published.",
      });

      // Cleanup
      setTitle('');
      setBody('');
      setTags('');
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
      
      router.push('/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error creating post",
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: "destructive",
      });
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
                    <form onSubmit={handleSubmit} className="space-y-8 font-manrope"> {/* Added font-manrope */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-10">
                            {/* Image Preview Area */}
                            {previews.length > 0 && (
                              <div className="grid gap-4 mb-4" style={{
                                gridTemplateColumns: previews.length === 1 ? '1fr' : previews.length === 2 ? '1fr 1fr' : '3fr 2fr'
                              }}>
                                {previews.map((src, index) => (
                                  <div key={index} className="relative rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                    <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover max-h-[300px]" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Title Field */}
                            <div className="space-y-4">
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                    <Type size={14} className="text-yellow-500" />
                                    Title <span className="text-yellow-500/50"></span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope" // Added font-manrope
                                        placeholder="Enter your post title..."
                                    />
                                </div>
                            </div>

                            {/* Body Field */}
                            <div className="space-y-4">
                                <label htmlFor="body" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                    <AlignLeft size={14} className="text-yellow-500" />
                                    Body <span className="text-yellow-500/50"></span>
                                </label>
                                <div className="relative group">
                                    <textarea
                                        id="body"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={12}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all resize-vertical leading-relaxed group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope" // Added font-manrope
                                        placeholder="Write your post content here..."
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
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope" // Added font-manrope
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
                            <input
                              type="file"
                              ref={fileInputRef}
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-muted-foreground hover:text-white hover:bg-white/5 px-4 py-6 rounded-2xl transition-all"
                                style={{ backgroundColor: selectedFiles.length > 0 ? '#e6b31c' : '' }} // Highlight if images selected
                            >
                                <ImageIcon size={24} className={selectedFiles.length > 0 ? 'text-black' : 'text-yellow-500'} />
                            </Button>
                            <Link href="/posts">
                                <Button variant="ghost" type="button" className="text-muted-foreground hover:text-white hover:bg-white/5 px-8 py-6 rounded-2xl transition-all font-manrope"> {/* Added font-manrope */}
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={loading || (!title.trim() && !body.trim() && selectedFiles.length === 0)}
                                className="px-12 py-7 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.25)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-all flex items-center gap-4 active:scale-[0.98] font-manrope" // Added font-manrope and primary color
                                style={{ backgroundColor: '#e6b31c', color: 'black' }} // Ensure primary color
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
