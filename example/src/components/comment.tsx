'use client';
import { useState } from 'react';
import type { Comment as CommentType } from "@/lib/types";
import { VoteButtons } from "./vote-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, ShieldAlert } from "lucide-react";
import { CommentForm } from "./comment-form";
import { Card } from './ui/card';
import { AnimatePresence, motion } from 'framer-motion';

interface CommentProps {
  comment: CommentType;
  postId: string;
}

export function Comment({ comment, postId }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);

  if (comment.isFlagged) {
    return (
      <Card className="p-4 my-2 bg-destructive/10 border-destructive/20">
        <div className="flex items-center gap-2 text-sm text-destructive font-medium">
          <ShieldAlert className="h-5 w-5" />
          <p>This comment was automatically flagged and is under review.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex gap-3 relative">
        <div className="w-px absolute left-4 top-10 h-[calc(100%-2.5rem)] bg-border hover:bg-primary transition-colors cursor-pointer" />
        <div className="flex flex-col items-center z-10">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} data-ai-hint="user avatar" />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>

      <div className="flex-grow">
        <div className="flex items-center text-sm mb-1">
          <span className="font-semibold text-foreground mr-2">u/{comment.author.name}</span>
          <span className="text-muted-foreground">{comment.timestamp}</span>
        </div>
        <div className="text-base mb-2 text-foreground/90">
          <p>{comment.content}</p>
        </div>
        <div className="flex items-center gap-2">
           <VoteButtons
            itemId={comment.id}
            itemType="comment"
            initialScore={comment.karma}
          />
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => setIsReplying(!isReplying)}>
            <MessageSquare className="h-4 w-4"/>
            <span>Reply</span>
          </Button>
        </div>
        
        <AnimatePresence>
            {isReplying && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                >
                    <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onCommentAdded={() => setIsReplying(false)}
                    />
                </motion.div>
            )}
        </AnimatePresence>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-6">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
