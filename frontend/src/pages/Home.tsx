import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../hooks/useBooks";

// Categories with icons
const categories = [
  { name: "Fiction", icon: "📚", color: "#FF6B6B" },
  { name: "Non-Fiction", icon: "🧠", color: "#4ECDC4" },
  { name: "Mystery", icon: "🔍", color: "#FFD166" },
  { name: "Romance", icon: "💖", color: "#FF9A8B" },
  { name: "Sci-Fi", icon: "🚀", color: "#6B5B95" },
  { name: "Fantasy", icon: "🐉", color: "#88B04B" },
  { name: "Biography", icon: "👤", color: "#92A8D1" },
  { name: "Horror", icon: "👻", color: "#955251" },
];

// Helper component for category display with tooltip
const CategoryTags = ({ categories, maxDisplay = 2 }: { categories?: string[]; maxDisplay?: number }) => {
  const [showCard, setShowCard] = useState(false);
  
  if (!categories || categories.length === 0) return null;

  const displayedCategories = categories.slice(0, maxDisplay);
  const hiddenCount = categories.length - maxDisplay;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
        onMouseEnter={() => hiddenCount > 0 && setShowCard(true)}
        onMouseLeave={() => setShowCard(false)}
      >
        {displayedCategories.map((cat, idx) => (
          <span
            key={idx}
            style={{
              fontSize: "11px",
              color: "white",
              padding: "3px 8px",
              backgroundColor: "#0db8a6",
              borderRadius: "12px",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              padding: "3px 6px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            +{hiddenCount}
          </span>
        )}
      </div>
      
      {showCard && hiddenCount > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "12px 16px",
            zIndex: 1000,
            fontSize: "12px",
            color: "var(--text-primary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            minWidth: "200px",
            maxWidth: "300px",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-book-title)" }}>
            All Genres ({categories.length})
          </div>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "11px",
                  color: "white",
                  padding: "4px 10px",
                  backgroundColor: "#0db8a6",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Fetch featured books dynamically
  const { books: allBooks, loading: booksLoading } = useBooks({ limit: 50, autoFetch: !isAuthenticated });
  const featuredBooks = allBooks.slice(0, 4); // Get first 4 books as featured

  // Redirect to library if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/library");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Header / Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px clamp(16px, 4vw, 50px)",
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "300",
              color: "var(--text-primary)",
              letterSpacing: "0.5px",
            }}
          >
            koodo reader
          </h1>
        </div>

        <nav>
          <ul
            style={{
              display: "flex",
              listStyle: "none",
              gap: "30px",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <a
                href="#features"
                style={{
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#about"
                style={{
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                About
              </a>
            </li>
            <li>
              <Link
                to="/login"
                style={{
                  color: "white",
                  textDecoration: "none",
                  backgroundColor: "#0db8a6",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontSize: "16px",
                }}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 20px",
          textAlign: "center",
          background: "var(--hero-gradient)",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "600",
            marginBottom: "20px",
            maxWidth: "800px",
          }}
        >
          Your Personal Digital Library
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "600px",
            marginBottom: "40px",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          A modern, elegant e-book reader designed to make your reading
          experience better than ever.
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <Link
            to="/signup"
            style={{
              backgroundColor: "#0db8a6",
              color: "white",
              padding: "16px 32px",
              borderRadius: "30px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "500",
              boxShadow: "0 10px 20px rgba(13, 184, 166, 0.3)",
            }}
          >
            Create Free Account
          </Link>

          <Link
            to="/login"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              padding: "16px 32px",
              borderRadius: "30px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "500",
              border: "1px solid var(--border-color)",
            }}
          >
            Sign In
          </Link>
        </div>

        <div
          style={{
            marginTop: "80px",
            position: "relative",
            width: "80%",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "-30px",
              width: "calc(100% + 60px)",
              height: "calc(100% + 60px)",
              background: "rgba(13, 184, 166, 0.1)",
              filter: "blur(40px)",
              borderRadius: "20px",
              zIndex: 0,
            }}
          ></div>

          <img
            src="https://images.unsplash.com/photo-1588580000645-4562a6d2c839?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="E-reader interface"
            style={{
              width: "100%",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: "100px 50px",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          Features You'll Love
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Multiple Formats
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Support for EPUB, MOBI, AZW3, and more. Import your entire library
              without format concerns.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Notes & Highlights
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Mark important passages and add your thoughts. All saved and
              easily accessible.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12h20"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Cross-Platform Sync
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Your library syncs across devices so you can pick up where you
              left off, anywhere.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Customizable Interface
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Adjust font sizes, colors, and themes to create your perfect
              reading environment.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11z"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 12l-4-4-4 4m8 4l-4-4-4 4"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Distraction-Free Reading
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Focus mode eliminates distractions so you can immerse yourself in
              your book.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(13, 184, 166, 0.1)",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="18"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="6"
                  x2="16"
                  y2="22"
                  stroke="#0db8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Library Organization
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Organize books by tags, collections, and custom shelves for easy
              access.
            </p>
          </div>
        </div>
      </section>

      
      {/* CTA Section */}
      <section
        style={{
          padding: "100px 50px",
          textAlign: "center",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "600",
            marginBottom: "20px",
            maxWidth: "800px",
            margin: "0 auto 20px",
          }}
        >
          Ready to Transform Your Reading Experience?
        </h2>

        <p
          style={{
            fontSize: "18px",
            maxWidth: "600px",
            marginBottom: "40px",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            margin: "0 auto 40px",
          }}
        >
          Join thousands of readers who have already enhanced their digital
          reading with Koodo Reader.
        </p>

        <Link
          to="/signup"
          style={{
            backgroundColor: "#0db8a6",
            color: "white",
            padding: "16px 32px",
            borderRadius: "30px",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "500",
            boxShadow: "0 10px 20px rgba(13, 184, 166, 0.3)",
          }}
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer
        id="about"
        style={{
          position: "static",
          backgroundColor: "var(--bg-secondary)",
          padding: "36px 20px",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            maxWidth: "1200px",
            margin: "0 auto",
            gap: "24px",
          }}
        >
          <div style={{ maxWidth: "300px" }}>
            <h3
              style={{
                fontSize: "28px",
                fontWeight: "300",
                marginBottom: "20px",
                color: "var(--text-primary)",
                letterSpacing: "0.5px",
              }}
            >
              koodo reader
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              A modern, elegant e-book reader designed to make your reading
              experience better than ever.
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <a href="#" style={{ color: "#0db8a6" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#" style={{ color: "#0db8a6" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#" style={{ color: "#0db8a6" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="17.5"
                    y1="6.5"
                    x2="17.51"
                    y2="6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4
              style={{
                fontSize: "18px",
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Features
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Pricing
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Download
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "18px",
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Terms of Service
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="#"
                  style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "18px",
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              Contact
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "var(--text-secondary)" }}>+1 (123) 456-7890</span>
              </li>
              <li
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="22,6 12,13 2,6"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "var(--text-secondary)" }}>
                  support@koodoreader.com
                </span>
              </li>
              <li
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "var(--text-secondary)" }}>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            marginTop: "28px",
            paddingTop: "16px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          &copy; {new Date().getFullYear()} Koodo Reader. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
