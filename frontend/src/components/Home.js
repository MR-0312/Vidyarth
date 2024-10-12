import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { currentUser } = useAuth();

  return (
    <section className="home">
      <h1>Welcome to Vidhyarth</h1>
      <p>Discover and read your favorite books online!</p>
      {currentUser ? (
        <Link to="/books" className="cta-button">Browse Books</Link>
      ) : (
        <Link to="/register" className="cta-button">Get Started</Link>
      )}
    </section>
  );
}

export default Home;