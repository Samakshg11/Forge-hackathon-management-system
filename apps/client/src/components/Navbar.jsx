import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Bell, Search, Sun, Moon, LogOut, LayoutDashboard, User, Bookmark, Award, Shield, PlusCircle, Trophy } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, setIsOpen: setNotifOpen } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand logo & wordmark (Doc 1 §6.1) */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center text-white font-bold text-lg shadow-glow group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-text-primary uppercase">
            FORGE
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link
            to="/hackathons"
            className={`hover:text-text-primary transition-colors ${
              location.pathname.startsWith('/hackathons') ? 'text-accent-primary font-semibold' : ''
            }`}
          >
            Explore Hackathons
          </Link>
          {user && (
            <Link
              to="/app/dashboard"
              className={`hover:text-text-primary transition-colors ${
                location.pathname.startsWith('/app/dashboard') ? 'text-accent-primary font-semibold' : ''
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border-subtle text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="font-mono text-[10px] bg-surface-raised px-1.5 py-0.5 rounded border border-border-subtle">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>

                {dropdownOpen && (
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-surface border border-border-subtle rounded-lg shadow-xl py-2 z-50 glass-panel"
                  >
                    <div className="px-4 py-2.5 border-b border-border-subtle">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-secondary truncate">{user.email}</p>
                      <div className="mt-1">
                        <Badge role={user.role} />
                      </div>
                    </div>

                    <Link
                      to="/app/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/app/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>

                    {user.role === 'organizer' && (
                      <Link
                        to="/app/organizer/hackathons/new"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create Hackathon
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/app/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-status-danger hover:bg-surface-raised"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-raised transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-xs font-medium bg-accent-primary hover:bg-accent-primary-hover text-white px-3.5 py-1.5 rounded-md shadow-glow transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
