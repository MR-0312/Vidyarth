import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Book {
  id: number;
  title: string;
  author: string;
}

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch books from an API
    setBooks([
      { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
      { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" },
      { id: 3, title: "1984", author: "George Orwell" },
    ]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Book List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
            <p className="text-gray-600 mb-2">{book.author}</p>
            <Link to={`/books/${book.id}`} className="text-blue-500 hover:text-blue-600">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;

