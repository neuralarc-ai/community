'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  accentColor: string // e.g., "orange-500", "green-500"
  className?: string
}

export default function ChartCard({ title, icon: Icon, children, accentColor, className }: ChartCardProps) {
  return (
    <Card className={cn(
      `bg-card/30 backdrop-blur-sm border-${accentColor}/20 overflow-hidden hover:border-${accentColor}/30 transition-colors duration-300 hover:shadow-[0_0_30px_theme('colors.orange.500')/5]`,
      className
    )}>
      <CardHeader className="px-6 pt-6 pb-4 border-b border-white/5 flex flex-row items-center gap-3">
        <div className={`p-2 bg-${accentColor}/10 rounded-lg border border-${accentColor}/20`}>
          <Icon className={`w-5 h-5 text-${accentColor}`} />
        </div>
        <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {children}
      </CardContent>
    </Card>
  )
}

