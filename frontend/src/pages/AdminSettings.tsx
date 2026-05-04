import React from "react";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config/api";

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="admin-settings">
        <h2>Admin Settings</h2>

        <div className="settings-container">
          <div className="settings-section">
            <h3>📋 System Information</h3>
            <div className="settings-card">
              <div className="setting-item">
                <label>Platform Name:</label>
                <p>Vidyarth</p>
              </div>
              <div className="setting-item">
                <label>API Base URL:</label>
                <p>{API_URL}</p>
              </div>
              <div className="setting-item">
                <label>Version:</label>
                <p>1.0.0</p>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>🔧 Admin Preferences</h3>
            <div className="settings-card">
              <div className="setting-item checkbox">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email notifications for new book submissions
                </label>
              </div>
              <div className="setting-item checkbox">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email notifications for user role changes
                </label>
              </div>
              <div className="setting-item checkbox">
                <label>
                  <input type="checkbox" defaultChecked />
                  Show activity log in dashboard
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>📊 Dashboard Settings</h3>
            <div className="settings-card">
              <div className="setting-item">
                <label>Statistics refresh interval:</label>
                <select defaultValue="5">
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Items per page:</label>
                <input
                  type="number"
                  defaultValue="10"
                  min="5"
                  max="50"
                  step="5"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>🔐 Security</h3>
            <div className="settings-card">
              <div className="setting-item">
                <label>Last admin activity:</label>
                <p>{new Date().toLocaleString()}</p>
              </div>
              <button className="security-btn change-password-btn">
                🔑 Change Password
              </button>
              <button className="security-btn view-logs-btn">
                📜 View Activity Logs
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>ℹ️ Help & Documentation</h3>
            <div className="settings-card">
              <p>For help and documentation, please refer to:</p>
              <ul className="help-links">
                <li>
                  <a href="#" target="_blank">
                    📖 Admin Guide
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank">
                    🎓 Tutorial Videos
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank">
                    💬 Support Forum
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank">
                    ⚠️ Report an Issue
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="settings-footer">
            <button className="save-btn">💾 Save Settings</button>
            <button className="reset-btn">↻ Reset to Defaults</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
