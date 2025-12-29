'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Tag, Type, AlignLeft, ChevronLeft, Image as ImageIcon, X } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/components/ui/use-toast'
import { uploadPostImages } from '@/app/lib/uploadPostImages';
import { createClient } from '@/app/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreatePostDialog({ isOpen, onClose, onPostCreated }: CreatePostDialogProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File }>>([]);
  const [previews, setPreviews] = useState<Array<{ id: string; url: string }>>([]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false) // New state for drag-and-drop
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Cleanup object URLs when component unmounts or previews change
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | React.DragEvent<HTMLFormElement>) => {
    const files = (e.type === 'drop') ? (e as React.DragEvent<HTMLDivElement>).dataTransfer.files : (e as React.ChangeEvent<HTMLInputElement>).target.files;

    if (files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/')); // Filter for image files
      
      // Enforce max 3 images
      if (selectedFiles.length + newFiles.length > 3) {
        toast({
          title: "Too many images",
          description: "You can only upload a maximum of 3 images per post.",
          variant: "destructive",
        })
        return
      }

      const filesWithIds = newFiles.map(file => ({ id: crypto.randomUUID(), file }));
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithIds]);
      const newPreviews = filesWithIds.map(item => ({ id: item.id, url: URL.createObjectURL(item.file) }));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  }

  const handleRemoveImage = (idToRemove: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((item) => item.id !== idToRemove));
    setPreviews((prevPreviews) => {
      const previewToRemove = prevPreviews.find(item => item.id === idToRemove);
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.url); // Clean up memory
      }
      return prevPreviews.filter((item) => item.id !== idToRemove);
    });
  }

  const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e); // Reuse existing file select logic
  };

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
        imageUrls = await uploadPostImages(user.id, selectedFiles.map(item => item.file));
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
          image_urls: imageUrls,
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
      
      onPostCreated?.(); // Notify parent that post was created
      onClose(); // Close the dialog
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[700px] p-0 bg-background/90 backdrop-blur-lg border border-white/10 rounded-2xl">
        <DialogHeader className="p-4 sm:p-6 border-b border-white/10 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create New Post</DialogTitle>
        </DialogHeader>
        <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-10">
                <Card className="bg-card/40 backdrop-blur-md border border-white/5 overflow-hidden shadow-2xl hover:border-yellow-500/30 transition-all duration-300">
                    <CardContent className="p-4 sm:p-10 relative">
                        <form 
                            onSubmit={handleSubmit} 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`space-y-8 font-manrope ${dragActive ? 'border-2 border-dashed border-yellow-500/50 rounded-xl' : ''}`}
                        >
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
                                    {previews.map((item) => (
                                      <div key={item.id} className="relative rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                        <Image src={item.url} alt={`Preview ${item.id}`} fill className="object-cover" unoptimized={true} />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveImage(item.id)}
                                          className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                                        >
                                          <X className="w-8 h-8" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Title Field */}
                                <div className="space-y-4">
                                    <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                        <Type className="w-8 h-8 text-yellow-500" />
                                        Title <span className="text-transparent"></span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope"
                                            placeholder="Enter your post title..."
                                        />
                                    </div>
                                </div>

                                {/* Body Field */}
                                <div className="space-y-4">
                                    <label htmlFor="body" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                        <AlignLeft className="w-8 h-8 text-yellow-500" />
                                        Body <span className="text-yellow-500/50"></span>
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            id="body"
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all resize-none leading-relaxed group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope"
                                        placeholder="Start a new post..."
                                    />
                                    </div>
                                </div>

                                {/* Tags Field */}
                                <div className="space-y-4">
                                    <label htmlFor="tags" className="flex items-center gap-2 text-sm font-bold text-white/90 ml-1 uppercase tracking-wider font-heading">
                                        <Tag className="w-8 h-8 text-yellow-500" />
                                        Tags <span className="text-muted-foreground/50 font-normal text-xs lowercase italic">(optional)</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            id="tags"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-inner font-manrope"
                                            placeholder="e.g., general, question, feedback"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground/60 ml-2 italic">
                                        Separate multiple tags with commas
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-6 border-t border-white/10 mt-6">
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
                                    className="text-muted-foreground hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
                                    style={{ backgroundColor: selectedFiles.length > 0 ? '#e6b31c' : '' }}
                                >
                                    <ImageIcon className={cn("w-8 h-8", selectedFiles.length > 0 ? 'text-black' : 'text-yellow-500')} />
                                </Button>
                                <Button variant="ghost" type="button" onClick={onClose} className="text-muted-foreground hover:text-white hover:bg-white/5 px-6 py-3 rounded-xl transition-all font-manrope">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || (!title.trim() && !body.trim() && selectedFiles.length === 0)}
                                    className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-base rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.25)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] font-manrope"
                                    style={{ backgroundColor: '#e6b31c', color: 'black' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            <span>Posting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-8 h-8" />
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
      </DialogContent>
    </Dialog>
  )
}
