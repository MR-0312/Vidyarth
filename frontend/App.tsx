import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./src/components/Navbar";
import Footer from "./src/components/Footer";
import Home from "./src/pages/Home";
import Read from "./src/pages/Read";
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";
import Library from "./src/pages/Library";
import { AuthProvider } from "./src/context/AuthContext";
import ProtectedRoute from "./src/components/ProtectedRoute";
import "./src/styles/App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/read/:bookId"
            element={
              <ProtectedRoute>
                <Read />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
