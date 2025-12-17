import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { VoteButtons } from "@/components/vote-buttons";
import type { Post } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, Share2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface MainPostProps {
  post: Post;
}

export function MainPost({ post }: MainPostProps) {
  // A simple way to count all comments including nested ones
  const countComments = (comments: Post['comments']): number => {
    let count = comments.length;
    for (const comment of comments) {
      if (comment.replies) {
        count += countComments(comment.replies);
      }
    }
    return count;
  };
  const totalComments = countComments(post.comments);

  return (
    <Card className="mb-6 shadow-lg overflow-hidden">
      <div className="flex">
        <div className="hidden sm:flex flex-col items-center p-3 bg-muted/50 w-16">
          <VoteButtons
            itemId={post.id}
            itemType="post"
            initialScore={post.karma}
          />
        </div>
        <div className="flex-grow p-4 sm:p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint="user avatar" />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Posted by u/{post.author.name}</span>
              <span className="mx-1">·</span>
              <span>{post.timestamp}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          </CardHeader>
          <CardContent className="p-0 text-base">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
          <CardFooter className="p-0 pt-4 flex items-center gap-2 sm:gap-4 flex-wrap">
             <div className="sm:hidden">
                <VoteButtons
                    itemId={post.id}
                    itemType="post"
                    initialScore={post.karma}
                />
             </div>
             <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-accent/20">
                <MessageSquare className="h-5 w-5"/>
                <span>{totalComments} Comments</span>
             </Button>
             <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-accent/20">
                <Share2 className="h-5 w-5"/>
                <span>Share</span>
             </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
