import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: number; // size in pixels
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 28 }) => {
  // Use UI Avatars service as a fallback if no source is provided
  // It generates an image with the user's initials
  const avatarSrc = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=facc15&color=000000&size=${size}`;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarSrc}
        alt={alt || 'Avatar'}
        fill
        className="rounded-full object-cover"
        sizes={`${size}px`}
        unoptimized={!src} // Skip optimization for external fallback URLs if needed
      />
    </div>
  );
};

export default Avatar;
