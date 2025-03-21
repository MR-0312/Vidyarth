import { useState } from "react";
import "../styles/App.css";

const books = [
  { title: "The Shaman's Shadow", image: "/assets/book1.jpg" },
  { title: "Wonderfully Made", image: "/assets/book2.jpg" },
  { title: "After the Flash", image: "/assets/book3.jpg" },
  { title: "Protected: Damaged SEAL", image: "/assets/book4.jpg" },
  { title: "The Deluge", image: "/assets/book5.jpg" },
  { title: "Where Does God Live?", image: "/assets/book6.jpg" },
];

const BookCarousel = () => {
  const [index, setIndex] = useState(0);

  const nextBook = () => {
    setIndex((prevIndex) => (prevIndex + 1) % books.length);
  };

  const prevBook = () => {
    setIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length);
  };

  return (
    <section className="book-carousel">
      <h2>FREE EBOOKS AND DEALS</h2>
      <div className="carousel-container">
        <button onClick={prevBook} className="carousel-btn">
          ⬅
        </button>
        <div className="book-item">
          <img src={books[index].image} alt={books[index].title} />
          <p>{books[index].title}</p>
        </div>
        <button onClick={nextBook} className="carousel-btn">
          ➡
        </button>
      </div>
    </section>
  );
};

export default BookCarousel;
