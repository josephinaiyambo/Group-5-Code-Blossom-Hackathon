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

  // User has NOT logged in
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but trying to access the wrong area
  if (userRole !== allowedRole) {
    if (userRole === "buyer") {
      return <Navigate to="/marketplace" replace />;
    }

    if (userRole === "seller") {
      return <Navigate to="/seller" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;