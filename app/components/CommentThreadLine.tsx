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
      className={`absolute top-0 left-0 bottom-0 w-0.5 bg-gray-200 ml-[-26px] sm:ml-[-30px] ${className}`}
      style={{
        height: isLastReply ? 'calc(50% + 1.25rem)' : '100%',
      }}
      aria-hidden="true"
    />
  )
}
