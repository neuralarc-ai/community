import Avatar from './Avatar';

interface PostAuthorRowProps {
  author: string;
  avatarUrl: string | null | undefined;
  postedTime: string;
}

export default function PostAuthorRow({ author, avatarUrl, postedTime }: PostAuthorRowProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Avatar src={avatarUrl} alt={`${author}'s avatar`} size={24} />
      <span className="font-semibold text-gray-800">{author}</span>
      <span className="text-gray-500">•</span>
      <span className="text-gray-500">{postedTime}</span>
    </div>
  );
}


