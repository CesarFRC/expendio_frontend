import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';

export function PrivateRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user?.rol?.nombre !== 'Admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
