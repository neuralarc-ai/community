'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'
import { createClient } from '@/app/lib/supabaseClient'
import GoLiveConfirmationModal from './GoLiveConfirmationModal'

interface CreateWorkshopModalProps {
  onWorkshopCreated: () => void
}

export default function CreateWorkshopModal({ onWorkshopCreated }: CreateWorkshopModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [meetingType, setMeetingType] = useState<'schedule' | 'live'>('schedule')
  const [conclaveType, setConclaveType] = useState<'AUDIO' | 'VIDEO'>('VIDEO')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const [showGoLiveConfirmModal, setShowGoLiveConfirmModal] = useState(false)
  const [currentWorkshopId, setCurrentWorkshopId] = useState<string | null>(null)
  const [currentWorkshopTitle, setCurrentWorkshopTitle] = useState('')
  const [currentWorkshopDescription, setCurrentWorkshopDescription] = useState('')

  const supabase = createClient()

  const handleGoLiveConfirm = () => {
    if (currentWorkshopId) {
      window.location.href = `/conclave/${currentWorkshopId}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let startTime: string
      let status: 'SCHEDULED' | 'LIVE'

      if (meetingType === 'live') {
        // Go live immediately
        startTime = new Date().toISOString()
        status = 'LIVE'
      } else {
        // Schedule for later
        if (!scheduledDate || !scheduledTime) {
          alert('Please select date and time for scheduled meeting')
          setLoading(false)
          return
        }
        startTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        status = 'SCHEDULED'
      }

      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          start_time: startTime,
          status,
          type: conclaveType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create workshop')
      }

      const workshop = await response.json()

      // If going live immediately, open confirmation modal
      if (status === 'LIVE') {
        setCurrentWorkshopId(workshop.id)
        setCurrentWorkshopTitle(title)
        setCurrentWorkshopDescription(description)
        setShowGoLiveConfirmModal(true)
        setOpen(false) // Close the create modal
      } else {
        // Reset form and close modal
        setTitle('')
        setDescription('')
        setScheduledDate('')
        setScheduledTime('')
        setOpen(false)
        onWorkshopCreated()
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
      alert('Failed to create workshop. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#27584F]/80 hover:bg-[#27584F] text-white shadow-sm hover:shadow-[0_0_20px_rgba(39,88,79,0.2)]">
          <Plus size={16} />
          Schedule Conclave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-[#27584F]/30 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <Calendar className="h-5 w-5 text-[#27584F]" />
            Create New Conclave
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Conclave Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Conclave Format</Label>
            <RadioGroup value={conclaveType} onValueChange={(value: 'AUDIO' | 'VIDEO') => setConclaveType(value)} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VIDEO" id="video-type" className="border-[#27584F] text-[#27584F]" />
                <Label htmlFor="video-type" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Video Workshop</span>
                    <span className="text-sm text-muted-foreground">Zoom-style webinar</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AUDIO" id="audio-type" className="border-[#27584F] text-[#27584F]" />
                <Label htmlFor="audio-type" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Audio Space</span>
                    <span className="text-sm text-muted-foreground">Twitter-style space</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Meeting Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Timing</Label>
            <RadioGroup value={meetingType} onValueChange={(value: 'schedule' | 'live') => setMeetingType(value)} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule" id="schedule" className="border-[#27584F] text-[#27584F]" />
                <Label htmlFor="schedule" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Schedule for later</span>
                    <span className="text-sm text-muted-foreground">Set a date & time</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="live" id="live" className="border-[#27584F] text-[#27584F]" />
                <Label htmlFor="live" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Go live now</span>
                    <span className="text-sm text-muted-foreground">Start immediately</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Conclave Title *</Label>
            <Input
              id="title"
              placeholder="Enter conclave title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-[#27584F]/30 focus:ring-[#27584F]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this conclave will cover..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-[#27584F]/30 focus:ring-[#27584F]"
              rows={4}
            />
          </div>

          {/* Date & Time (only for scheduled meetings) */}
          {meetingType === 'schedule' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-background border-[#27584F]/30 focus:ring-[#27584F]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-foreground">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-background border-[#27584F]/30 focus:ring-[#27584F]"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-[#27584F]/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#27584F] hover:bg-[#27584F]/90 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : meetingType === 'live' ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Go Live Now
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Conclave
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

      {/* Go Live Confirmation Modal */}
      {currentWorkshopId && (
        <GoLiveConfirmationModal
          open={showGoLiveConfirmModal}
          onClose={() => setShowGoLiveConfirmModal(false)}
          onConfirm={handleGoLiveConfirm}
          workshopTitle={currentWorkshopTitle}
          workshopDescription={currentWorkshopDescription}
        />
      )}
    </>
  )
}
