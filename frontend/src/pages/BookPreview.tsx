import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { bookService, Book } from "../services/bookService";

interface Review {
  _id?: string;
  id?: string;
  user?: {
    name: string;
  };
  userName?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
}

const BookPreview = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddedToLibrary, setIsAddedToLibrary] = useState(false);
  
  // Reviews and ratings state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(bookId);
        setBook(bookData);
        setError(null);
      } catch (err) {
        setError("Failed to load book details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Fetch reviews for the book
  useEffect(() => {
    const fetchReviews = async () => {
      if (!bookId) return;
      try {
        setLoadingReviews(true);
        const response = await fetch(`http://localhost:8080/api/reviews/${bookId}`);
        if (response.ok) {
          const reviewsData = await response.json();
          setReviews(reviewsData);
          
          // Check if user has already reviewed
          if (user && reviewsData.length > 0) {
            const userReviewed = reviewsData.some((review: Review) => {
              const reviewUserId = review.user?._id || review.user?.id;
              return reviewUserId === user.id;
            });
            setUserHasReviewed(userReviewed);
          }
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [bookId, user]);

  const handleReadNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/read/${bookId}`);
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("koodoreader_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/library/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });

      if (response.ok) {
        setIsAddedToLibrary(true);
      }
    } catch (err) {
      console.error("Error adding to library:", err);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (userRating === 0 || !comment.trim()) {
      alert("Please rate the book and add a comment");
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("koodoreader_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/reviews/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          rating: userRating,
          comment: comment,
        }),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([newReview, ...reviews]);
        setUserRating(0);
        setComment("");
        setUserHasReviewed(true);
        alert("Review submitted successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReport = () => {
    alert("Report submitted. Thank you for helping keep our library quality high!");
  };

  const getImageUrl = (book: Book) => {
    if (book.image) return book.image;
    if (book.cover_image) return book.cover_image;
    if (book.coverImage) return book.coverImage;
    return "https://via.placeholder.com/300x450?text=No+Cover";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div>Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div>{error || "Book not found"}</div>
      </div>
    );
  }

  const rating = book.average_rating || book.averageRating || 0;
  const totalRatings = book.total_ratings || book.totalRatings || 0;
  const description = book.description || "No description available.";
  const categories = book.categories || [];
  const averageRating = calculateAverageRating();

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Navigation bar */}
      <nav
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: "18px",
            cursor: "pointer",
            padding: "8px 12px",
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: "24px", flex: 1, textAlign: "center" }}>
          Book Details
        </h1>
        <div style={{ width: "60px" }} /> {/* Spacer */}
      </nav>

      {/* Main content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* Book header section */}
        <div
          style={{
            display: "flex",
            gap: "3rem",
            marginBottom: "3rem",
            flexWrap: "wrap",
          }}
        >
          {/* Book cover */}
          <div
            style={{
              flex: "0 0 auto",
              minWidth: "250px",
            }}
          >
            <img
              src={getImageUrl(book)}
              alt={book.title}
              style={{
                width: "250px",
                height: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Book info */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
            }}
          >
            {/* Title and author */}
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                color: "var(--text-primary)",
              }}
            >
              {book.title}
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                margin: "0 0 20px 0",
                fontWeight: "500",
              }}
            >
              by {book.author}
            </p>

            {/* Rating section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>⭐</span>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  {reviews.length > 0 ? parseFloat(averageRating as string).toFixed(1) : rating > 0 ? rating.toFixed(1) : "N/A"}
                </span>
              </div>
              {(reviews.length > 0 || totalRatings > 0) && (
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {reviews.length > 0 ? reviews.length : totalRatings} {(reviews.length > 0 ? reviews.length : totalRatings) === 1 ? "rating" : "ratings"}
                </span>
              )}
            </div>

            {/* Stats section */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Format
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                  {book.file_format || book.fileFormat || "Digital"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                  {book.status || "Available"}
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                  }}
                >
                  Genres
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {categories.map((cat, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12px",
                        color: "white",
                        backgroundColor: "#0078ff",
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleReadNow}
                style={{
                  backgroundColor: "#0078ff",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#0056cc";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#0078ff";
                }}
              >
                📖 READ NOW
              </button>

              <button
                onClick={handleAddToLibrary}
                style={{
                  backgroundColor: isAddedToLibrary ? "#28a745" : "var(--bg-elevated)",
                  color: isAddedToLibrary ? "white" : "var(--text-primary)",
                  border: `2px solid ${isAddedToLibrary ? "#28a745" : "var(--border-color)"}`,
                  padding: "12px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!isAddedToLibrary) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "var(--bg-card)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isAddedToLibrary) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "var(--bg-elevated)";
                  }
                }}
              >
                {isAddedToLibrary ? "✓ ADDED TO LIBRARY" : "📚 ADD TO LIBRARY"}
              </button>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 12px 0",
              color: "var(--text-primary)",
            }}
          >
            Summary
          </h3>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "var(--text-secondary)",
              margin: "0 0 16px 0",
            }}
          >
            {description}
          </p>
          {description.length > 300 && (
            <button
              style={{
                background: "none",
                border: "none",
                color: "#0078ff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                padding: "0",
              }}
              onClick={() => {
                // Could expand description or navigate to full details
              }}
            >
              Show More →
            </button>
          )}
        </div>

        {/* Rating and Review Section */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 24px 0",
              color: "var(--text-primary)",
            }}
          >
            User Reviews 📝
          </h3>

          {/* Add Review Form - Only show if user hasn't reviewed */}
          {user && !userHasReviewed && (
            <div
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Your Rating:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "32px",
                        cursor: "pointer",
                        opacity: (hoveredRating || userRating) >= star ? 1 : 0.3,
                        transition: "opacity 0.2s",
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span
                    style={{
                      marginLeft: "12px",
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                    }}
                  >
                    {userRating} / 5 stars
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Your Review:
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || userRating === 0 || !comment.trim()}
                style={{
                  backgroundColor: submittingReview || userRating === 0 || !comment.trim() ? "#ccc" : "#0078ff",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  cursor: submittingReview || userRating === 0 || !comment.trim() ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!submittingReview && userRating > 0 && comment.trim()) {
                    (e.target as HTMLButtonElement).style.backgroundColor = "#0056cc";
                  }
                }}
                onMouseOut={(e) => {
                  if (!submittingReview && userRating > 0 && comment.trim()) {
                    (e.target as HTMLButtonElement).style.backgroundColor = "#0078ff";
                  }
                }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              No reviews yet. Be the first to review this book!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.map((review) => (
                <div
                  key={review._id || review.id}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {review.user?.name || review.userName || "Anonymous"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatDate(review.date || review.createdAt)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "16px",
                            opacity: i < review.rating ? 1 : 0.3,
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                      margin: "0",
                    }}
                  >
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report section */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            If you find any errors (non-standard content, ads redirect, broken
            links, etc.) Please let us know so we can fix it as soon as possible.
          </p>
          <button
            onClick={handleReport}
            style={{
              backgroundColor: "transparent",
              color: "#0078ff",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              padding: "8px 16px",
              whiteSpace: "nowrap",
              marginLeft: "16px",
            }}
          >
            Report 🚨
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;
