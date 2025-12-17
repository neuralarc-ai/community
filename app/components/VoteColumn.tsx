import VoteButton from './VoteButton';

interface VoteColumnProps {
  targetType: 'post' | 'comment';
  targetId: string;
  initialScore: number;
  userVote: -1 | 0 | 1;
  onVoteChange: (newScore: number, newUserVote: -1 | 0 | 1) => void;
  orientation?: 'vertical' | 'horizontal'; // Added orientation prop
}

export default function VoteColumn({
  targetType,
  targetId,
  initialScore,
  userVote,
  onVoteChange,
  orientation = 'vertical',
}: VoteColumnProps) {
  const containerClasses = orientation === 'vertical'
    ? "flex flex-col items-center py-2" // Removed bg-gray-50 and w-10 (width handled by parent)
    : "flex items-center space-x-1";

  return (
    <div className={containerClasses}>
      <VoteButton
        targetType={targetType}
        targetId={targetId}
        initialScore={initialScore}
        userVote={userVote}
        onVoteChange={onVoteChange}
        orientation={orientation}
      />
    </div>
  );
}