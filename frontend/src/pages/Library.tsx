import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sample book data
const books = [
  {
    id: 1,
    title: "The Shaman's Shadow",
    author: "Elizabeth Rowe",
    cover: "https://covers.openlibrary.org/b/id/12860656-L.jpg",
    format: "EPUB",
    progress: 45,
  },
  {
    id: 2,
    title: "Wonderfully Made",
    author: "Sarah Johnson",
    cover: "https://covers.openlibrary.org/b/id/12741815-L.jpg",
    format: "PDF",
    progress: 22,
  },
  {
    id: 3,
    title: "After the Flash",
    author: "Michael Thomson",
    cover: "https://covers.openlibrary.org/b/id/12547485-L.jpg",
    format: "EPUB",
    progress: 68,
  },
  {
    id: 4,
    title: "Protected: Damaged SEAL",
    author: "Anna Roberts",
    cover: "https://covers.openlibrary.org/b/id/10388260-L.jpg",
    format: "MOBI",
    progress: 10,
  },
  {
    id: 5,
    title: "The Deluge",
    author: "Stephen Markley",
    cover: "https://covers.openlibrary.org/b/id/12733609-L.jpg",
    format: "EPUB",
    progress: 0,
  },
  {
    id: 6,
    title: "Where Does God Live?",
    author: "Holly Bea",
    cover: "https://covers.openlibrary.org/b/id/259089-L.jpg",
    format: "PDF",
    progress: 0,
  },
];

const Library = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("recent"); // "recent", "title", "author"

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        background: "#2a2e30",
        color: "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "240px" : "0",
          transition: "width 0.3s ease",
          backgroundColor: "#0078ff",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "25px 20px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "300",
              color: "white",
              letterSpacing: "0.5px",
            }}
          >
            koodo
          </h1>
        </div>

        {/* Navigation Items */}
        <nav style={{ paddingTop: "12px" }}>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <li
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#005dc6",
                borderRadius: "0 5px 5px 0",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "15px" }}
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px" }}>Books</span>
            </li>
            <li
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "15px" }}
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px" }}>Favorites</span>
            </li>
            <li
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "15px" }}
              >
                <path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px" }}>Notes</span>
            </li>
            <li
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "15px" }}
              >
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px" }}>Highlights</span>
            </li>
            <li
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "4px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "15px" }}
              >
                <polyline
                  points="3 6 5 6 21 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px" }}>Trash</span>
            </li>
          </ul>

          <div
            style={{
              padding: "20px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "15px", color: "#ffffff" }}>Shelf</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ cursor: "pointer" }}
              >
                <polyline
                  points="6 9 12 15 18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px 20px",
            borderBottom: "1px solid #3a3f41",
            backgroundColor: "#2a2e30",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "5px",
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: "1",
              maxWidth: "400px",
              position: "relative",
              backgroundColor: "#3a3f41",
              borderRadius: "20px",
              padding: "6px 15px",
            }}
          >
            <input
              type="text"
              placeholder="Search my library"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                padding: "5px",
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{ position: "absolute", right: "12px" }}
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "22px",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0",
                display: "flex",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0",
                display: "flex",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0",
                display: "flex",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7 10 12 15 17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0",
                display: "flex",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23 4v6h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 20v-6h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginLeft: "5px",
              }}
            >
              <span
                style={{
                  color: "#a8a9aa",
                  fontSize: "14px",
                  fontWeight: "300",
                }}
              >
                Pro version
              </span>
              <button
                style={{
                  backgroundColor: "#4a4f51",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "400",
                  cursor: "pointer",
                }}
              >
                Import
              </button>
            </div>
          </div>
        </header>

        {/* Tools bar (sort/view options) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            backgroundColor: "#222628",
            borderBottom: "1px solid #3a3f41",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                background: "none",
                border: "none",
                color: viewMode === "grid" ? "#0078ff" : "#a8a9aa",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                background: "none",
                border: "none",
                color: viewMode === "list" ? "#0078ff" : "#a8a9aa",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line
                  x1="8"
                  y1="6"
                  x2="21"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="8"
                  y1="12"
                  x2="21"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="8"
                  y1="18"
                  x2="21"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3"
                  y1="6"
                  x2="3.01"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3"
                  y1="12"
                  x2="3.01"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3"
                  y1="18"
                  x2="3.01"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: "#a8a9aa", fontSize: "14px" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: "#3a3f41",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <main
          style={{
            flex: 1,
            padding: "30px",
            backgroundColor: "#2a2e30",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "30px",
            }}
          >
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#222628",
                  transition: "transform 0.2s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "140%",
                    backgroundColor: "#1a1d1e",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {book.progress > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${book.progress}%`,
                          backgroundColor: "#0078ff",
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: "15px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#f8f9fa",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#a8a9aa",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {book.author}
                  </p>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#a8a9aa",
                        padding: "2px 8px",
                        backgroundColor: "#3a3f41",
                        borderRadius: "4px",
                      }}
                    >
                      {book.format}
                    </span>
                    {book.progress > 0 && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#a8a9aa",
                        }}
                      >
                        {book.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;
