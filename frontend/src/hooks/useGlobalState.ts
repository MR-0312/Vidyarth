import { useUIStore } from "../store/uiStore";

/**
 * Hook for theme state management
 * @returns { theme, setTheme, toggleTheme }
 */
export const useThemeState = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return { theme, setTheme, toggleTheme };
};

/**
 * Hook for sidebar state management
 * @returns { sidebarOpen, setSidebarOpen, toggleSidebar }
 */
export const useSidebarState = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return { sidebarOpen, setSidebarOpen, toggleSidebar };
};

/**
 * Hook for search state management
 * @returns { searchQuery, setSearchQuery, clearSearch }
 */
export const useSearchState = () => {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const clearSearch = useUIStore((state) => state.clearSearch);

  return { searchQuery, setSearchQuery, clearSearch };
};

/**
 * Hook for filter state management
 * @returns { selectedCategory, setSelectedCategory }
 */
export const useFilterState = () => {
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory);

  return { selectedCategory, setSelectedCategory };
};

/**
 * Hook for pagination state management
 * @returns { itemsPerPage, setItemsPerPage }
 */
export const usePaginationState = () => {
  const itemsPerPage = useUIStore((state) => state.itemsPerPage);
  const setItemsPerPage = useUIStore((state) => state.setItemsPerPage);

  return { itemsPerPage, setItemsPerPage };
};

/**
 * Hook for upload modal state management
 * @returns { uploadModalOpen, setUploadModalOpen }
 */
export const useUploadModalState = () => {
  const uploadModalOpen = useUIStore((state) => state.uploadModalOpen);
  const setUploadModalOpen = useUIStore((state) => state.setUploadModalOpen);

  return { uploadModalOpen, setUploadModalOpen };
};

/**
 * Hook to get entire global UI state (not recommended for performance)
 * Prefer specific hooks like useThemeState(), useSidebarState(), etc.
 */
export const useGlobalState = () => useUIStore();
