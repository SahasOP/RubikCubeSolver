import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: any) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute;
