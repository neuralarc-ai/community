"use client";

import { useState, useRef, useEffect } from "react";
import type { Comment } from "@/app/types";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCommentAdded?: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  postId,
  parentCommentId,
  onCommentAdded,
  onCancel,
  placeholder,
  autoFocus = false,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder = parentCommentId
    ? "Write a reply..."
    : "Write a comment...";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  // Optional: Auto-focus when component mounts (useful for reply forms)
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          body: trimmedBody,
          parent_comment_id: parentCommentId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to post comment");
      }

      const newComment: Comment = await response.json();
      setBody("");
      onCommentAdded?.(newComment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !body.trim() || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={finalPlaceholder}
          rows={4}
          disabled={isSubmitting}
          aria-label="Comment input"
          className="w-full min-h-[100px] max-h-96 px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none overflow-y-auto leading-relaxed transition-all scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
          required
        />

        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 items-center">
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="px-5 py-2 bg-yellow-600 text-primary-foreground font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Posting..." : parentCommentId ? "Reply" : "Comment"}
        </button>
      </div>
    </form>
  );
}
