import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";
import UploadModal from "../components/UploadModal";
import { useBooks } from "../hooks/useBooks";
import { SIDEBAR_ITEMS } from "../constants/libraryConstants";
import {
  BooksIcon,
  FavoritesIcon,
  NotesIcon,
  HighlightsIcon,
  TrashIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  GridIcon,
  ListIcon,
  LightIcon,
  DarkIcon,
  UploadIcon,
} from "../utils/icons";

const sidebarItemsWithIcons = SIDEBAR_ITEMS.map((item) => ({
  ...item,
  icon:
    item.id === "books" ? (
      <BooksIcon />
    ) : item.id === "favorites" ? (
      <FavoritesIcon />
    ) : item.id === "notes" ? (
      <NotesIcon />
    ) : item.id === "highlights" ? (
      <HighlightsIcon />
    ) : item.id === "contributions" ? (
      <UploadIcon />
    ) : item.id === "contribute" ? (
      <UploadIcon />
    ) : (
      <TrashIcon />
    ),
}));

const Library = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("books");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userContributions, setUserContributions] = useState<Array<{
    id: string;
    title: string;
    author: string;
    cover: string;
    format: string;
    description?: string;
    categories?: string[];
    rating?: number;
    progress: number;
  }>>([]);
  const [allLibraryBooks, setAllLibraryBooks] = useState<Array<{
    id: string;
    title: string;
    author: string;
    cover: string;
    format: string;
    description?: string;
    categories?: string[];
    rating?: number;
    progress?: number;
  }>>([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all books for the library
  const { books: dynamicBooks, loading: booksLoading } = useBooks({ limit: 100, autoFetch: activeNavItem === "books" });

  // Set library books when fetched
  useEffect(() => {
    if (activeNavItem === "books" && dynamicBooks.length > 0) {
      setAllLibraryBooks(dynamicBooks);
    }
  }, [dynamicBooks, activeNavItem]);

  // Fetch user contributions when the contributions tab is selected
  useEffect(() => {
    if (activeNavItem === "contributions" && user) {
      fetchUserContributions();
    }
  }, [activeNavItem, user]);

  const fetchUserContributions = async () => {
    setIsLoadingContributions(true);
    setError(null);
    try {
      const token = localStorage.getItem("koodoreader_token");
      if (!token) {
        setError("Please login to view your contributions");
        setIsLoadingContributions(false);
        return;
      }

      const response = await fetch("http://localhost:8080/api/contributions/me", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to view your contributions");
        } else {
          setError("Failed to load contributions");
        }
        throw new Error("Failed to fetch contributions");
      }

      const data = await response.json();
      // Transform contributions to display book data
      const books = data.map((contribution: {
        _id: string;
        bookId?: {
          title?: string;
          author?: string;
          description?: string;
          coverImage?: string;
          fileFormat?: string;
          categories?: string[];
          averageRating?: number;
        };
      }) => {
        const coverPath = contribution.bookId?.coverImage || "";
        // Normalize Windows paths to URL format
        const normalizedPath = coverPath.replace(/\\/g, "/");
        const coverUrl = normalizedPath 
          ? `http://localhost:8080/${normalizedPath}` 
          : "https://covers.openlibrary.org/b/id/12860656-L.jpg";
        
        return {
          id: contribution._id,
          title: contribution.bookId?.title || "Unknown",
          author: contribution.bookId?.author || "Unknown",
          cover: coverUrl,
          format: (contribution.bookId?.fileFormat || "pdf").toUpperCase(),
          description: contribution.bookId?.description || "",
          categories: contribution.bookId?.categories || [],
          rating: contribution.bookId?.averageRating || 0,
          progress: 0,
        };
      });
      setUserContributions(books);
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setError("Failed to load contributions");
    } finally {
      setIsLoadingContributions(false);
    }
  };

  const handleSidebarItemClick = (itemId: string) => {
    if (itemId === "contribute") {
      setIsUploadModalOpen(true);
    } else {
      setActiveNavItem(itemId);
    }
  };

  // Determine which books to display based on active tab
  let displayBooks = allLibraryBooks;
  let isLoading = booksLoading;

  if (activeNavItem === "contributions") {
    displayBooks = userContributions;
    isLoading = isLoadingContributions;
  } else if (activeNavItem === "favorites" || activeNavItem === "notes" || activeNavItem === "highlights" || activeNavItem === "trash") {
    // For other tabs, show empty or filtered data (can be expanded later)
    displayBooks = [];
    isLoading = false;
  }

  const containerStyles: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  };

  const mainContentStyles: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "15px 20px",
    borderBottom: "1px solid var(--border-solid)",
    backgroundColor: "var(--bg-primary)",
  };

  const searchContainerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flex: 1,
    maxWidth: "400px",
    position: "relative",
    backgroundColor: "var(--search-bg)",
    borderRadius: "20px",
    padding: "6px 15px",
  };

  const headerButtonGroupStyles: React.CSSProperties = {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "22px",
  };

  return (
    <div style={containerStyles}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        items={sidebarItemsWithIcons}
        activeItem={activeNavItem}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main content */}
      <div style={mainContentStyles}>
        {/* Header */}
        <header style={headerStyles}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "5px",
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon />
          </button>

          {/* Search bar */}
          <div style={searchContainerStyles}>
            <input
              type="text"
              placeholder="Search my library"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "var(--text-primary)",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                padding: "5px",
              }}
            />
            <span style={{ position: "absolute", right: "12px" }}>
              <SearchIcon />
            </span>
          </div>

          {/* Header Actions */}
          <div style={headerButtonGroupStyles}>
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "0",
                display: "flex",
              }}
              title="Settings"
            >
              <SettingsIcon />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              style={{
                background: "none",
                border: "1px solid var(--border-solid)",
                borderRadius: "20px",
                padding: "5px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--text-primary)",
                fontSize: "13px",
              }}
            >
              {theme === "dark" ? <LightIcon /> : <DarkIcon />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* Tools bar (view/sort options) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            backgroundColor: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-solid)",
            gap: "15px",
          }}
        >
          {/* View Mode Buttons */}
          <button
            onClick={() => setViewMode("grid")}
            style={{
              background: "none",
              border: "none",
              color: viewMode === "grid" ? "#0078ff" : "var(--text-muted)",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            title="Grid view"
          >
            <GridIcon />
          </button>

          <button
            onClick={() => setViewMode("list")}
            style={{
              background: "none",
              border: "none",
              color: viewMode === "list" ? "#0078ff" : "var(--text-muted)",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            title="List view"
          >
            <ListIcon />
          </button>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--text-primary)",
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

        {/* Books Grid/List */}
        <main
          style={{
            flex: 1,
            padding: "30px",
            backgroundColor: "var(--bg-primary)",
            overflowY: "auto",
          }}
        >
          {/* Loading State */}
          {activeNavItem === "contributions" && isLoading && (
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <p>Loading your contributions...</p>
            </div>
          )}

          {/* Error State */}
          {activeNavItem === "contributions" && error && (
            <div style={{ textAlign: "center", color: "#ff6b6b" }}>
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {activeNavItem === "contributions" &&
            !isLoading &&
            userContributions.length === 0 &&
            !error && (
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <p>You haven't contributed any books yet.</p>
                <p style={{ fontSize: "14px" }}>
                  Click on "Contribute" to share your first book!
                </p>
              </div>
            )}

          {/* Books Grid/List */}
          {displayBooks.length > 0 && (
            <div
              style={{
                display:
                  viewMode === "grid"
                    ? "grid"
                    : "flex",
                gridTemplateColumns:
                  viewMode === "grid"
                    ? "repeat(auto-fill, minmax(180px, 1fr))"
                    : undefined,
                flexDirection:
                  viewMode === "list" ? "column" : undefined,
                gap: "30px",
              }}
            >
              {displayBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          console.log("File uploaded successfully");
          // Refresh contributions if the user is viewing that tab
          if (activeNavItem === "contributions" && user) {
            fetchUserContributions();
          }
        }}
      />
    </div>
  );
};

// Book Card Component
interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    format: string;
    description?: string;
    progress?: number;
    categories?: string[];
    rating?: number;
  };
  viewMode: "grid" | "list";
}

// Helper component for category display with hoverable card
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
              backgroundColor: "#0078ff",
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
                  backgroundColor: "#0078ff",
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

const BookCard = ({ book, viewMode }: BookCardProps) => {
  if (viewMode === "list") {
    return (
      <div
        style={{
          display: "flex",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "var(--bg-card)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          minHeight: "180px",
          gap: "15px",
          padding: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "120px",
            flexShrink: 0,
            backgroundColor: "var(--bg-image)",
            overflow: "hidden",
            borderRadius: "6px",
          }}
        >
          <img
            src={book.cover}
            alt={book.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--text-book-title)",
              }}
            >
              {book.title}
            </h3>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              {book.author}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                padding: "3px 10px",
                backgroundColor: "var(--bg-elevated)",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              {book.format}
            </span>
            {book.rating != null && book.rating > 0 && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontWeight: "500",
                }}
              >
                ⭐ {book.rating.toFixed(1)}
              </span>
            )}
            {book.progress != null && book.progress > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginLeft: "auto",
                }}
              >
                {book.progress}% read
              </span>
            )}
          </div>
          {book.categories && book.categories.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <CategoryTags categories={book.categories} maxDisplay={2} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "var(--bg-card)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        height: "100%",
        border: "1px solid var(--border-color)",
      }}
    >
      <div
        style={{
          position: "relative",
          paddingBottom: "140%",
          backgroundColor: "var(--bg-image)",
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
        {book.progress != null && book.progress > 0 && (
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
            fontWeight: "600",
            color: "var(--text-book-title)",
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
            margin: "0 0 8px 0",
            fontSize: "13px",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: "500",
          }}
        >
          {book.author}
        </p>
        {book.categories && book.categories.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <CategoryTags categories={book.categories} maxDisplay={2} />
          </div>
        )}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              padding: "3px 8px",
              backgroundColor: "var(--bg-elevated)",
              borderRadius: "4px",
              fontWeight: "500",
            }}
          >
            {book.format}
          </span>
          {book.rating != null && book.rating > 0 && (
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              ⭐ {book.rating.toFixed(1)}
            </span>
          )}
          {book.progress != null && book.progress > 0 && (
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginLeft: "auto",
              }}
            >
              {book.progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
