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

  // Use responsive width for thread lines
  const lineWidth = "w-px sm:w-0.5"

  return (
    <div
      className={`absolute left-0 top-0 ${lineWidth} bg-gray-300 ${className}`}
      style={{
        marginLeft: `${depth * 16}px`, // Mobile spacing
        // Extend beyond the comment height to connect to parent
        height: isLastReply ? '50%' : '100%',
      }}
      aria-hidden="true"
    />
  )
}
