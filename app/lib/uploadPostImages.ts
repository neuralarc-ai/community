import { createClient } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPostImages(userId: string, files: File[]): Promise<string[]> {
  const supabase = createClient();
  const imageUrls: string[] = [];

  for (const file of files) {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}-${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${file.name}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    imageUrls.push(publicUrlData.publicUrl);
  }

  return imageUrls;
}

