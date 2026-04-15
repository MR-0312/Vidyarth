import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

interface AdminStats {
  books: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  lastUpdated: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("koodoreader_token");
        const response = await fetch("http://localhost:8080/api/admin/stats", {
          headers: {
            "x-auth-token": token || "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data.stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2>Dashboard Overview</h2>

        {loading && <div className="loading">Loading statistics...</div>}

        {error && <div className="error-message">Error: {error}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Approved Books</h3>
                <p className="stat-number">{stats.books.approved}</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Books</h3>
                <p className="stat-number">{stats.books.pending}</p>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>Rejected Books</h3>
                <p className="stat-number">{stats.books.rejected}</p>
              </div>
            </div>

            <div className="stat-card total">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>Total Books</h3>
                <p className="stat-number">{stats.books.total}</p>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="dashboard-footer">
            <p>Last updated: {new Date(stats.lastUpdated).toLocaleString()}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
