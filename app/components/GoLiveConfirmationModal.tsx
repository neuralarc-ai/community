'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface GoLiveConfirmationModalProps {
  workshopTitle: string
  workshopDescription: string
  onConfirm: () => void
  onClose: () => void
  open: boolean
}

export default function GoLiveConfirmationModal({
  workshopTitle,
  workshopDescription,
  onConfirm,
  onClose,
  open,
}: GoLiveConfirmationModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-[#27584F]/30 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <Zap className="h-5 w-5 text-[#27584F]" />
            Go Live with Conclave?
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            You are about to start the conclave: <span className="font-medium text-white">{workshopTitle}</span>.
            Once live, participants will be able to join.
          </p>
          <p className="text-sm text-muted-foreground">
            Description: <span className="font-medium text-white">{workshopDescription || 'No description provided.'}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to go live now?
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-[#27584F]/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-[#27584F] hover:bg-[#27584F]/90 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Going Live...
              </div>
            ) : (
              'Go Live'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

