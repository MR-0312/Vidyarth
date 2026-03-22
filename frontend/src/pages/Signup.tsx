import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.msg || "Failed to sign up. Please try again.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Store the JWT token
      localStorage.setItem("koodoreader_token", data.token);
      
      // Log the user in
      login({ name, email });
      navigate("/library");
      setIsLoading(false);
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        backgroundColor: "var(--bg-primary)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        color: "var(--text-primary)",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          background: "none",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-primary)",
          fontSize: "14px",
          backgroundColor: "var(--bg-elevated)",
        }}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      {/* Left side - Brand/Logo */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0078ff",
          padding: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75%, #ffffff)",
            backgroundSize: "80px 140px",
            backgroundPosition:
              "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "300",
              marginBottom: "20px",
              color: "white",
              letterSpacing: "0.5px",
            }}
          >
            Vidyarth
          </h1>

          <p
            style={{
              fontSize: "18px",
              opacity: 0.9,
              maxWidth: "450px",
              lineHeight: 1.6,
              marginBottom: "30px",
            }}
          >
            A modern, elegant e-book reader designed for the best reading
            experience
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ textAlign: "left", fontSize: "16px" }}>
                Support for multiple formats
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ textAlign: "left", fontSize: "16px" }}>
                Notes and highlights
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12h20"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ textAlign: "left", fontSize: "16px" }}>
                Cross-platform sync
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "500",
              marginBottom: "30px",
              color: "var(--text-primary)",
            }}
          >
            Create your account
          </h2>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(255, 76, 76, 0.1)",
                border: "1px solid rgba(255, 76, 76, 0.3)",
                color: "#ff7b7b",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  fontSize: "16px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "none",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  fontSize: "16px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "none",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  fontSize: "16px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "none",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  fontSize: "16px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "none",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#0078ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isLoading ? "default" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "all 0.2s",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                "Sign up"
              )}
            </button>

            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>

            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#0078ff",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Log in
              </Link>
            </div>
          </form>

          <div
            style={{
              margin: "30px 0",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{ flex: "1", height: "1px", backgroundColor: "var(--divider-color)" }}
            ></div>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              or sign up with
            </span>
            <div
              style={{ flex: "1", height: "1px", backgroundColor: "var(--divider-color)" }}
            ></div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                flex: "1",
                padding: "12px",
                backgroundColor: "var(--social-btn-bg)",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              style={{
                flex: "1",
                padding: "12px",
                backgroundColor: "var(--social-btn-bg)",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              style={{
                flex: "1",
                padding: "12px",
                backgroundColor: "var(--social-btn-bg)",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
