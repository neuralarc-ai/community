import VoteButton from './VoteButton';

interface VoteColumnProps {
  targetType: 'post' | 'comment';
  targetId: string;
  initialScore: number;
  userVote: -1 | 0 | 1;
  onVoteChange: (newScore: number, newUserVote: -1 | 0 | 1) => void;
}

export default function VoteColumn({ targetType, targetId, initialScore, userVote, onVoteChange }: VoteColumnProps) {
  return (
    <div className="flex flex-col items-center p-2 rounded-l-md bg-gray-50">
      <VoteButton
        targetType={targetType}
        targetId={targetId}
        initialScore={initialScore}
        userVote={userVote}
        onVoteChange={onVoteChange}
      />
    </div>
  );
}

