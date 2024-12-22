import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
}

function BookDetails() {
  const [book, setBook] = useState<Book | null>(null);
  const { id } = useParams<{ id: string }>();

  // useEffect(() => {
    // In a real app, you'd fetch book details from an API
  //   setBook({
  //     id,
  //     title: "Sample Book Title",
  //     author: "Sample Author",
  //     description: "This is a sample book description. It would contain information about the book's plot, themes, and other relevant details.",
  //     coverImage: "https://via.placeholder.com/200x300"
  //   });
  // }, [id]);

  if (!book) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <img src={book.coverImage} alt={book.title} className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-8" />
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-xl mb-4">By {book.author}</p>
          <p className="mb-4">{book.description}</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Start Reading
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;

