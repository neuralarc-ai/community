import React, { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: number; // size in pixels
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 28, className }) => {
  const [imageError, setImageError] = useState(false);

  // Use UI Avatars service as a fallback if no source is provided or if there's an error
  const avatarSrc = (!src || imageError)
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=FFFFFF&color=000000&size=${size}`
    : src;

  // Check if it's an SVG to use unoptimized
  const isSvg = avatarSrc.includes('.svg') || avatarSrc.includes('dicebear.com') || avatarSrc.includes('data:image/svg+xml');

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <div
      className={`relative flex-shrink-0 rounded-full bg-muted ${className || ''}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarSrc}
        alt={alt || 'Avatar'}
        fill
        className="rounded-full object-cover"
        sizes={`${size}px`}
        unoptimized={isSvg}
        onError={handleImageError}
      />
    </div>
  );
};

export default Avatar;
