import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL as API_BASE_URL } from "../config/api";

interface User {
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  validateToken: async () => false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("koodoreader_token");
      const storedUser = localStorage.getItem("koodoreader_user");
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(parsedUser.role === 'admin');
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          localStorage.removeItem("koodoreader_user");
          localStorage.removeItem("koodoreader_token");
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setIsInitialized(true);
    };

    initializeAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "koodoreader_token") {
        if (!e.newValue) {
          // Token was removed (logout from another tab)
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Validate token periodically or on-demand
  const validateToken = async (): Promise<boolean> => {
    const token = localStorage.getItem("koodoreader_token");
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.ok) {
        return true;
      } else {
        // Token is invalid/expired
        logout();
        return false;
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
    localStorage.setItem("koodoreader_user", JSON.stringify(userData));
  };

  const logout = async () => {
    const token = localStorage.getItem("koodoreader_token");
    
    // Call backend logout endpoint to blacklist the token
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Backend logout failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error calling logout endpoint:', error);
      }
    }
    
    // Clear local state regardless of backend response
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("koodoreader_user");
    localStorage.removeItem("koodoreader_token");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    validateToken,
  };

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
