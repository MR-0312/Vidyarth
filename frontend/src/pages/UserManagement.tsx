import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      // Note: You may need to create a backend endpoint to search users
      // For now, this is a placeholder
      alert(
        "User search functionality would be implemented with a backend endpoint"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async () => {
    if (!userId.trim()) {
      alert("Please enter a user ID");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "admin" }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      alert(`User ${data.user.username} promoted to admin!`);
      setUserId("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
      console.error("Error promoting user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteToUser = async () => {
    if (!userId.trim()) {
      alert("Please enter a user ID");
      return;
    }

    const confirmDemote = window.confirm(
      "Are you sure you want to demote this user?"
    );
    if (!confirmDemote) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "user" }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      alert(`User ${data.user.username} demoted to regular user!`);
      setUserId("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
      console.error("Error demoting user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-user-management">
        <h2>User Management</h2>

        <div className="management-container">
          <div className="search-section">
            <h3>Search User</h3>
            <div className="input-group">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter user email..."
                className="search-input"
              />
              <button onClick={handleSearchUser} className="search-btn">
                🔍 Search
              </button>
            </div>
          </div>

          <div className="role-management-section">
            <h3>Change User Role</h3>
            <p className="section-description">
              Enter the user ID to promote or demote a user
            </p>

            <div className="input-group">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID..."
                className="user-id-input"
              />
            </div>

            <div className="action-buttons">
              <button
                onClick={handlePromoteToAdmin}
                disabled={actionLoading || !userId.trim()}
                className="promote-btn"
              >
                {actionLoading ? "Processing..." : "⬆️ Promote to Admin"}
              </button>
              <button
                onClick={handleDemoteToUser}
                disabled={actionLoading || !userId.trim()}
                className="demote-btn"
              >
                {actionLoading ? "Processing..." : "⬇️ Demote to User"}
              </button>
            </div>
          </div>
        </div>

        <div className="management-info">
          <h3>User Role Information</h3>
          <div className="info-box">
            <div className="role-info">
              <h4>Regular User</h4>
              <ul>
                <li>✓ View approved books</li>
                <li>✓ Upload and contribute books</li>
                <li>✓ Write reviews and ratings</li>
                <li>✗ Cannot approve/reject books</li>
                <li>✗ Cannot manage users</li>
              </ul>
            </div>

            <div className="role-info">
              <h4>Admin User</h4>
              <ul>
                <li>✓ All regular user features</li>
                <li>✓ Approve/reject pending books</li>
                <li>✓ Edit book metadata</li>
                <li>✓ Delete books</li>
                <li>✓ Manage user roles</li>
                <li>✓ View dashboard statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
