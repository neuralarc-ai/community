'use client'

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/app/components/ui/dialog'
import Image from 'next/image'

interface LightboxProps {
  src: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Lightbox({ src, isOpen, onClose }: LightboxProps) {
  if (!src) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-50 bg-black/90" />
      <DialogContent className="z-50 flex items-center justify-center p-0 border-none bg-transparent shadow-none max-w-full max-h-full w-fit h-fit">
        <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          X
        </button>
        <img
          src={src}
          alt="Lightbox Image"
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}

