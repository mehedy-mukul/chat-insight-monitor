
// Environment variables with fallbacks for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5678";
export const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY || "mysecretkey";
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "password123";
