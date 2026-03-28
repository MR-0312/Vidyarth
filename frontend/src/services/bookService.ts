// Book API service
const API_BASE_URL = "http://localhost:8080/api";
const UPLOADS_BASE_URL = "http://localhost:8080";

export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  description?: string;
  coverImage: string;
  eBookFile?: string;
  fileFormat?: string;
  categories?: string[];
  averageRating?: number;
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
      let url = `${API_BASE_URL}/books?page=${page}&limit=${limit}`;
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
      const response = await fetch(`${API_BASE_URL}/books/${id}`);
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
        `${API_BASE_URL}/books?category=${category}`
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
    const coverPath = book.coverImage || "";
    const normalizedPath = coverPath.replace(/\\/g, "/");
    const coverUrl = normalizedPath
      ? `${UPLOADS_BASE_URL}/${normalizedPath}`
      : "https://covers.openlibrary.org/b/id/12860656-L.jpg";

    const bookId = book._id || book.id || "";

    return {
      id: bookId,
      title: book.title,
      author: book.author,
      description: book.description || "",
      cover: coverUrl,
      image: coverUrl,
      format: (book.fileFormat || "pdf").toUpperCase(),
      categories: book.categories || [],
      rating: book.averageRating || 0,
      status: book.status || "approved",
    };
  },
};
