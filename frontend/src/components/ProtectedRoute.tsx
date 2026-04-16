import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { validateToken } = useAuth();
  const location = useLocation();
  const [isValidated, setIsValidated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage directly
      const token = localStorage.getItem("koodoreader_token");
      
      if (!token) {
        setIsValidated(false);
        return;
      }

      // Then validate with backend
      const isValid = await validateToken();
      setIsValidated(isValid);
    };

    checkAuth();
  }, [location.pathname, validateToken]);

  // While validating, don't render anything to prevent flash of content
  if (isValidated === null) {
    return null;
  }

  return isValidated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
