import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileQuestion,
  BarChart3,
  Users as UsersIcon,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  GraduationCap,
  AlertCircle
} from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import Tests from './pages/Tests';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Reports from './pages/Reports';

function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Questions', path: '/admin/questions', icon: FileQuestion },
    { label: 'Tests', path: '/admin/tests', icon: FileText },
    { label: 'Reports', path: '/admin/reports', icon: AlertCircle },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Users', path: '/admin/users', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-black text-sm tracking-tight">NEET PYQ Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-3 space-y-1 z-40 sticky top-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-3"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Left Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen sticky top-0 flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black tracking-tight text-base text-neutral-900 dark:text-neutral-50 block leading-tight">
                NEET PYQ
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items (Vertical List) */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions inside Left Sidebar */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-400" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-neutral-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/questions" element={<Questions />} />
          <Route path="/admin/tests" element={<Tests />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
