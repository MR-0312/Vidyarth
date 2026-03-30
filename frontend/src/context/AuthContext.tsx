import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8080/api";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token is stored in localStorage
    const token = localStorage.getItem("koodoreader_token");
    const storedUser = localStorage.getItem("koodoreader_user");
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("koodoreader_user");
        localStorage.removeItem("koodoreader_token");
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
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
    localStorage.removeItem("koodoreader_user");
    localStorage.removeItem("koodoreader_token");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
