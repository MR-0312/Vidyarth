import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Read from "./pages/Read";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Library from "./pages/Library";
import { AuthProvider } from "./context/AuthContext";

const books = [
  { id: 1, title: "The Shaman's Shadow Workbook", image: "path/to/image1.jpg" },
  { id: 2, title: "Wonderfully Made", image: "path/to/image2.jpg" },
  // ...add more books as needed
];

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read/:bookId" element={<Read />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
