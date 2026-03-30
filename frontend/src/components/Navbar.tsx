import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/App.css";

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = async () => {
    if (logout) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
        // Even if logout fails, clear local state
        // This is handled in the logout function
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/"> <span className="brand">Vidhyarth</span> </Link>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Search books..." />
        <button className="search-btn">🔍</button>
      </div>
      <div className="auth-buttons">
        {user ? (
          <>
            <Link to="/read" className="nav-link">Read</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
