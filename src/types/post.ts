export type PostType = 'lost' | 'found';

export interface Post {
  post_id: string;
  user_id: string;
  type: PostType;
  title: string;
  desc_text: string;
  images?: string[];
  category?: string | null;
  colour?: string | null;
  location_text?: string | null;
  appearance?: Record<string, any> | null;
  created_at: string;
}

export interface PostFilterOptions {
  category?: string;
  colour?: string;
  location?: string;
}

export interface CreatePostInput {
  title: string;
  desc_text: string;
  images?: string[];
  category?: string;
  colour?: string;
  location_text?: string;
}
