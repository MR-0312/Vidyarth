import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Read from "./pages/Read";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Library from "./pages/Library";
import BookPreview from "./pages/BookPreview";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preview/:bookId" element={<BookPreview />} />
          <Route path="/read/:bookId" element={<Read />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
