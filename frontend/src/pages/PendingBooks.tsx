import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config/api";

interface PendingBook {
  id: string;
  title: string;
  author: string;
  description: string;
  categories: string[];
  cover_image: string;
  user_id: string;
  status: string;
  created_at: string;
}

const PendingBooks: React.FC = () => {
  const [books, setBooks] = useState<PendingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<PendingBook | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingBooks();
  }, []);

  const fetchPendingBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(`${API_URL}/admin/books/pending`, {
        headers: {
          "x-auth-token": token || "",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(data.books || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching pending books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookId: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `${API_URL}/admin/books/${bookId}/approve`,
        {
          method: "PUT",
          headers: {
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: actionReason }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to approve book: ${response.statusText}`);
      }

      // Remove the book from the list
      setBooks(books.filter((b) => b.id !== bookId));
      setSelectedBook(null);
      setActionReason("");
      alert("Book approved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
      console.error("Error approving book:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (bookId: string) => {
    if (!actionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `${API_URL}/admin/books/${bookId}/reject`,
        {
          method: "PUT",
          headers: {
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: actionReason }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reject book: ${response.statusText}`);
      }

      // Remove the book from the list
      setBooks(books.filter((b) => b.id !== bookId));
      setSelectedBook(null);
      setActionReason("");
      alert("Book rejected successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
      console.error("Error rejecting book:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-pending-books">
        <h2>Pending Books for Review</h2>

        {loading && <div className="loading">Loading pending books...</div>}
        {error && <div className="error-message">Error: {error}</div>}

        {!loading && books.length === 0 && (
          <div className="no-data">✨ No pending books to review!</div>
        )}

        {!loading && books.length > 0 && (
          <div className="pending-books-container">
            <div className="books-list">
              {books.map((book) => (
                <div
                  key={book.id}
                  className={`book-card ${selectedBook?.id === book.id ? "active" : ""}`}
                  onClick={() => setSelectedBook(book)}
                >
                  <img
                    src={book.cover_image || "/default-book.jpg"}
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p className="author">by {book.author}</p>
                    <p className="submitted">
                      Submitted: {new Date(book.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedBook && (
              <div className="book-details-panel">
                <div className="details-header">
                  <h3>{selectedBook.title}</h3>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setSelectedBook(null);
                      setActionReason("");
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="details-content">
                  <img
                    src={selectedBook.cover_image || "/default-book.jpg"}
                    alt={selectedBook.title}
                    className="detail-cover"
                  />

                  <div className="detail-info">
                    <div className="info-row">
                      <label>Title:</label>
                      <p>{selectedBook.title}</p>
                    </div>

                    <div className="info-row">
                      <label>Author:</label>
                      <p>{selectedBook.author}</p>
                    </div>

                    <div className="info-row">
                      <label>Categories:</label>
                      <div className="categories">
                        {selectedBook.categories?.map((cat) => (
                          <span key={cat} className="category-tag">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="info-row full-width">
                      <label>Description:</label>
                      <p className="description">{selectedBook.description}</p>
                    </div>

                    <div className="info-row full-width">
                      <label>Reason (for rejection):</label>
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Enter reason for approval or rejection..."
                        className="reason-input"
                      />
                    </div>

                    <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(selectedBook.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Processing..." : "✅ Approve"}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(selectedBook.id)}
                        disabled={actionLoading || !actionReason.trim()}
                      >
                        {actionLoading ? "Processing..." : "❌ Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PendingBooks;
