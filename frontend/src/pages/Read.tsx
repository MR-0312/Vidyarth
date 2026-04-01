import { useState, useEffect, useRef } from "react";
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
  cover_image?: string;
}

const Read = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light"); // light, dark, sepia
  const [fontFamily, setFontFamily] = useState("system-sans"); // Font family selection
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Book and chapter state
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterPageCounts, setChapterPageCounts] = useState<{ [key: string]: number }>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageContent, setPageContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate lines that fit per page based on available space
  const calculateLinesPerPage = () => {
    // Available height for content:
    // Total height - header (50px) - footer (50px) - top padding (30px) - bottom padding (30px) - margins and container padding (60px total)
    // = window.innerHeight - 220
    const availableHeight = window.innerHeight - 220;
    const lineHeight = fontSize * 1.65; // 1.6 line-height + small buffer
    const estimatedLinesPerPage = Math.floor(availableHeight / lineHeight);
    
    // Apply a safety factor to ensure no overflow
    return Math.max(Math.floor(estimatedLinesPerPage * 0.95), 5); // Minimum 5 lines, 95% to be safe
  };

  const paginateContent = (content: string) => {
    if (!content) return [''];
    
    const lines = content.split('\n');
    const linesPerPage = calculateLinesPerPage();
    const pages: string[] = [];
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage);
      pages.push(pageLines.join('\n'));
    }
    
    return pages.length > 0 ? pages : [''];
  };

  // Calculate number of pages for a chapter content
  const calculateChapterPages = (content?: string) => {
    if (!content) return 0;
    const pages = paginateContent(content);
    return pages.length;
  };

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

  // Fetch page counts for all chapters
  useEffect(() => {
    const fetchChapterPageCounts = async () => {
      if (!bookId || chapters.length === 0) return;
      
      const pageCounts: { [key: string]: number } = {};
      
      for (const chapter of chapters) {
        try {
          const response = await fetch(`http://localhost:8080/api/books/${bookId}/chapters/${chapter.id}`);
          if (response.ok) {
            const chapterData = await response.json();
            if (chapterData.content) {
              pageCounts[chapter.id] = calculateChapterPages(chapterData.content);
            } else if (chapter.end_page && chapter.start_page) {
              pageCounts[chapter.id] = chapter.end_page - chapter.start_page + 1;
            }
          }
        } catch (err) {
          console.error(`Error fetching page count for chapter ${chapter.id}:`, err);
        }
      }
      
      setChapterPageCounts(pageCounts);
    };
    
    fetchChapterPageCounts();
  }, [bookId, chapters]);

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
          
          // Paginate the content
          if (chapterData.content) {
            const pages = paginateContent(chapterData.content);
            setTotalPages(pages.length);
            setPageContent(pages[0]);
            setCurrentPage(1);
          } else {
            setPageContent('');
            setTotalPages(1);
            setCurrentPage(1);
          }
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
      }
    };

    loadChapterContent();
  }, [bookId, chapters, currentChapterIndex]);

  // Update page content when current page changes
  useEffect(() => {
    if (!currentChapter?.content) return;
    
    const pages = paginateContent(currentChapter.content);
    if (currentPage >= 1 && currentPage <= pages.length) {
      setPageContent(pages[currentPage - 1]);
    }
  }, [currentPage, currentChapter, fontSize]);

  // Recalculate total pages when font size changes
  useEffect(() => {
    if (!currentChapter?.content) return;
    
    const pages = paginateContent(currentChapter.content);
    setTotalPages(pages.length);
    
    // Ensure current page is still valid
    if (currentPage > pages.length) {
      setCurrentPage(Math.max(1, pages.length));
    }
  }, [fontSize]);

  const handlePreviousChapter = () => {
    if (currentPage > 1) {
      // Go to previous page in current chapter
      setCurrentPage(currentPage - 1);
    } else if (currentChapterIndex > 0) {
      // Go to last page of previous chapter
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentPage < totalPages) {
      // Go to next page in current chapter
      setCurrentPage(currentPage + 1);
    } else if (currentChapterIndex < chapters.length - 1) {
      // Go to first page of next chapter
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

    // Add keyboard event listeners for page/chapter navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePreviousChapter();
      } else if (e.key === "ArrowRight") {
        handleNextChapter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, currentChapterIndex, chapters.length, book, currentChapter]);

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

  const getFontFamilyStyles = () => {
    const fontFamilies: { [key: string]: string } = {
      "system-sans": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      "georgia": "'Georgia', 'Garamond', serif",
      "times": "'Times New Roman', 'Times', serif",
      "arial": "'Arial', 'Helvetica', sans-serif",
      "courier": "'Courier New', 'Courier', monospace",
    };
    return fontFamilies[fontFamily] || fontFamilies["system-sans"];
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
        fontFamily: getFontFamilyStyles(),
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
          backgroundColor: theme === "dark" ? "#1a1a1a" : theme === "sepia" ? "#f8f1e3" : "#fff",
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
            borderBottom: `1px solid ${theme === "dark" ? "#444" : theme === "sepia" ? "#e8dcc8" : "#eee"}`,
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
              margin: "0 0 15px 0",
              fontSize: "14px",
              color: theme === "dark" ? "#999" : "#666",
            }}
          >
            {book?.author}
          </p>

          {/* Cover Image */}
          {book?.cover_image && (
            <div
              style={{
                width: "100%",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f9f9f9",
                borderRadius: "6px",
                padding: "10px",
              }}
            >
              <img
                src={book.cover_image}
                alt={book?.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "240px",
                  objectFit: "contain",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            padding: "15px 20px",
            borderBottom: `1px solid ${theme === "dark" ? "#444" : theme === "sepia" ? "#e8dcc8" : "#eee"}`,
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
            paddingRight: "8px",
          }}
          className="hide-scrollbar"
        >
          {chapters.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: theme === "dark" ? "#999" : theme === "sepia" ? "#8b7355" : "#666",
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
                    theme === "dark" ? "#333" : theme === "sepia" ? "#e8dcc8" : "#f5f5f5"
                  }`,
                  cursor: "pointer",
                  backgroundColor:
                    idx === currentChapterIndex
                      ? theme === "dark"
                        ? "#333"
                        : theme === "sepia" ? "#f0e8d8" : "#f0f7ff"
                      : "transparent",
                  color:
                    idx === currentChapterIndex
                      ? theme === "dark"
                        ? "#fff"
                        : theme === "sepia" ? "#8b4513" : "#0db8a6"
                      : theme === "dark" ? "#e0e0e0" : theme === "sepia" ? "#5f4b32" : "#333",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget).style.backgroundColor = theme === "dark" ? "#2a2a2a" : theme === "sepia" ? "#f0e8d8" : "#f5f5f5";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget).style.backgroundColor = idx === currentChapterIndex ? (theme === "dark" ? "#333" : theme === "sepia" ? "#f0e8d8" : "#f0f7ff") : "transparent";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <div style={{ flex: 1 }}>{chapter.title}</div>
                  <span style={{ fontSize: "12px", opacity: 0.7, marginLeft: "10px", whiteSpace: "nowrap" }}>
                    {chapterPageCounts[chapter.id]
                      ? `${chapterPageCounts[chapter.id]} Pages`
                      : chapter.content 
                        ? `${calculateChapterPages(chapter.content)} Pages`
                        : chapter.end_page && chapter.start_page
                          ? `${chapter.end_page - chapter.start_page + 1} Pages`
                          : "~"
                    }
                  </span>
                </div>
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
            backgroundColor: theme === "dark" ? "#1a1a1a" : theme === "sepia" ? "#f8f1e3" : "#fff",
            borderBottom: `1px solid ${theme === "dark" ? "#333" : theme === "sepia" ? "#e8dcc8" : "#eee"}`,
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

          <button
            onClick={() => navigate("/library")}
            style={{
              background: "none",
              border: "none",
              color: themeStyles.color,
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              marginLeft: "10px",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            title="Back to Library"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12l9-9 9 9v7h-2v-5h-14v5H3v-7z"
                stroke="currentColor"
                fill="none"
                strokeWidth="1.5"
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
            {currentChapter ? `${currentChapter.title} • Page ${currentPage}/${totalPages}` : "Loading..."}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: theme === "light" ? "#666" : theme === "sepia" ? "#8b7355" : "#999",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme === "light" ? "#333" : theme === "sepia" ? "#5f4b32" : "#ccc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme === "light" ? "#666" : theme === "sepia" ? "#8b7355" : "#999";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" />
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1v3" />
                <path d="M16.97 5.03l2.12 2.12" />
                <path d="M23 12h-3" />
                <path d="M16.97 18.97l2.12 2.12" />
                <path d="M12 23v-3" />
                <path d="M7.03 18.97l-2.12 2.12" />
                <path d="M1 12h3" />
                <path d="M7.03 5.03l-2.12 2.12" />
              </g>
            </svg>
          </button>

          {/* Reading settings menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: "15px",
                backgroundColor: theme === "dark" ? "#1a1a1a" : theme === "sepia" ? "#fbf7eb" : "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                padding: "15px",
                width: "220px",
                zIndex: 10,
                color: theme === "dark" ? "#e8e8e8" : theme === "sepia" ? "#5f4b32" : "#333",
              }}
            >
              <div
                style={{
                  marginBottom: "15px",
                  borderBottom: `1px solid ${
                    theme === "dark" ? "#333" : theme === "sepia" ? "#e8dcc8" : "#eee"
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
                      backgroundColor: theme === "dark" ? "#333" : theme === "sepia" ? "#f0e8d8" : "#f5f5f5",
                      border: "none",
                      borderRadius: "4px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: theme === "dark" ? "#fff" : "#333",
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
                      backgroundColor: theme === "dark" ? "#333" : theme === "sepia" ? "#f0e8d8" : "#f5f5f5",
                      border: "none",
                      borderRadius: "4px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: theme === "dark" ? "#fff" : "#333",
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
                          ? "2px solid #0db8a6"
                          : theme === "sepia" ? "1px solid #d4c4a0" : "1px solid #ddd",
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
                          ? "2px solid #0db8a6"
                          : theme === "sepia" ? "1px solid #d4c4a0" : "1px solid #ddd",
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
                          ? "2px solid #0db8a6"
                          : theme === "sepia" ? "1px solid #d4c4a0" : "1px solid #ddd",
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

              <div
                style={{
                  marginTop: "15px",
                  borderTop: `1px solid ${
                    theme === "dark" ? "#333" : theme === "sepia" ? "#e8dcc8" : "#eee"
                  }`,
                  paddingTop: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Font
                </div>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: `1px solid ${theme === "dark" ? "#444" : theme === "sepia" ? "#d4c4a0" : "#ddd"}`,
                    backgroundColor: theme === "dark" ? "#333" : theme === "sepia" ? "#f0e8d8" : "#f9f9f9",
                    color: theme === "dark" ? "#fff" : theme === "sepia" ? "#5f4b32" : "#333",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <option value="system-sans">System Sans</option>
                  <option value="georgia">Georgia (Serif)</option>
                  <option value="times">Times (Classic)</option>
                  <option value="arial">Arial (Clean)</option>
                  <option value="courier">Courier (Mono)</option>
                </select>
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
            overflowY: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={contentRef}
            style={{
              maxWidth: "700px",
              width: "100%",
              padding: "40px 60px",
              backgroundColor: themeStyles.paperBackground,
              boxShadow:
                theme === "dark" ? "none" : theme === "sepia" ? "0 1px 3px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              lineHeight: "1.6",
              fontSize: `${fontSize}px`,
              fontFamily: getFontFamilyStyles(),
              margin: "0 20px",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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
              <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <h1 style={{ margin: "0 0 20px 0", fontSize: `${fontSize + 8}px`, flexShrink: 0 }}>
                  {currentChapter.title}
                </h1>
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {pageContent ? (
                    <div style={{ 
                      whiteSpace: "pre-wrap", 
                      wordWrap: "break-word",
                      overflowY: "auto",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      paddingRight: "8px",
                      scrollBehavior: "smooth",
                    }}
                    className="hide-scrollbar"
                    >
                      {pageContent}
                    </div>
                  ) : (
                    <div style={{ color: themeStyles.color, opacity: 0.7 }}>
                      No content available for this chapter.
                    </div>
                  )}
                </div>
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
            backgroundColor: theme === "dark" ? "#1a1a1a" : theme === "sepia" ? "#f8f1e3" : "#fff",
            borderTop: `1px solid ${theme === "dark" ? "#333" : theme === "sepia" ? "#e8dcc8" : "#eee"}`,
            zIndex: 4,
          }}
        >
          <button
            onClick={handlePreviousChapter}
            disabled={currentChapterIndex <= 0 && currentPage <= 1}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentChapterIndex <= 0 && currentPage <= 1 ? "default" : "pointer",
              opacity: currentChapterIndex <= 0 && currentPage <= 1 ? 0.5 : 1,
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
              color: themeStyles.color,
            }}
          >
            <span style={{ fontSize: "14px" }}>
              Page {currentPage} of {totalPages} • Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
          </div>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIndex >= chapters.length - 1 && currentPage >= totalPages}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentChapterIndex >= chapters.length - 1 && currentPage >= totalPages ? "default" : "pointer",
              opacity: currentChapterIndex >= chapters.length - 1 && currentPage >= totalPages ? 0.5 : 1,
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
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Read;
