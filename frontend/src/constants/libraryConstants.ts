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

// Sort options
export const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
];

// View modes
export const VIEW_MODES = ["grid", "list"] as const;
