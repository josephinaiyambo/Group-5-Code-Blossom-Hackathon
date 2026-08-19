import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: "buyer" | "seller";
}

function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const userRole = localStorage.getItem("userRole");

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    if (userRole === "buyer") {
      return <Navigate to="/buyer/need" replace />;
    }

    if (userRole === "seller") {
      return <Navigate to="/seller" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;