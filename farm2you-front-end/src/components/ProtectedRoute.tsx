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

  /* =====================================
     1. NOT LOGGED IN
  ===================================== */

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }


  /* =====================================
     2. BUYER TRYING TO ACCESS SELLER PAGE
  ===================================== */

  if (
    userRole === "buyer" &&
    allowedRole !== "buyer"
  ) {
    return (
      <Navigate
        to="/buyer/need"
        replace
      />
    );
  }


  /* =====================================
     3. SELLER TRYING TO ACCESS BUYER PAGE
  ===================================== */

  if (
    userRole === "seller" &&
    allowedRole !== "seller"
  ) {
    return (
      <Navigate
        to="/seller"
        replace
      />
    );
  }


  /* =====================================
     4. INVALID ROLE
  ===================================== */

  if (
    userRole !== "buyer" &&
    userRole !== "seller"
  ) {
    localStorage.removeItem("userRole");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* =====================================
     5. CORRECT ROLE
  ===================================== */

  return children;
}

export default ProtectedRoute;