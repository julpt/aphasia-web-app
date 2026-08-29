import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export default function RequireAdmin({ children }: { children: ReactNode  }) {
  const { role, loading } = useAuth();

  if (loading) return null;
  if (role !== 'ADMIN') return <Navigate to="/exercises" replace />;

  return children;
}