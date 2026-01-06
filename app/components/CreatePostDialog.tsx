"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Send,
  Type,
  AlignLeft,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { uploadPostImages } from "@/app/lib/uploadPostImages";
import { createClient } from "@/app/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreatePostDialog({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ id: string; file: File }>
  >([]);
  const [previews, setPreviews] = useState<Array<{ id: string; url: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    const files = "dataTransfer" in e ? e.dataTransfer.files : e.target.files;
    if (!files) return;

    const newImages = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (selectedFiles.length + newImages.length > 3) {
      toast({
        title: "Limit reached",
        description: "Maximum 3 images allowed per post.",
        variant: "destructive",
      });
      return;
    }

    const newEntries = newImages.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));

    setSelectedFiles((prev) => [...prev, ...newEntries]);
    setPreviews((prev) => [
      ...prev,
      ...newEntries.map((entry) => ({
        id: entry.id,
        url: URL.createObjectURL(entry.file),
      })),
    ]);
  };

  const handleRemoveImage = (id: string) => {
    setSelectedFiles((prev) => prev.filter((i) => i.id !== id));
    setPreviews((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim() && selectedFiles.length === 0) {
      setError("Add a title, text, or at least one image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        toast({ title: "Uploading images..." });
        imageUrls = await uploadPostImages(
          session.user.id,
          selectedFiles.map((i) => i.file)
        );
        toast({ title: "Images uploaded!" });
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          image_urls: imageUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      toast({ title: "Post created successfully!" });
      setTitle("");
      setBody("");
      setTags("");
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onPostCreated?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-2xl border border-foreground/10 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col ">
        <DialogHeader className="px-8 pt-8 pb-4 flex-shrink-0">
          <DialogTitle className="text-3xl font-bold text-yellow tracking-tight">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pb-6 custom-scrollbar">
          <Card className="bg-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-inner">
            <CardContent className="p-8">
              <form
                onSubmit={handleSubmit}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="space-y-8"
              >
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Drag & Drop + Image Previews */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl transition-all duration-300",
                    dragActive
                      ? "border-yellow-500/70 bg-yellow-500/5 scale-[1.01]"
                      : "border-foreground/20 bg-foreground/5",
                    previews.length > 0 && "border-0 bg-transparent"
                  )}
                >
                  {previews.length === 0 ? (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center py-12 cursor-pointer"
                    >
                      <ImageIcon
                        className="w-16 h-16 text-yellow-500 mb-4"
                        strokeWidth={1.5}
                      />
                      <p className="text-lg font-medium text-yellow">
                        Drop images here or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Up to 3 images (PNG, JPG, GIF)
                      </p>
                    </label>
                  ) : (
                    <div
                      className={cn(
                        "grid gap-4 p-4",
                        previews.length === 1 && "grid-cols-1",
                        previews.length === 2 && "grid-cols-2",
                        previews.length === 3 && "grid-cols-2",
                        previews.length === 3 && "[&>:last-child]:col-span-2"
                      )}
                    >
                      {previews.map((preview, idx) => (
                        <div
                          key={preview.id}
                          className={cn(
                            "relative rounded-xl overflow-hidden shadow-lg aspect-video",
                            previews.length === 3 &&
                              idx === 2 &&
                              "col-span-2 aspect-[2/1]"
                          )}
                        >
                          <Image
                            src={preview.url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(preview.id)}
                            className="absolute top-3 right-3 p-2 bg-background/70 rounded-full hover:bg-red-600 transition"
                          >
                            <X className="w-5 h-5 text-yellow" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-yellow/80">
                    <Type className="w-6 h-6 text-yellow-500" />
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a catchy title..."
                    className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-xl text-yellow text-lg placeholder:text-yellow/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all"
                  />
                </div>

                {/* Body */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-yellow/80">
                    <AlignLeft className="w-6 h-6 text-yellow-500" />
                    Content
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder="Share your thoughts..."
                    className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-xl text-yellow placeholder:text-yellow/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent resize-none transition-all leading-relaxed"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-yellow/80">
                    <Tag className="w-6 h-6 text-yellow-500" />
                    Tags{" "}
                    <span className="lowercase font-normal text-yellow/50">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. tech, design, feedback"
                    className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-xl text-yellow placeholder:text-yellow/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-yellow/50 ml-1">
                    Separate with commas
                  </p>
                </div>

                {/* Actions - always visible at bottom */}
                <div className="flex items-center justify-between pt-6 border-t border-foreground/10">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-foreground/20 hover:bg-foreground/10"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Add Images ({selectedFiles.length}/3)
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        loading ||
                        (!title.trim() &&
                          !body.trim() &&
                          selectedFiles.length === 0)
                      }
                      className="bg-yellow-500 hover:bg-yellow-400  text-background font-semibold px-8 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all"
                    >
                      {loading ? (
                        <>Posting...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Create Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
