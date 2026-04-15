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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/users/search?q=${encodeURIComponent(searchEmail)}`,
        {
          headers: {
            "x-auth-token": token || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to search users");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setSelectedUser(null);

      if (data.users.length === 0) {
        setError("No users found matching that email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/users?page=1&limit=50`,
        {
          headers: {
            "x-auth-token": token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!selectedUser) return;
    if (
      confirm(
        `Are you sure you want to promote ${selectedUser.username} to admin?`
      )
    ) {
      await updateUserRole(userId, "admin");
    }
  };

  const handleDemoteToUser = async (userId: string) => {
    if (!selectedUser) return;
    if (
      confirm(
        `Are you sure you want to demote ${selectedUser.username} to regular user?`
      )
    ) {
      await updateUserRole(userId, "user");
    }
  };

  const updateUserRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const token = localStorage.getItem("koodoreader_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update user role");
      }

      const data = await response.json();
      setActionMessage(`✅ ${data.user.username}'s role updated to ${newRole}!`);

      // Update the selected user and users list
      const updatedUsers = users.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setActionMessage(null);
      console.error("Error updating user role:", err);
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
            <h3>🔍 Search User</h3>
            <div className="input-group">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchUser()}
                placeholder="Enter user email..."
                className="search-input"
              />
              <button onClick={handleSearchUser} className="search-btn">
                Search
              </button>
            </div>
            <button
              onClick={handleLoadAllUsers}
              className="load-all-btn"
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "10px",
                background: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Load All Users
            </button>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {actionMessage && (
          <div
            className="success-message"
            style={{
              background: "#e8f5e9",
              color: "#2e7d32",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {actionMessage}
          </div>
        )}

        {loading && <div className="loading">Loading users...</div>}

        {!loading && users.length > 0 && (
          <div className="users-management-grid">
            <div className="users-list">
              <h3>Users ({users.length})</h3>
              <div className="users-table">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`user-row ${selectedUser?.id === user.id ? "active" : ""}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-info">
                      <p className="username">{user.username}</p>
                      <p className="email">{user.email}</p>
                    </div>
                    <div className="user-role">
                      <span className={`role-badge ${user.role}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedUser && (
              <div className="user-details-panel">
                <div className="details-header">
                  <h3>{selectedUser.username}</h3>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="user-details-content">
                  <div className="detail-row">
                    <label>Username:</label>
                    <p>{selectedUser.username}</p>
                  </div>

                  <div className="detail-row">
                    <label>Email:</label>
                    <p>{selectedUser.email}</p>
                  </div>

                  <div className="detail-row">
                    <label>Role:</label>
                    <p>
                      <span className={`role-badge ${selectedUser.role}`}>
                        {selectedUser.role.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="detail-row">
                    <label>Member Since:</label>
                    <p>
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="role-action-buttons">
                    {selectedUser.role === "user" ? (
                      <button
                        onClick={() => handlePromoteToAdmin(selectedUser.id)}
                        disabled={actionLoading}
                        className="promote-btn"
                      >
                        {actionLoading ? "Processing..." : "⬆️ Promote to Admin"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDemoteToUser(selectedUser.id)}
                        disabled={actionLoading}
                        className="demote-btn"
                      >
                        {actionLoading ? "Processing..." : "⬇️ Demote to User"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && users.length === 0 && searchEmail && (
          <div className="no-data">
            No users found matching "{searchEmail}"
          </div>
        )}

        <div className="management-info">
          <h3>Role Information</h3>
          <div className="info-box">
            <div className="role-info">
              <h4>👤 Regular User</h4>
              <ul>
                <li>✓ View approved books</li>
                <li>✓ Upload and contribute books</li>
                <li>✓ Write reviews and ratings</li>
                <li>✗ Cannot approve/reject books</li>
                <li>✗ Cannot manage users</li>
              </ul>
            </div>

            <div className="role-info">
              <h4>👨‍💼 Admin User</h4>
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
