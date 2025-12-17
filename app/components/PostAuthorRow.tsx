import Image from 'next/image';

interface PostAuthorRowProps {
  author: string;
  avatarUrl: string;
  postedTime: string;
}

export default function PostAuthorRow({ author, avatarUrl, postedTime }: PostAuthorRowProps) {
  const defaultAvatar = '/file.svg'; // Using a default placeholder avatar

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className="relative w-6 h-6 rounded-full overflow-hidden">
        <Image
          src={avatarUrl || defaultAvatar}
          alt={`${author}'s avatar`}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <span className="font-semibold text-gray-800">{author}</span>
      <span className="text-gray-500">•</span>
      <span className="text-gray-500">{postedTime}</span>
    </div>
  );
}

