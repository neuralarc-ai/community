'use client';

import { useState, useTransition } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { handleVote } from '@/app/actions';

interface VoteButtonsProps {
  itemId: string;
  itemType: 'post' | 'comment';
  initialScore: number;
}

export function VoteButtons({ itemId, itemType, initialScore }: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState(initialScore);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const onVote = (newVoteType: 'up' | 'down') => {
    const currentVote = voteStatus;
    const newOptimisticVoteStatus = currentVote === newVoteType ? null : newVoteType;
    setVoteStatus(newOptimisticVoteStatus);

    let scoreModifier = 0;
    if (newOptimisticVoteStatus === 'up') {
      scoreModifier = 1;
    } else if (newOptimisticVoteStatus === 'down') {
      scoreModifier = -1;
    }

    if (currentVote === 'up') {
      scoreModifier -= 1;
    } else if (currentVote === 'down') {
      scoreModifier += 1;
    }
    
    setScore(score + scoreModifier);

    startTransition(async () => {
      await handleVote(itemId, itemType, newOptimisticVoteStatus);
      // In a real-world scenario, you might want to re-fetch data or handle
      // server-side validation errors here, but for now, we trust the optimistic update.
    });
  };

  const voteContainerClass = itemType === 'post' 
    ? "flex flex-col items-center gap-1"
    : "flex items-center gap-1";


  return (
    <div className={voteContainerClass}>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto rounded-full md:rounded-md transition-transform active:scale-125"
        onClick={() => onVote('up')}
        aria-label="Upvote"
      >
        <ArrowUp className={cn('h-5 w-5', voteStatus === 'up' ? 'text-accent fill-accent' : 'text-muted-foreground hover:text-accent')} />
      </Button>
      <span className="text-sm font-bold min-w-[3ch] text-center text-foreground">{score.toLocaleString()}</span>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto rounded-full md:rounded-md transition-transform active:scale-125"
        onClick={() => onVote('down')}
        aria-label="Downvote"
      >
        <ArrowDown className={cn('h-5 w-5', voteStatus === 'down' ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary')} />
      </Button>
    </div>
  );
}
