'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/lib/supabaseClient'
import dynamic from 'next/dynamic'

const VodPlayer = dynamic(() => import('@/app/components/VodPlayer'), {
  loading: () => <div className="flex items-center justify-center h-[300px] w-full bg-black text-muted-foreground rounded-xl">Loading Video Player...</div>,
  ssr: false,
})
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function WorkshopWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [workshop, setWorkshop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWorkshop = async () => {
      const { data } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single()

      setWorkshop(data)
      setLoading(false)
    }

    fetchWorkshop()
  }, [id, supabase])

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!workshop) return <div className="flex justify-center items-center h-screen">Conclave not found</div>
  if (!workshop.recording_url) return <div className="flex justify-center items-center h-screen text-center px-4">
    <div>
      <h2 className="text-2xl font-bold mb-2">Recording not available</h2>
      <p className="text-muted-foreground mb-6">The recording for this conclave hasn't been processed yet.</p>
      <Button asChild><Link href="/workshops">Back to Conclave</Link></Button>
    </div>
  </div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/workshops">
            <ChevronLeft size={16} />
            Back to Conclave
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{workshop.title}</h1>
        
        <VodPlayer 
          url={workshop.recording_url} 
          title={workshop.title} 
        />

        <div className="bg-card/50 border border-border p-6 rounded-xl space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{workshop.description}</p>
        </div>
      </div>
    </div>
  )
}

