import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import {
  LayoutDashboard,
  Trophy,
  Users,
  FileCode,
  Award,
  Bookmark,
  Shield,
  CheckSquare,
  Settings as SettingsIcon,
  BarChart3,
  ListTodo,
} from 'lucide-react';

export function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Role-aware sidebar items (Document 2 §1 & Document 6 §2)
  const getNavItems = () => {
    switch (user?.role) {
      case 'organizer':
        return [
          { label: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
          { label: 'My Hackathons', path: '/app/organizer', icon: Trophy },
          { label: 'Create Hackathon', path: '/app/organizer/hackathons/new', icon: FileCode },
          { label: 'Analytics', path: '/app/admin/analytics', icon: BarChart3 },
        ];
      case 'judge':
        return [
          { label: 'Assigned Queue', path: '/app/judge', icon: CheckSquare },
          { label: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
        ];
      case 'admin':
        return [
          { label: 'Admin Overview', path: '/app/admin', icon: Shield },
          { label: 'User Directory', path: '/app/admin/users', icon: Users },
          { label: 'Audit Logs', path: '/app/admin/logs', icon: ListTodo },
          { label: 'Analytics', path: '/app/admin/analytics', icon: BarChart3 },
        ];
      case 'participant':
      default:
        return [
          { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { label: 'Bookmarks', path: '/app/bookmarks', icon: Bookmark },
          { label: 'Certificates', path: '/app/certificates', icon: Award },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-xl p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
