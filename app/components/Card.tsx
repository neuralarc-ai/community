import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}
