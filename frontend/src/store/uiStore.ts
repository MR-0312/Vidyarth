import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UIState {
  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Filter
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;

  // Pagination
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;

  // Upload Modal
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === "light" ? "dark" : "light" 
      })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Search
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: "" }),

      // Filter
      selectedCategory: undefined,
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Pagination
      itemsPerPage: 10,
      setItemsPerPage: (count) => set({ itemsPerPage: count }),

      // Upload Modal
      uploadModalOpen: false,
      setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);
