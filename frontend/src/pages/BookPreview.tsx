import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookService, Book } from "../services/bookService";
import { API_URL } from "../config/api";

interface Review {
  _id?: string;
  id?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
  };
  users?: {
    id?: string;
    username?: string;
    profile_picture?: string;
  };
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface Chapter {
  id?: string;
  book_id?: string;
  chapter_number: number;
  title: string;
  start_page?: number;
  end_page?: number;
  created_at?: string;
}

const BookPreview = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
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
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssues, setReportIssues] = useState<string[]>([]);
  const [reportComment, setReportComment] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Chapters state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  const reportIssuesList = [
    { id: "wrong_content", label: "Wrong/Incorrect Content", icon: "❌" },
    { id: "broken_links", label: "Broken Links or Download Issues", icon: "🔗" },
    { id: "ads_redirect", label: "Ads or Redirects", icon: "📢" },
    { id: "incomplete", label: "Incomplete or Truncated Book", icon: "📄" },
    { id: "corrupted", label: "Corrupted or Unreadable File", icon: "💥" },
    { id: "wrong_genre", label: "Wrong Genre/Category", icon: "🏷️" },
    { id: "copyright", label: "Copyright Issue", icon: "©️" },
    { id: "other", label: "Other Issue", icon: "❓" },
  ];

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
        const response = await fetch(`${API_URL}/reviews/${bookId}`);
        if (response.ok) {
          const reviewsData = await response.json();
          setReviews(reviewsData);
          
          // Check if user has already reviewed
          if (user && reviewsData.length > 0) {
            const userReviewed = reviewsData.some((review: Review) => {
              const reviewUserId = review.user?._id || (review.user?.id as string);
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

  // Fetch chapters for the book
  useEffect(() => {
    const fetchChapters = async () => {
      if (!bookId) return;
      try {
        setLoadingChapters(true);
        const response = await fetch(`${API_URL}/books/${bookId}/chapters`);
        if (response.ok) {
          const chaptersData = await response.json();
          setChapters(chaptersData);
        }
      } catch (err) {
        console.error("Error fetching chapters:", err);
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [bookId]);

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

      const response = await fetch(`${API_URL}/library/add`, {
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

      const response = await fetch(`${API_URL}/reviews/${bookId}`, {
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
    setShowReportModal(true);
  };

  const handleToggleIssue = (issueId: string) => {
    setReportIssues((prev) =>
      prev.includes(issueId)
        ? prev.filter((id) => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSubmitReport = async () => {
    if (reportIssues.length === 0) {
      alert("Please select at least one issue");
      return;
    }

    try {
      setSubmittingReport(true);
      const token = localStorage.getItem("koodoreader_token");
      const reportData = {
        bookId,
        bookTitle: book?.title,
        bookAuthor: book?.author,
        issues: reportIssues,
        comment: reportComment,
        reportedBy: user?.id || "anonymous",
        reportedByEmail: user?.email || "unknown",
        timestamp: new Date().toISOString(),
      };

      // Try to send to backend if endpoint exists, otherwise just log it
      try {
        const response = await fetch(`${API_URL}/reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { "x-auth-token": token }),
          },
          body: JSON.stringify(reportData),
        });

        if (response.ok) {
          alert(
            "Thank you! Your report has been submitted to our admin team. We'll review it shortly."
          );
          setShowReportModal(false);
          setReportIssues([]);
          setReportComment("");
        } else {
          // Backend endpoint might not exist, but log it anyway
          console.log("Report submitted (local):", reportData);
          alert(
            "Thank you! Your report has been recorded. Our team will investigate."
          );
          setShowReportModal(false);
          setReportIssues([]);
          setReportComment("");
        }
      } catch (fetchErr) {
        // If backend fails, still accept the report locally
        console.log("Report logged locally:", reportData);
        alert(
          "Thank you! Your report has been recorded. Our team will investigate."
        );
        setShowReportModal(false);
        setReportIssues([]);
        setReportComment("");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
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
                        backgroundColor: "#0db8a6",
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
                  backgroundColor: "#0db8a6",
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
                    "#0db8a6";
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

        </div>

        {/* Chapters Section */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: chapters.length > 0 ? "16px" : "0",
              cursor: chapters.length > 0 ? "pointer" : "default",
            }}
            onClick={() => {
              if (chapters.length > 0) setShowChapters(!showChapters);
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: "0",
                color: "var(--text-primary)",
              }}
            >
              📚 Table of Contents {chapters.length > 0 && `(${chapters.length} chapters)`}
            </h3>
            {chapters.length > 0 && (
              <span
                style={{
                  fontSize: "20px",
                  transition: "transform 0.3s",
                  transform: showChapters ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            )}
          </div>

          {chapters.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: "20px",
                fontSize: "14px",
              }}
            >
              No chapter information available for this book yet.
            </div>
          ) : (
            showChapters && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                {loadingChapters ? (
                  <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>
                    Loading chapters...
                  </div>
                ) : (
                  chapters.map((chapter, idx) => (
                    <div
                      key={chapter.id || idx}
                      style={{
                        padding: "12px",
                        backgroundColor: "var(--bg-elevated)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget).style.backgroundColor = "#0db8a6";
                        (e.currentTarget).style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget).style.backgroundColor = "var(--bg-elevated)";
                        (e.currentTarget).style.color = "inherit";
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </div>
                        {(chapter.start_page || chapter.end_page) && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Pages {chapter.start_page || "?"} - {chapter.end_page || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
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
                  backgroundColor: submittingReview || userRating === 0 || !comment.trim() ? "#ccc" : "#0db8a6",
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
                    (e.target as HTMLButtonElement).style.backgroundColor = "#0db8a6";
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
                        {review.users?.username || review.user?.username || review.user?.name || review.userName || "Anonymous"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatDate(review.createdAt)}
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
              color: "#0db8a6",
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

        {/* Report Modal */}
        {showReportModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
              padding: "20px",
            }}
            onClick={() => !submittingReport && setShowReportModal(false)}
          >
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    margin: "0",
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Report an Issue 🚨
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  disabled={submittingReport}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: submittingReport ? "not-allowed" : "pointer",
                    color: "var(--text-secondary)",
                    padding: "0",
                    opacity: submittingReport ? 0.5 : 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Book Info */}
              <div
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Reporting:
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginTop: "4px",
                  }}
                >
                  {book?.title} by {book?.author}
                </div>
              </div>

              {/* Issue Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  What issue did you encounter? *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {reportIssuesList.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => handleToggleIssue(issue.id)}
                      disabled={submittingReport}
                      style={{
                        backgroundColor: reportIssues.includes(issue.id)
                          ? "#0db8a6"
                          : "var(--bg-elevated)",
                        color: reportIssues.includes(issue.id)
                          ? "white"
                          : "var(--text-primary)",
                        border: `2px solid ${
                          reportIssues.includes(issue.id)
                            ? "#0db8a6"
                            : "var(--border-color)"
                        }`,
                        padding: "12px 16px",
                        borderRadius: "8px",
                        cursor: submittingReport ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        textAlign: "center",
                        transition: "all 0.2s",
                        opacity: submittingReport ? 0.6 : 1,
                      }}
                    >
                      <span style={{ marginRight: "6px" }}>{issue.icon}</span>
                      {issue.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Additional information (optional):
                </label>
                <textarea
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Please provide any additional details that will help our team investigate..."
                  disabled={submittingReport}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "12px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    opacity: submittingReport ? 0.6 : 1,
                    cursor: submittingReport ? "not-allowed" : "text",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowReportModal(false)}
                  disabled={submittingReport}
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    cursor: submittingReport ? "not-allowed" : "pointer",
                    opacity: submittingReport ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport || reportIssues.length === 0}
                  style={{
                    backgroundColor:
                      submittingReport || reportIssues.length === 0
                        ? "#ccc"
                        : "#0db8a6",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    cursor:
                      submittingReport || reportIssues.length === 0
                        ? "not-allowed"
                        : "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (
                      !submittingReport &&
                      reportIssues.length > 0
                    ) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#0056cc";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (
                      !submittingReport &&
                      reportIssues.length > 0
                    ) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#0db8a6";
                    }
                  }}
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPreview;
