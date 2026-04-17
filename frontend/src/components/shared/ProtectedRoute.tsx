import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AppRole } from "@/config/types/role";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}

// export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
//   const { role, isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!allowedRoles.includes(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// }

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isAuthenticated, isLoading } = useAuth();

  // waiting until auth is restored
  if (isLoading) {
    return <div>Loading...</div>; // or spinner
  }

  // not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // logged in but no persmissions
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}