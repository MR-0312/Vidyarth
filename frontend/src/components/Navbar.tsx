import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/App.css";

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const isAdmin = auth?.isAdmin;

  const handleLogout = async () => {
    if (logout) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to={isAdmin ? "/admin/dashboard" : "/"}>
          <span className="brand">Vidhyarth {isAdmin && "(Admin)"}</span>
        </Link>
      </div>

      {!isAdmin && (
        <div className="search-bar">
          <input type="text" placeholder="Search books..." />
          <button className="search-btn">🔍</button>
        </div>
      )}

      <div className="auth-buttons">
        {user ? (
          <>
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">
                  📊 Dashboard
                </Link>
                <Link to="/admin/pending-books" className="nav-link">
                  📚 Books
                </Link>
                <Link to="/admin/users" className="nav-link">
                  👥 Users
                </Link>
                <Link to="/admin/settings" className="nav-link">
                  ⚙️ Settings
                </Link>
              </>
            ) : (
              <Link to="/library" className="nav-link">
                Library
              </Link>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
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
