// Centralized API configuration
// Uses VITE_API_BASE_URL environment variable in production,
// falls back to localhost for local development.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const API_URL = `${API_BASE_URL}/api`;
