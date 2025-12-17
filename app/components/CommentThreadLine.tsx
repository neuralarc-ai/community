'use client'

interface CommentThreadLineProps {
  depth: number
  isLastReply?: boolean
  className?: string
}

export default function CommentThreadLine({
  depth,
  isLastReply = false,
  className = ""
}: CommentThreadLineProps) {
  if (depth === 0) return null

  return (
    <div
      className={`absolute top-0 w-0.5 bg-gray-200 ${className}`}
      style={{
        left: `${(depth - 1) * 24 + 20}px`, // Adjusted for avatar size and vote column
        height: isLastReply ? 'calc(50% + 1.25rem)' : '100%',
      }}
      aria-hidden="true"
    />
  )
}
