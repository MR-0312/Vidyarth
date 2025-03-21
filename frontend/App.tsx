import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./src/components/Navbar";
import Footer from "./src/components/Footer";
import Home from "./src/pages/Home";
import Read from "./src/pages/Read";
import Login from "./src/components/Login";
import Signup from "./src/components/Signup";
import { AuthProvider } from "./src/context/AuthContext";
import "./src/styles/App.css";
import ProtectedRoute from "./src/components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/read"
            element={
              <ProtectedRoute>
                <Read />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
