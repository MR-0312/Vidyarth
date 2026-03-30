import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooks } from "../hooks/useBooks";
import "../styles/App.css";

const BookCarousel = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [showCategoriesCard, setShowCategoriesCard] = useState(false);
  const { books, loading, error } = useBooks({ limit: 50, autoFetch: true });

  // Reset index if books change
  useEffect(() => {
    setIndex(0);
    setShowCategoriesCard(false);
  }, [books]);

  const validBooks = books && books.length > 0 ? books : [];
  const maxIndex = validBooks.length > 0 ? validBooks.length : 0;

  const nextBook = () => {
    if (maxIndex > 0) {
      setIndex((prevIndex) => (prevIndex + 1) % maxIndex);
      setShowCategoriesCard(false);
    }
  };

  const prevBook = () => {
    if (maxIndex > 0) {
      setIndex((prevIndex) => (prevIndex - 1 + maxIndex) % maxIndex);
      setShowCategoriesCard(false);
    }
  };

  if (loading) {
    return (
      <section className="book-carousel">
        <h2>FREE EBOOKS AND DEALS</h2>
        <div className="carousel-container">
          <p>Loading books...</p>
        </div>
      </section>
    );
  }

  if (error || maxIndex === 0) {
    return (
      <section className="book-carousel">
        <h2>FREE EBOOKS AND DEALS</h2>
        <div className="carousel-container">
          <p>{error || "No books available"}</p>
        </div>
      </section>
    );
  }

  const currentBook = validBooks[index];
  const displayedCategories = currentBook.categories?.slice(0, 2) || [];
  const hiddenCategoriesCount = (currentBook.categories?.length || 0) - 2;

  const handleBookClick = () => {
    const bookId = currentBook._id || currentBook.id;
    if (bookId) {
      navigate(`/preview/${bookId}`);
    }
  };

  return (
    <section className="book-carousel">
      <h2>FREE EBOOKS AND DEALS</h2>
      <div className="carousel-container">
        <button onClick={prevBook} className="carousel-btn">
          ⬅
        </button>
        <div 
          className="book-item" 
          onClick={handleBookClick}
          style={{ 
            display: "flex", 
            gap: "30px", 
            alignItems: "center",
            cursor: "pointer",
            transition: "transform 0.2s, opacity 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
            (e.currentTarget as HTMLElement).style.opacity = "0.95";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          <img src={currentBook.image} alt={currentBook.title} style={{ maxHeight: "300px" }} />
          <div style={{ flex: 1, maxWidth: "400px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "600" }}>
              {currentBook.title}
            </h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "16px", color: "var(--text-secondary)", fontWeight: "500" }}>
              by {currentBook.author}
            </p>
            <div 
              style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", position: "relative" }}
              onMouseEnter={() => hiddenCategoriesCount > 0 && setShowCategoriesCard(true)}
              onMouseLeave={() => setShowCategoriesCard(false)}
            >
              {displayedCategories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "12px",
                    color: "white",
                    padding: "4px 10px",
                    backgroundColor: "#0078ff",
                    borderRadius: "12px",
                  }}
                >
                  {cat}
                </span>
              ))}
              {hiddenCategoriesCount > 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  +{hiddenCategoriesCount}
                </span>
              )}

              {showCategoriesCard && hiddenCategoriesCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: 0,
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    zIndex: 1000,
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-book-title)" }}>
                    All Genres ({currentBook.categories?.length})
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {currentBook.categories?.map((cat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11px",
                          color: "white",
                          padding: "4px 10px",
                          backgroundColor: "#0078ff",
                          borderRadius: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", padding: "4px 10px", backgroundColor: "var(--bg-elevated)", borderRadius: "4px", fontWeight: "500" }}>
                {currentBook.format}
              </span>
              {currentBook.rating > 0 && (
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  ⭐ {currentBook.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={nextBook} className="carousel-btn">
          ➡
        </button>
      </div>
    </section>
  );
};

export default BookCarousel;
