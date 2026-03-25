// Sidebar navigation items
export const SIDEBAR_ITEMS = [
  {
    id: "books",
    label: "Books",
  },
  {
    id: "favorites",
    label: "Favorites",
  },
  {
    id: "notes",
    label: "Notes",
  },
  {
    id: "highlights",
    label: "Highlights",
  },
  {
    id: "trash",
    label: "Trash",
  },
  {
    id: "contributions",
    label: "My Contributions",
  },
  {
    id: "contribute",
    label: "Contribute",
  },
];

// Sample books data
export const SAMPLE_BOOKS = [
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

// Sort options
export const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
];

// View modes
export const VIEW_MODES = ["grid", "list"] as const;
