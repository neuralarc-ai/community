import { useState } from 'react';

interface UseVoteProps {
  initialVote: -1 | 0 | 1;
  initialScore: number;
  postId: string;
  onVoteSuccess?: (newScore: number, newVote: -1 | 0 | 1) => void; // New optional callback
}

export function useVote({ initialVote, initialScore, postId, onVoteSuccess }: UseVoteProps) {
  const [currentVote, setCurrentVote] = useState<(-1 | 0 | 1)>(initialVote);
  const [currentScore, setCurrentScore] = useState<number>(initialScore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (clickedVoteType: 'up' | 'down') => {
    setIsLoading(true);
    setError(null);

    // 1. Determine the numeric value of the button clicked
    const voteValue = clickedVoteType === 'up' ? 1 : -1;

    // 2. Calculate the NEW vote status (Toggle Logic)
    const newVoteStatus: -1 | 0 | 1 = (currentVote === voteValue) ? 0 : voteValue;

    // 3. Calculate the Delta
    const scoreDelta = newVoteStatus - currentVote;

    // 4. Update UI Optimistically
    setCurrentVote(newVoteStatus);
    setCurrentScore((prevScore) => prevScore + scoreDelta);

    try {
      const res = await fetch('/api/posts/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, voteType: clickedVoteType }), // Send the original clicked type to the backend
      });

      if (!res.ok) {
        throw new Error('Failed to cast vote');
      }
      onVoteSuccess?.(currentScore, newVoteStatus); // Call the callback with updated score and vote status
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

