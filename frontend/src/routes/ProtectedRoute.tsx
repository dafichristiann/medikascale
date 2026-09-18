import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface Props {
  children: JSX.Element;
  /** Jika diisi, user harus punya permission ini untuk masuk. */
  requirePermission?: string;
  /** Jika diisi, user harus punya SALAH SATU permission ini (mis. resep.kirim ATAU resep.proses). */
  requireAnyPermission?: string[];
}

export default function ProtectedRoute({ children, requirePermission, requireAnyPermission }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/demo-role" replace />;

  if (requirePermission && !user.permissions.includes(requirePermission)) {
    return <Navigate to="/403" replace />;
  }
  if (requireAnyPermission && !requireAnyPermission.some((p) => user.permissions.includes(p))) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
