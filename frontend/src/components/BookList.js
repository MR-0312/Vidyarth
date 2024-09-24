import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch books from an API
    const fetchBooks = async () => {
      try {
        // Simulating API call
        const response = await new Promise(resolve => 
          setTimeout(() => resolve([
            { id: 1, title: 'Book Title 1', author: 'Author Name 1', coverImage: '/placeholder.svg?height=200&width=150&text=Book 1' },
            { id: 2, title: 'Book Title 2', author: 'Author Name 2', coverImage: '/placeholder.svg?height=200&width=150&text=Book 2' },
            { id: 3, title: 'Book Title 3', author: 'Author Name 3', coverImage: '/placeholder.svg?height=200&width=150&text=Book 3' },
          ]), 1000)
        );
        setBooks(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="book-list">
      <h2>Featured Books</h2>
      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.coverImage} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <Link to={`/books/${book.id}`} className="button">View Details</Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BookList;