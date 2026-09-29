import { supabase } from './supabaseClient';

export const STORAGE_BUCKET = 'item-photos';

/**
 * Converts a database-stored storage path or filename into a browser-loadable public URL.
 * Handles both relative storage paths, bucket-prefixed paths, and direct HTTP/blob/data URLs.
 */
export function getPostImageUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  // If already an absolute HTTP, HTTPS, blob, or data URL, return as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Strip leading bucket name or slashes if accidentally included in path
  let cleanPath = trimmed;
  if (cleanPath.startsWith('item-photos/')) {
    cleanPath = cleanPath.slice('item-photos/'.length);
  } else if (cleanPath.startsWith('/item-photos/')) {
    cleanPath = cleanPath.slice('/item-photos/'.length);
  }
  cleanPath = cleanPath.replace(/^\/+/, '');

  try {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(cleanPath);
    return data?.publicUrl || '';
  } catch (err) {
    console.warn('Error resolving image public URL for path:', path, err);
    return '';
  }
}

/**
 * Converts an array of storage paths into loadable image URLs.
 */
export function getPostImageUrls(paths?: string[]): string[] {
  if (!paths || !Array.isArray(paths)) return [];
  return paths.map(getPostImageUrl).filter(Boolean);
}

/**
 * Uploads an image file to the Supabase Storage bucket and returns the stored storage path.
 * Stored paths are saved in the database (e.g. 'posts/uuid-file.jpg').
 */
export async function uploadImageFile(file: File, folder = 'posts'): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `${folder}/${uniquePrefix}-${sanitizedName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Storage upload error:', error);
    // If the bucket does not exist or upload is blocked by policies, throw a clear error
    throw new Error(
      `Image upload failed (${error.name || 'StorageError'}): ${error.message}. Please ensure the "${STORAGE_BUCKET}" bucket exists in Supabase Storage.`
    );
  }

  return storagePath;
}
