import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: number; // size in pixels
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 28, className }) => {
  // Use UI Avatars service as a fallback if no source is provided
  // Monochrome: White background, Black text
  const avatarSrc = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=FFFFFF&color=000000&size=${size}`;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full ${className || ''}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarSrc}
        alt={alt || 'Avatar'}
        fill
        className="rounded-full object-cover grayscale"
        sizes={`${size}px`}
        unoptimized={!src} // Skip optimization for external fallback URLs if needed
      />
    </div>
  );
};

export default Avatar;
