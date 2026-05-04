// Book API service
import { API_URL, API_BASE_URL } from "../config/api";

export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  coverImage?: string;
  image?: string;
  ebook_file?: string;
  eBookFile?: string;
  file_format?: string;
  fileFormat?: string;
  categories?: string[];
  average_rating?: number;
  averageRating?: number;
  total_ratings?: number;
  totalRatings?: number;
  status?: string;
  date?: string;
}

export const bookService = {
  // Fetch all books with optional pagination and category filter
  async getAllBooks(
    page: number = 1,
    limit: number = 50,
    category?: string
  ): Promise<{ books: Book[]; totalBooks: number; totalPages: number }> {
    try {
      let url = `${API_URL}/books?page=${page}&limit=${limit}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  // Fetch a single book by ID
  async getBookById(id: string): Promise<Book> {
    try {
      const response = await fetch(`${API_URL}/books/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch book");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  },

  // Fetch books by category
  async getBooksByCategory(category: string): Promise<Book[]> {
    try {
      const response = await fetch(
        `${API_URL}/books?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch books by category");
      }

      const data = await response.json();
      return data.books || [];
    } catch (error) {
      console.error("Error fetching books by category:", error);
      throw error;
    }
  },

  // Transform book data to display format
  transformBook(book: Book) {
    // Handle both camelCase (MongoDB/old) and snake_case (Supabase/PostgreSQL) formats
    const coverPath = book.cover_image || book.coverImage || "";
    
    // Supabase Storage returns full URLs; local paths need construction
    const coverUrl = coverPath.startsWith('http')
      ? coverPath
      : coverPath
      ? `${API_BASE_URL}/${coverPath.replace(/\\/g, "/")}`
      : "https://covers.openlibrary.org/b/id/12860656-L.jpg";

    const bookId = book._id || book.id || "";
    const fileFormat = book.file_format || book.fileFormat || "epub";
    const averageRating = book.average_rating || book.averageRating || 0;

    return {
      id: bookId,
      title: book.title,
      author: book.author,
      description: book.description || "",
      cover: coverUrl,
      image: coverUrl,
      format: fileFormat.toUpperCase(),
      categories: book.categories || [],
      rating: averageRating,
      status: book.status || "approved",
    };
  },
};
