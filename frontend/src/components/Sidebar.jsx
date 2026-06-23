import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  Bot,
  Briefcase,
  Users,
  FolderLock,
  PlusCircle,
  BellRing,
  User,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Navigation schema based on role
  const navItems = {
    Student: [
      { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/student/attendance', label: 'Attendance Logs', icon: CalendarCheck },
      { path: '/student/grades', label: 'Grades & Results', icon: GraduationCap },
      { path: '/student/timetable', label: 'Timetable', icon: CalendarDays },
      { path: '/student/materials', label: 'Study Materials', icon: BookOpen },
      { path: '/student/assignments', label: 'Assignments', icon: ClipboardList },
      { path: '/student/ai-recommender', label: 'AI Study Assistant', icon: Bot },
      { path: '/student/resume-builder', label: 'Resume Builder', icon: FileSpreadsheet },
      { path: '/student/placements', label: 'Opportunities', icon: Briefcase },
      { path: '/profile', label: 'My Profile', icon: User },
    ],
    Faculty: [
      { path: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/faculty/courses', label: 'My Subjects', icon: BookOpen },
      { path: '/faculty/attendance', label: 'Mark Attendance', icon: CalendarCheck },
      { path: '/faculty/grades', label: 'Upload Grades', icon: GraduationCap },
      { path: '/faculty/materials', label: 'Course Uploads', icon: PlusCircle },
      { path: '/profile', label: 'My Profile', icon: User },
    ],
    Admin: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'Manage Users', icon: Users },
      { path: '/admin/courses', label: 'Manage Courses', icon: FolderLock },
      { path: '/admin/reports', label: 'System Reports', icon: FileSpreadsheet },
      { path: '/profile', label: 'My Profile', icon: User },
    ]
  };

  const currentNav = navItems[user.role] || [];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/50 bg-white/85 dark:border-slate-800/50 dark:bg-slate-900/85 backdrop-blur-xl transition-all duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
              <span className="font-sans font-bold text-white text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Academix
            </span>
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 my-6 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100/50 p-4 dark:from-slate-800/30 dark:to-slate-800/50 border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user.name}</h4>
              <span className="inline-flex rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 dark:bg-indigo-600 dark:shadow-indigo-600/15'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/30">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
