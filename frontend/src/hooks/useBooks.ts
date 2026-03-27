import { useState, useEffect, useCallback } from "react";
import { bookService, type Book } from "../services/bookService";

interface UseBooksOptions {
  page?: number;
  limit?: number;
  category?: string;
  autoFetch?: boolean;
}

interface TransformedBook {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  image: string;
  format: string;
  categories: string[];
  rating: number;
  status: string;
}

interface UseBooksResult {
  books: TransformedBook[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalBooks: number;
  refetch: () => void;
}

/**
 * Custom hook to fetch books from the API
 * Handles loading and error states
 */
export const useBooks = ({
  page = 1,
  limit = 50,
  category = undefined,
  autoFetch = true,
}: UseBooksOptions = {}): UseBooksResult => {
  const [books, setBooks] = useState<TransformedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookService.getAllBooks(page, limit, category);
      const transformedBooks = data.books.map((book: Book) =>
        bookService.transformBook(book)
      );
      setBooks(transformedBooks);
      setTotalPages(data.totalPages);
      setTotalBooks(data.totalBooks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch books"
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, category]);

  useEffect(() => {
    if (autoFetch) {
      fetchBooks();
    }
  }, [fetchBooks, autoFetch]);

  return {
    books,
    loading,
    error,
    totalPages,
    totalBooks,
    refetch: fetchBooks,
  };
};
