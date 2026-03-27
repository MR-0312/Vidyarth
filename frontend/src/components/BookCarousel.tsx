import { useState, useEffect } from "react";
import { useBooks } from "../hooks/useBooks";
import "../styles/App.css";

const BookCarousel = () => {
  const [index, setIndex] = useState(0);
  const { books, loading, error } = useBooks({ limit: 50, autoFetch: true });

  // Reset index if books change
  useEffect(() => {
    setIndex(0);
  }, [books]);

  const validBooks = books && books.length > 0 ? books : [];
  const maxIndex = validBooks.length > 0 ? validBooks.length : 0;

  const nextBook = () => {
    if (maxIndex > 0) {
      setIndex((prevIndex) => (prevIndex + 1) % maxIndex);
    }
  };

  const prevBook = () => {
    if (maxIndex > 0) {
      setIndex((prevIndex) => (prevIndex - 1 + maxIndex) % maxIndex);
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

  return (
    <section className="book-carousel">
      <h2>FREE EBOOKS AND DEALS</h2>
      <div className="carousel-container">
        <button onClick={prevBook} className="carousel-btn">
          ⬅
        </button>
        <div className="book-item">
          <img src={currentBook.image} alt={currentBook.title} />
          <p>{currentBook.title}</p>
        </div>
        <button onClick={nextBook} className="carousel-btn">
          ➡
        </button>
      </div>
    </section>
  );
};

export default BookCarousel;
