import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { ShieldX } from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-center text-rose-400 mb-4">
          <ShieldX className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-100">Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
          Your current role profile (<span className="font-mono text-rose-300 font-semibold">{role}</span>) does not possess permission to access this module.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Navigate to="/dashboard" state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
