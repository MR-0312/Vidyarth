import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/Home";
import Read from "./pages/Read";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Library from "./pages/Library";
import BookPreview from "./pages/BookPreview";
import AdminDashboard from "./pages/AdminDashboard";
import PendingBooks from "./pages/PendingBooks";
import UserManagement from "./pages/UserManagement";
import AdminSettings from "./pages/AdminSettings";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/preview/:bookId" element={<BookPreview />} />
              <Route path="/read/:bookId" element={<Read />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/pending-books" element={<AdminRoute><PendingBooks /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
