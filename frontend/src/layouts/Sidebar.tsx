import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Share2,
  Sliders,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'BUSINESS_MANAGER', 'ANALYST'],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
    roles: ['ADMIN', 'BUSINESS_MANAGER', 'ANALYST'],
  },
  {
    label: 'Investigations',
    href: '/investigations',
    icon: ShieldAlert,
    roles: ['ADMIN', 'ANALYST'],
  },
  {
    label: 'Fraud Network',
    href: '/network',
    icon: Share2,
    roles: ['ADMIN', 'BUSINESS_MANAGER', 'ANALYST'],
  },
  {
    label: 'Rules Engine',
    href: '/rules',
    icon: Sliders,
    roles: ['ADMIN'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'BUSINESS_MANAGER'],
  },
  {
    label: 'Users & Access',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
];

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
    navigate('/login', { replace: true });
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const content = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 select-none">
      {/* Platform Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">
                CodeCelix
              </span>
              <span className="text-[10px] font-mono text-slate-400 -mt-0.5 tracking-tight">
                Risk & Fraud Platform
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-900"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Current Scope
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Actions & Sign Out */}
      <div className="p-3 border-t border-slate-800 shrink-0 space-y-1.5">
        <button
          id="sidebar-sign-out-btn"
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-slate-800"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
