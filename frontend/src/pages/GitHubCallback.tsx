import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL params
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setError("No authorization code provided");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Exchange code for token
        const response = await fetch(`${API_URL}/oauth/github/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.msg || "OAuth authentication failed");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        const data = await response.json();

        // Store token
        localStorage.setItem("koodoreader_token", data.token);

        // Login user
        login({
          id: data.user.id,
          name: data.user.username,
          username: data.user.username,
          email: data.user.email,
          role: data.role || "user",
        });

        // Redirect based on role
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/library");
        }
      } catch (err) {
        console.error("GitHub OAuth callback error:", err);
        setError("Failed to complete authentication");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        flexDirection: "column",
        gap: "20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        color: "var(--text-primary)",
      }}
    >
      {error ? (
        <>
          <div
            style={{
              backgroundColor: "rgba(255, 76, 76, 0.1)",
              border: "1px solid rgba(255, 76, 76, 0.3)",
              color: "#ff7b7b",
              padding: "16px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Redirecting to login...
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "4px solid rgba(13, 184, 166, 0.3)",
              borderTopColor: "#0db8a6",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Authenticating with GitHub...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default GitHubCallback;
