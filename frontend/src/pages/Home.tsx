import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Vidyarth eBook Library</h1>
      <p className="text-xl mb-8">Discover, read, and enjoy a world of knowledge at your fingertips.</p>
      <Link to="/books" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Browse Books
      </Link>
    </div>
  );
}

export default Home;

