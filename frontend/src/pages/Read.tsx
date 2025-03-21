import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Read = () => {
  const { bookId } = useParams();
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light"); // light, dark, sepia
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(345);
  const [menuOpen, setMenuOpen] = useState(false);

  // Book content - this would normally come from API
  const bookContent = {
    title: "The Shaman's Shadow",
    author: "Elizabeth Rowe",
    chapters: [
      { id: 1, title: "Chapter 1: The Beginning", pages: [1, 15] },
      { id: 2, title: "Chapter 2: The Encounter", pages: [16, 32] },
      { id: 3, title: "Chapter 3: The Discovery", pages: [33, 48] },
      { id: 4, title: "Chapter 4: The Journey", pages: [49, 67] },
      { id: 5, title: "Chapter 5: The Challenge", pages: [68, 89] },
      { id: 6, title: "Chapter 6: The Revelation", pages: [90, 110] },
      { id: 7, title: "Chapter 7: The Conflict", pages: [111, 132] },
      { id: 8, title: "Chapter 8: The Resolution", pages: [133, 156] },
      { id: 9, title: "Chapter 9: The Aftermath", pages: [157, 172] },
      { id: 10, title: "Chapter 10: New Beginnings", pages: [173, 195] },
      { id: 11, title: "Chapter 11: Unexpected Turns", pages: [196, 215] },
      { id: 12, title: "Chapter 12: Hidden Truths", pages: [216, 238] },
      { id: 13, title: "Chapter 13: Facing the Past", pages: [239, 260] },
      { id: 14, title: "Chapter 14: The Decision", pages: [261, 284] },
      { id: 15, title: "Chapter 15: The Final Test", pages: [285, 310] },
      { id: 16, title: "Chapter 16: Coming Full Circle", pages: [311, 334] },
      { id: 17, title: "Epilogue", pages: [335, 345] },
    ],
    currentChapter: 3,
  };

  // Sample text for the current page
  const sampleText = `
  <h2>Chapter 3: The Discovery</h2>
  <p>Sarah stepped carefully through the undergrowth, her feet finding the natural path between gnarled roots and moss-covered stones. The air was thick with the scent of damp earth and pine, a comforting smell that reminded her of childhood adventures in the woods behind her grandmother's house.</p>
  <p>But these were not those woods. This forest felt ancient, watching, aware in a way she couldn't articulate. The shaman's directions had been clear: follow the stream until it splits around the large boulder, then take the eastern fork until you reach the clearing with the standing stones.</p>
  <p>"Look for the stone that doesn't cast a shadow at noon," he had told her, his eyes clouded with cataracts but somehow seeing through her. "That's where you'll find what was lost."</p>
  <p>The clearing appeared suddenly, as if the forest had drawn back its green curtains to reveal a perfect circle of standing stones. There were twelve of them, each twice her height and covered in lichen and symbols worn almost smooth by centuries of wind and rain. Sarah checked her watch: 11:53 AM.</p>
  <p>She moved to the center of the circle and waited, studying each stone in turn. They all cast shadows now, dark fingers pointing inward as if indicating the heart of the circle. As the minutes passed, the shadows shortened, and at precisely noon, Sarah saw it—the third stone from the north entrance stood shadowless, illuminated perfectly by the sun overhead.</p>
  <p>Her heart racing, she approached the stone, running her fingers over its rough surface, feeling for anything unusual. Near the base, her fingers found a small recess, hidden by the moss and dirt of ages. Inside was something smooth and cool to the touch. She carefully extracted it: a small figurine carved from jade, depicting a creature half-wolf, half-human.</p>
  <p>The shaman's words came back to her: "The guardian waits to be awakened. Once found, the path between worlds opens."</p>
  <p>As she held the figurine, it seemed to grow warm in her palm. A wind rose suddenly, circling the stones, and Sarah could have sworn she heard whispers in a language she didn't understand but somehow recognized. The shadows of the stones began to move, no longer following the dictates of the sun but swirling like liquid across the ground.</p>
  <p>Sarah clutched the jade figurine tightly as the world around her began to shimmer and shift. She had found what was lost, but now she realized this was just the beginning of a much larger discovery.</p>
  `;

  useEffect(() => {
    // Set up the chapter based on current page
    const currentChapter = bookContent.chapters.find(
      (chapter) =>
        currentPage >= chapter.pages[0] && currentPage <= chapter.pages[1]
    );

    // This would normally update more data or fetch the content for this page
    document.title = `Reading: ${bookContent.title}`;

    // Add keyboard event listeners for navigation
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

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
            {bookContent.title}
          </h2>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: theme === "dark" ? "#999" : "#666",
            }}
          >
            {bookContent.author}
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
          {bookContent.chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => setCurrentPage(chapter.pages[0])}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                borderBottom: `1px solid ${
                  theme === "dark" ? "#333" : "#f5f5f5"
                }`,
                cursor: "pointer",
                backgroundColor:
                  currentPage >= chapter.pages[0] &&
                  currentPage <= chapter.pages[1]
                    ? theme === "dark"
                      ? "#333"
                      : "#f0f7ff"
                    : "transparent",
                color:
                  currentPage >= chapter.pages[0] &&
                  currentPage <= chapter.pages[1]
                    ? theme === "dark"
                      ? "#fff"
                      : "#0078ff"
                    : themeStyles.color,
              }}
            >
              {chapter.title}
              <div
                style={{
                  fontSize: "12px",
                  color: theme === "dark" ? "#777" : "#999",
                  marginTop: "3px",
                }}
              >
                Pages {chapter.pages[0]}-{chapter.pages[1]}
              </div>
            </div>
          ))}
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
            Page {currentPage} of {totalPages}
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
            <div dangerouslySetInnerHTML={{ __html: sampleText }} />
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
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentPage <= 1 ? "default" : "pointer",
              opacity: currentPage <= 1 ? 0.5 : 1,
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
            }}
          >
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) =>
                setCurrentPage(
                  Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    totalPages
                  )
                )
              }
              style={{
                width: "50px",
                padding: "5px",
                textAlign: "center",
                border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                borderRadius: "4px",
                backgroundColor: "transparent",
                color: themeStyles.color,
              }}
            />
            <span
              style={{
                margin: "0 10px",
                color: theme === "dark" ? "#777" : "#777",
              }}
            >
              of {totalPages}
            </span>
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage >= totalPages}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: currentPage >= totalPages ? "default" : "pointer",
              opacity: currentPage >= totalPages ? 0.5 : 1,
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
