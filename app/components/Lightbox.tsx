'use client'

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // ADD THIS LINE // Import React as well for custom component

interface LightboxProps {
  imageUrls: string[]; // Changed from src: string | null
  currentImageIndex: number; // Added
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void; // Added
  onNext: () => void; // Added
}

export default function Lightbox({
  imageUrls, // Changed from src
  currentImageIndex, // Added
  isOpen,
  onClose,
  onPrevious, // Added
  onNext, // Added
}: LightboxProps) {
  if (!isOpen || imageUrls.length === 0) return null; // Only render if open and images exist

  const currentSrc = imageUrls[currentImageIndex];
  const showNavigation = imageUrls.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose} // Close on backdrop click
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        &times;
      </button>

      {/* Previous Button */}
      {showNavigation && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrevious(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image */}
      <img
        src={currentSrc}
        alt={`Full screen image ${currentImageIndex + 1}`}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      />

      {/* Next Button */}
      {showNavigation && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}

