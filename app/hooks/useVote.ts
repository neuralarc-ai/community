import { useState } from 'react';

interface UseVoteProps {
  initialVote: -1 | 0 | 1;
  initialScore: number;
  postId: string;
}

export function useVote({ initialVote, initialScore, postId }: UseVoteProps) {
  const [currentVote, setCurrentVote] = useState<(-1 | 0 | 1)>(initialVote);
  const [currentScore, setCurrentScore] = useState<number>(initialScore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (type: 'up' | 'down') => {
    setIsLoading(true);
    setError(null);

    const newVoteValue = type === 'up' ? 1 : -1;
    let optimisticVoteChange = 0;
    let optimisticScoreChange = 0;

    if (currentVote === newVoteValue) {
      // User is toggling off their existing vote
      optimisticVoteChange = 0 - currentVote;
      optimisticScoreChange = -currentVote;
    } else if (currentVote === 0) {
      // User is casting a new vote
      optimisticVoteChange = newVoteValue;
      optimisticScoreChange = newVoteValue;
    } else {
      // User is switching their vote (up to down, or down to up)
      optimisticVoteChange = newVoteValue - currentVote;
      optimisticScoreChange = newVoteValue - currentVote;
    }

    // Optimistically update UI
    setCurrentVote((prev) => (prev === newVoteValue ? 0 : newVoteValue));
    setCurrentScore((prev) => prev + optimisticScoreChange);

    try {
      const res = await fetch('/api/posts/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, voteType: type }),
      });

      if (!res.ok) {
        throw new Error('Failed to cast vote');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Revert optimistic updates if API fails
      setCurrentVote(initialVote);
      setCurrentScore(initialScore);
    } finally {
      setIsLoading(false);
    }
  };

  return { currentVote, currentScore, handleVote, isLoading, error };
}

