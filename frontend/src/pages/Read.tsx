import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  content?: string;
  start_page?: number;
  end_page?: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
}

const Read = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light"); // light, dark, sepia
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Book and chapter state
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch book and chapters
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        setLoading(true);
        
        // Fetch book details
        const bookResponse = await fetch(`http://localhost:8080/api/books/${bookId}`);
        if (!bookResponse.ok) throw new Error('Failed to fetch book');
        const bookData = await bookResponse.json();
        setBook(bookData);

        // Fetch chapters list
        const chaptersResponse = await fetch(`http://localhost:8080/api/books/${bookId}/chapters`);
        if (!chaptersResponse.ok) throw new Error('Failed to fetch chapters');
        const chaptersData = await chaptersResponse.json();
        setChapters(chaptersData);
        
        // Load first chapter content if available
        if (chaptersData.length > 0) {
          const firstChapter = chaptersData[0];
          const contentResponse = await fetch(`http://localhost:8080/api/books/${bookId}/chapters/${firstChapter.id}`);
          if (contentResponse.ok) {
            const chapterData = await contentResponse.json();
            setCurrentChapter(chapterData);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Load chapter content when index changes
  useEffect(() => {
    const loadChapterContent = async () => {
      if (!bookId || chapters.length === 0 || currentChapterIndex < 0 || currentChapterIndex >= chapters.length) return;
      
      try {
        const chapter = chapters[currentChapterIndex];
        const response = await fetch(`http://localhost:8080/api/books/${bookId}/chapters/${chapter.id}`);
        if (response.ok) {
          const chapterData = await response.json();
          setCurrentChapter(chapterData);
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
      }
    };

    loadChapterContent();
  }, [bookId, chapters, currentChapterIndex]);

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    setSidebarOpen(false);
  };

  useEffect(() => {
    // Update document title
    if (book && currentChapter) {
      document.title = `Reading: ${book.title} - ${currentChapter.title}`;
    }

    // Add keyboard event listeners for chapter navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePreviousChapter();
      } else if (e.key === "ArrowRight") {
        handleNextChapter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChapterIndex, chapters.length, book, currentChapter]);

  const getThemeStyles = () => {
    switch (theme) {
      case "dark":
        return {
          background: "#222",
          color: "#e8e8e8",
          paperBackground: "#333",
        };
      case "sepia":
        return {
          background: "#f8f1e3",
          color: "#5f4b32",
          paperBackground: "#fbf7eb",
        };
      default:
        return {
          background: "#f0f2f5",
          color: "#333",
          paperBackground: "#fff",
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        backgroundColor: themeStyles.background,
        color: themeStyles.color,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Chapter Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "0",
          transition: "width 0.3s ease",
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
          overflowY: "auto",
          boxShadow: sidebarOpen ? "0 0 10px rgba(0,0,0,0.1)" : "none",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: `1px solid ${theme === "dark" ? "#444" : "#eee"}`,
          }}
        >
          <h2
            style={{
              margin: "0 0 5px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {book?.title || "Loading..."}
          </h2>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: theme === "dark" ? "#999" : "#666",
            }}
          >
            {book?.author}
          </p>
        </div>

        <div
          style={{
            padding: "15px 20px",
            borderBottom: `1px solid ${theme === "dark" ? "#444" : "#eee"}`,
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          Contents
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {chapters.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: theme === "dark" ? "#999" : "#666",
              }}
            >
              No chapters available
            </div>
          ) : (
            chapters.map((chapter, idx) => (
              <div
                key={chapter.id}
                onClick={() => handleChapterSelect(idx)}
                style={{
                  padding: "12px 20px",
                  fontSize: "14px",
                  borderBottom: `1px solid ${
                    theme === "dark" ? "#333" : "#f5f5f5"
                  }`,
                  cursor: "pointer",
                  backgroundColor:
                    idx === currentChapterIndex
                      ? theme === "dark"
                        ? "#333"
                        : "#f0f7ff"
                      : "transparent",
                  color:
                    idx === currentChapterIndex
                      ? theme === "dark"
                        ? "#fff"
                        : "#0078ff"
                      : theme === "dark" ? "#e0e0e0" : "#333",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget).style.backgroundColor = theme === "dark" ? "#2a2a2a" : "#f5f5f5";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget).style.backgroundColor = idx === currentChapterIndex ? (theme === "dark" ? "#333" : "#f0f7ff") : "transparent";
                }}
              >
                {chapter.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reading Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 15px",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
            borderBottom: `1px solid ${theme === "dark" ? "#333" : "#eee"}`,
            zIndex: 4,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: themeStyles.color,
              cursor: "pointer",
              padding: "5px",
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

          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {currentChapter ? currentChapter.title : "Loading..."}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: themeStyles.color,
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="19"
                cy="12"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="5"
                cy="12"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>

          {/* Reading settings menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: "15px",
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                padding: "15px",
                width: "220px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  marginBottom: "15px",
                  borderBottom: `1px solid ${
                    theme === "dark" ? "#333" : "#eee"
                  }`,
                  paddingBottom: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Text Size
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() =>
                      setFontSize((prev) => Math.max(prev - 1, 12))
                    }
                    style={{
                      backgroundColor: theme === "dark" ? "#333" : "#f5f5f5",
                      border: "none",
                      borderRadius: "4px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>-</span>
                  </button>
                  <span style={{ fontSize: "14px" }}>{fontSize}px</span>
                  <button
                    onClick={() =>
                      setFontSize((prev) => Math.min(prev + 1, 24))
                    }
                    style={{
                      backgroundColor: theme === "dark" ? "#333" : "#f5f5f5",
                      border: "none",
                      borderRadius: "4px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>+</span>
                  </button>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Theme
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => setTheme("light")}
                    style={{
                      flex: 1,
                      backgroundColor: "#fff",
                      border:
                        theme === "light"
                          ? "2px solid #0078ff"
                          : "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "8px 0",
                      color: "#333",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("sepia")}
                    style={{
                      flex: 1,
                      backgroundColor: "#fbf7eb",
                      border:
                        theme === "sepia"
                          ? "2px solid #0078ff"
                          : "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "8px 0",
                      color: "#5f4b32",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    style={{
                      flex: 1,
                      backgroundColor: "#333",
                      border:
                        theme === "dark"
                          ? "2px solid #0078ff"
                          : "1px solid #333",
                      borderRadius: "4px",
                      padding: "8px 0",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Book Content */}
        <main
          style={{
            flex: 1,
            padding: "30px 0",
            backgroundColor: themeStyles.background,
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "700px",
              width: "100%",
              padding: "40px 60px",
              backgroundColor: themeStyles.paperBackground,
              boxShadow:
                theme === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              lineHeight: "1.6",
              fontSize: `${fontSize}px`,
              margin: "0 20px",
              minHeight: "100%",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: themeStyles.color, padding: "40px 0" }}>
                Loading book...
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", color: "#d32f2f", padding: "40px 0" }}>
                {error}
              </div>
            ) : currentChapter ? (
              <div>
                <h1 style={{ margin: "0 0 20px 0", fontSize: `${fontSize + 8}px` }}>
                  {currentChapter.title}
                </h1>
                {currentChapter.content ? (
                  <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {currentChapter.content}
                  </div>
                ) : (
                  <div style={{ color: themeStyles.color, opacity: 0.7 }}>
                    No content available for this chapter.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: themeStyles.color, padding: "40px 0" }}>
                No chapters available
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
            borderTop: `1px solid ${theme === "dark" ? "#333" : "#eee"}`,
            zIndex: 4,
          }}
        >
          <button
            onClick={handlePreviousChapter}
            disabled={currentChapterIndex <= 0}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentChapterIndex <= 0 ? "default" : "pointer",
              opacity: currentChapterIndex <= 0 ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              color: themeStyles.color,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: "8px" }}
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Previous
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "14px" }}>
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
          </div>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIndex >= chapters.length - 1}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentChapterIndex >= chapters.length - 1 ? "default" : "pointer",
              opacity: currentChapterIndex >= chapters.length - 1 ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              color: themeStyles.color,
            }}
          >
            Next
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: "8px" }}
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Read;
