import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabaseClient';

interface PostImagesProps {
  images: string[];
  quality?: number; // For higher quality images in details view
}

const PostImages: React.FC<PostImagesProps> = ({ images, quality = 80 }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  if (!images || images.length === 0) {
    return null; // Render nothing if no images
  }

  const getPublicUrl = (path: string): string => {
    const { data } = supabase.storage.from('post_images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageLoad = (path: string) => {
    setLoadedImages(prev => ({ ...prev, [path]: true }));
  };

  const commonImageProps = (path: string) => ({
    src: getPublicUrl(path),
    alt: 'Post image',
    layout: 'fill' as const,
    objectFit: 'cover' as const,
    className: 'rounded-md transition-transform duration-300 group-hover:scale-105',
    loading: 'lazy' as const,
    quality: quality,
    onLoad: () => handleImageLoad(path),
    onError: (e: any) => {
      console.error('Error loading image:', e);
      // You could set an error state here to show a placeholder
    },
  });

  const skeletonLoader = (
    <div className="animate-pulse bg-gray-700 rounded-md w-full h-full absolute inset-0"></div>
  );

  const renderImage = (imagePath: string) => (
    <div key={imagePath} className="relative w-full h-auto min-h-[200px] overflow-hidden group">
      {!loadedImages[imagePath] && skeletonLoader}
      <Image {...commonImageProps(imagePath)} />
    </div>
  );

  if (images.length === 1) {
    return (
      <div className="mt-4">
        {renderImage(images[0])}
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.map(renderImage)}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 max-h-[400px]">
        <div className="col-span-1">
          {renderImage(images[0])}
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-2">
          {renderImage(images[1])}
          {renderImage(images[2])}
        </div>
      </div>
    );
  }

  // Fallback for more than 3 images or other cases (e.g., simple grid)
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {images.slice(0, 3).map(renderImage)}
    </div>
  );
};

export default PostImages;

