import supabase from './supabase';
import bcrypt from 'bcryptjs';

// ==================== TYPE DEFINITIONS ====================

interface UserData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  profile_picture?: string;
  bio?: string;
  preferred_categories?: string[];
  role?: 'user' | 'admin';
  created_at?: string;
}

interface BookData {
  id?: string;
  title: string;
  author: string;
  description: string;
  cover_image?: string;
  ebook_file?: string;
  file_format?: string;
  categories?: string[];
  average_rating?: number;
  total_ratings?: number;
  user_id?: string;
  status?: string;
  created_at?: string;
}

interface ReviewData {
  id?: string;
  user_id: string;
  book_id: string;
  rating: number;
  content?: string;
  created_at?: string;
}

interface ActivityMetadata {
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
  bookId?: string;
  searchQuery?: string;
  category?: string;
  rating?: number;
  reviewContent?: string;
  duration?: number;
  readingProgress?: number;
  endpoint?: string;
  method?: string;
  count?: number;
  changes?: string[];
  reason?: string;
  bookTitle?: string;
  author?: string;
  userRole?: string;
  targetUserId?: string;
  targetUsername?: string;
  newRole?: string;
  previousRole?: string;
  [key: string]: any; // Allow additional properties
}

// ==================== USER QUERIES ====================

const UserQueries = {
  // Create a new user
  async create(userData: UserData): Promise<UserData> {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password || '', 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as UserData;
  },

  // Find user by email
  async findByEmail(email: string): Promise<UserData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return (data as UserData) || null;
  },

  // Find user by ID
  async findById(id: string): Promise<UserData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return (data as UserData) || null;
  },

  // Update user
  async update(id: string, updates: Partial<UserData>): Promise<UserData> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserData;
  },

  // Compare password
  async comparePassword(userId: string, candidatePassword: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;
    return await bcrypt.compare(candidatePassword, user.password || '');
  },

  // Get user by ID without password
  async getUserProfile(id: string): Promise<Partial<UserData> | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, profile_picture, bio, preferred_categories, role, created_at')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
};

// ==================== BOOK QUERIES ====================

interface BookFilters {
  category?: string;
  status?: string;
}

const BookQueries = {
  // Create a new book
  async create(bookData: BookData): Promise<BookData> {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single();
    
    if (error) throw error;
    return data as BookData;
  },

  // Find book by ID
  async findById(id: string): Promise<BookData | null> {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        users!books_user_id_fkey(id, username, email, profile_picture)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return (data as BookData) || null;
  },

  // Get all books with pagination and filters
  async getAll(page: number = 1, limit: number = 10, filters: BookFilters = {}): Promise<{ books: BookData[]; total: number | null }> {
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' });
    
    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    const startIndex = (page - 1) * limit;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);
    
    if (error) throw error;
    return { books: (data as BookData[]) || [], total: count };
  },

  // Get books by category
  async getByCategory(category: string, page: number = 1, limit: number = 10): Promise<{ books: BookData[]; total: number | null }> {
    return this.getAll(page, limit, { category });
  },

  // Update book
  async update(id: string, updates: Partial<BookData>): Promise<BookData> {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as BookData;
  },

  // Delete book
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get books by user
  async getByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ books: BookData[]; total: number | null }> {
    const startIndex = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);
    
    if (error) throw error;
    return { books: (data as BookData[]) || [], total: count };
  },

  // Count books by status
  async countByStatus(status: string): Promise<number> {
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    if (error) throw error;
    return count || 0;
  }
};

// ==================== REVIEW QUERIES ====================

const ReviewQueries = {
  // Create a review
  async create(reviewData: ReviewData): Promise<ReviewData> {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data as ReviewData;
  },

  // Find a specific review
  async findOne(userId: string, bookId: string): Promise<ReviewData | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return (data as ReviewData) || null;
  },

  // Get reviews for a book
  async getByBookId(bookId: string): Promise<ReviewData[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users!reviews_user_id_fkey(id, username, profile_picture)
      `)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as ReviewData[]) || [];
  },

  // Get reviews by user
  async getByUserId(userId: string): Promise<ReviewData[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        books!reviews_book_id_fkey(id, title, author)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data as ReviewData[]) || [];
  },

  // Update review
  async update(id: string, updates: Partial<ReviewData>): Promise<ReviewData> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ReviewData;
  },

  // Delete review
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Calculate average rating for a book
  async getAverageRating(bookId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('book_id', bookId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const sum = (data as any[]).reduce((acc, review) => acc + review.rating, 0);
    return {
      average: Math.round((sum / data.length) * 100) / 100,
      count: data.length
    };
  }
};

// ==================== FAVORITE QUERIES ====================

const FavoriteQueries = {
  // Add to favorites
  async add(userId: string, bookId: string): Promise<any> {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, book_id: bookId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove from favorites
  async remove(userId: string, bookId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);
    
    if (error) throw error;
  },

  // Get user's favorites
  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        books!favorites_book_id_fkey(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Check if book is favorited by user
  async isFavorited(userId: string, bookId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data !== null;
  }
};

// ==================== CONTRIBUTION QUERIES ====================

const ContributionQueries = {
  // Create a contribution
  async create(bookId: string, userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('contributions')
      .insert([{ book_id: bookId, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get contributions for a book
  async getByBookId(bookId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        users!contributions_user_id_fkey(id, username, profile_picture)
      `)
      .eq('book_id', bookId);
    
    if (error) throw error;
    return data || [];
  },

  // Get contributions by user
  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        books!contributions_book_id_fkey(id, title, author, description, cover_image, ebook_file, file_format, categories, average_rating, total_ratings, status)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Count contributions by user
  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  }
};

// ==================== ACTIVITY QUERIES ====================

const ActivityQueries = {
  // Log user activity
  async log(userId: string, activityType: string, metadata: ActivityMetadata): Promise<any> {
    const { data, error } = await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        activity_type: activityType,
        metadata
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get activities by user
  async getByUserId(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get activities by type
  async getByType(activityType: string, limit: number = 100): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('activity_type', activityType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};

export { UserQueries, BookQueries, ReviewQueries, FavoriteQueries, ContributionQueries, ActivityQueries };
export type { UserData, BookData, ReviewData, ActivityMetadata };
