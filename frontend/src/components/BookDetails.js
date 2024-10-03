import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BookDetails() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    // In a real app, you would fetch book details from an API
    const fetchBookDetails = async () => {
      try {
        // Simulating API call
        const response = await new Promise(resolve => 
          setTimeout(() => resolve({
            id,
            title: `Book Title ${id}`,
            author: `Author Name ${id}`,
            description: `This is a detailed description of Book ${id}. It would contain information about the plot, characters, and other relevant details.`,
            coverImage: `/placeholder.svg?height=300&width=200&text=Book ${id}`,
          }), 1000)
        );
        setBook(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <section className="book-details">
      <div className="book-info">
        <img src={book.coverImage} alt={book.title} className="book-cover" />
        <div className="book-text">
          <h2>{book.title}</h2>
          <p className="author">by {book.author}</p>
          <p className="description">{book.description}</p>
          <button className="read-button">Start Reading</button>
        </div>
      </div>
    </section>
  );
}

export default BookDetails;