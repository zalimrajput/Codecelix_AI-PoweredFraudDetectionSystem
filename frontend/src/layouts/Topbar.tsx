import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Dropdown } from '../components/ui/Dropdown';

export interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuOpen }) => {
  const navigate = useNavigate();
  const { user, role, setRole, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const availableRoles: { role: UserRole; label: string }[] = [
    { role: 'ADMIN', label: 'Admin (Full Access)' },
    { role: 'BUSINESS_MANAGER', label: 'Business Manager' },
    { role: 'ANALYST', label: 'Fraud Analyst' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-6">
      {/* Mobile Menu & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions, customer IDs, IPs, or devices (Ctrl+K)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Development Role View Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] text-slate-400">Preview Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-transparent text-indigo-300 text-xs font-medium focus:outline-none cursor-pointer"
            aria-label="Switch UI role view"
          >
            {availableRoles.map((r) => (
              <option key={r.role} value={r.role} className="bg-slate-900 text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-slate-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-elevated p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Live Stream
                </span>
              </div>
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">No active alerts at this moment</p>
                <p className="text-[11px] text-slate-500 mt-1">Real-time alerts will trigger upon telemetry detection.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              id="topbar-user-profile-btn"
              type="button"
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-900 transition-colors text-slate-300"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200 leading-tight">
                  {user ? user.fullName : 'Security Analyst'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 leading-tight">
                  {role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
          }
          items={[
            {
              id: 'profile',
              label: 'Identity Settings',
              icon: <User className="w-3.5 h-3.5" />,
              onClick: () => {},
            },
            {
              id: 'logout',
              label: 'Sign Out',
              icon: <LogOut className="w-3.5 h-3.5" />,
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
};
