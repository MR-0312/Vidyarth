import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import BookList from './components/BookList';
import BookDetails from './components/BookDetails';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <header>
            <nav>
              <div className="logo">eBook Platform</div>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/books">Books</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </nav>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
          </main>

          <footer>
            <p>&copy; 2023 eBook Platform. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;