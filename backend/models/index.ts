// Type definitions for models
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profile_picture: string;
  bio: string;
  preferred_categories: string[];
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image: string;
  ebook_file: string;
  file_format: 'epub' | 'mobi' | 'azw3';
  categories: string[];
  average_rating: number;
  total_ratings: number;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  metadata: Record<string, any>;
  created_at: string;
}
