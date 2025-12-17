import Link from 'next/link';

interface PostActionsProps {
  commentCount: number;
  onToggleComments?: () => void;
  isExpanded?: boolean;
  postId: string;
}

export default function PostActions({ commentCount, onToggleComments, isExpanded, postId }: PostActionsProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Link
        href={`/posts/${postId}#comments`}
        className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 ease-in-out"
        onClick={(e) => {
          if (onToggleComments) {
            e.preventDefault();
            onToggleComments();
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.756 3 12c0 1.082.288 2.112.792 3.078C3.079 15.553 2.5 17.514 2.5 18s.493 1.5.896 2.053c.338.452.662.836.875 1.134.195.27.319.458.319.458H12Zm0 0l-1.429-9.296m-2.857 5.097H12M12 20.25V12" />
        </svg>

        <span className="font-medium">
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </Link>

      <button className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 ease-in-out">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186A2.25 2.25 0 0 1 5 10.5c-1.102 0-2-.9-2-2.004V5.5A2.25 2.25 0 0 1 5.25 3h5.372c.524 0 1.052.17 1.474.524l4.387 3.681a2.25 2.25 0 0 1 .684 1.62c0 .543-.17 1.08-.496 1.503L12 21.75l-4.706-5.932a2.25 2.25 0 0 1-.58-.894Zm0 0h-2.25m4.318-3.397L10.198 4.42c.43-.384.92-.657 1.445-.767l4.137-.872A2.25 2.25 0 0 1 21 5.495V8.5c0 1.102-.9 2-2.004 2-1.102 0-2-.9-2-2.004V5.5A2.25 2.25 0 0 0 17.75 3h-3.372c-.524 0-1.052-.17-1.474-.524l-4.387-3.681A2.25 2.25 0 0 0 5 1.75c0-.543.17-1.08.496-1.503L12 .25l4.706 5.932a2.25 2.25 0 0 0 .58.894Z" />
        </svg>

        <span className="font-medium hidden sm:inline">Share</span>
      </button>

      <button className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 ease-in-out">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>

        <span className="font-medium hidden sm:inline">More</span>
      </button>
    </div>
  );
}