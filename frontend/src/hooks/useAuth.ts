import { useContext } from "react";
import AuthContext from "../context/AuthContext";
// Removed conflicting import

export const useAuth = () => {
  return useContext(AuthContext);
}; // Local declaration retained
