import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const normalizedUserRole = user.role?.toLowerCase().trim() || '';
    const hasRole = allowedRoles.some(role => role.toLowerCase().trim() === normalizedUserRole);
    
    // As a fallback, if the user role includes 'admin' and this route allows admin-like roles, let them in.
    const isAdminRoute = allowedRoles.some(r => r.toLowerCase().includes('admin'));
    const isUserAdmin = normalizedUserRole.includes('admin');
    
    if (!hasRole && !(isAdminRoute && isUserAdmin)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
