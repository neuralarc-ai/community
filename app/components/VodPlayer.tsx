'use client'

import { Card } from '@/app/components/ui/card'

interface VodPlayerProps {
  url: string
  title: string
}

export default function VodPlayer({ url, title }: VodPlayerProps) {
  return (
    <Card className="overflow-hidden border-border bg-black rounded-xl aspect-video relative group">
      <video
        src={url}
        controls
        className="w-full h-full object-contain"
        poster="/placeholder-video-thumbnail.jpg" // You can add a default poster
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Recording: {title}
      </div>
    </Card>
  )
}

