import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const user = auth?.user;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
