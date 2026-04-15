import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
      navigate("/login");
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item">
            📊 Dashboard
          </Link>
          <Link to="/admin/pending-books" className="admin-nav-item">
            📚 Pending Books
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            👥 Manage Users
          </Link>
          <Link to="/admin/settings" className="admin-nav-item">
            ⚙️ Settings
          </Link>
        </nav>

        <div className="admin-user-info">
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="user-details">
              <p className="username">{auth?.user?.username || auth?.user?.name}</p>
              <p className="email">{auth?.user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="admin-content">
        {/* Admin Header */}
        <div className="admin-header">
          <h1>Welcome,  {auth?.user?.username || auth?.user?.name}!</h1>
          <div className="header-icons">
            <span className="timestamp">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
