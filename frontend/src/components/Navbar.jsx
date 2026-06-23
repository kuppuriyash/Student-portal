import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Bell, User, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, fetchWithAuth } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch announcements for notification bell
  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === 'Student' 
          ? '/student/dashboard' 
          : user.role === 'Faculty' 
            ? '/faculty/dashboard' 
            : '/admin/dashboard';
            
        const json = await fetchWithAuth(endpoint);
        if (json.success) {
          const list = json.data.announcements || [];
          setAnnouncements(list.slice(0, 4));
          setUnreadCount(list.length > 0 ? 1 : 0); // Mock check unread
        }
      } catch (err) {
        console.error('Error loading notices for navbar:', err);
      }
    };

    loadAnnouncements();
    // Refresh notices every minute
    const interval = setInterval(loadAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/40 bg-white/70 dark:border-slate-800/40 dark:bg-slate-950/70 backdrop-blur-md px-6">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back,</h2>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{user.name}</h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
        </button>

        {/* Notifications Icon & Panel */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0); // Mark read on click
            }}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-80 z-50 rounded-2xl border border-slate-200/50 bg-white p-2 shadow-xl dark:border-slate-800/50 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Notices</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Auto-synced</span>
                </div>

                <div className="py-1 max-h-72 overflow-y-auto">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <div 
                        key={ann._id} 
                        className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer border-b border-slate-100/50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            ann.category === 'Exam' ? 'bg-rose-500' :
                            ann.category === 'Placement' ? 'bg-amber-500' :
                            ann.category === 'Academic' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ann.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications logged.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile dropdown helper */}
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
