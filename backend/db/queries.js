const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

// ==================== USER QUERIES ====================

const UserQueries = {
  // Create a new user
  async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
    return data;
  },

  // Find user by email
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows" error
    return data || null;
  },

  // Find user by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Update user
  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Compare password
  async comparePassword(userId, candidatePassword) {
    const user = await this.findById(userId);
    if (!user) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  },

  // Get user by ID without password
  async getUserProfile(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, profile_picture, bio, preferred_categories, created_at')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
};

// ==================== BOOK QUERIES ====================

const BookQueries = {
  // Create a new book
  async create(bookData) {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find book by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        users!books_user_id_fkey(id, username, email, profile_picture)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Get all books with pagination and filters
  async getAll(page = 1, limit = 10, filters = {}) {
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
    return { books: data, total: count };
  },

  // Get books by category
  async getByCategory(category, page = 1, limit = 10) {
    return this.getAll(page, limit, { category });
  },

  // Update book
  async update(id, updates) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete book
  async delete(id) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get books by user
  async getByUserId(userId, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);
    
    if (error) throw error;
    return { books: data, total: count };
  },

  // Count books by status
  async countByStatus(status) {
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
  async create(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find a specific review
  async findOne(userId, bookId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Get reviews for a book
  async getByBookId(bookId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users!reviews_user_id_fkey(id, username, profile_picture)
      `)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get reviews by user
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        books!reviews_book_id_fkey(id, title, author)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Update review
  async update(id, updates) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete review
  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Calculate average rating for a book
  async getAverageRating(bookId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('book_id', bookId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: Math.round((sum / data.length) * 100) / 100,
      count: data.length
    };
  }
};

// ==================== FAVORITE QUERIES ====================

const FavoriteQueries = {
  // Add to favorites
  async add(userId, bookId) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, book_id: bookId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove from favorites
  async remove(userId, bookId) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);
    
    if (error) throw error;
  },

  // Get user's favorites
  async getByUserId(userId) {
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
  async isFavorited(userId, bookId) {
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
  async create(bookId, userId) {
    const { data, error } = await supabase
      .from('contributions')
      .insert([{ book_id: bookId, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get contributions for a book
  async getByBookId(bookId) {
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
  async getByUserId(userId) {
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
  async countByUserId(userId) {
    const { count, error } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  }
};

// ==================== USER ACTIVITY QUERIES ====================

const ActivityQueries = {
  // Log activity
  async log(userId, activityType, metadata = {}) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          activity_type: activityType,
          metadata
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user activities
  async getByUserId(userId, limit = 50) {
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
  async getByType(activityType, limit = 50) {
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

module.exports = {
  supabase,
  UserQueries,
  BookQueries,
  ReviewQueries,
  FavoriteQueries,
  ContributionQueries,
  ActivityQueries
};
