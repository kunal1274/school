'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Students', href: '/students', icon: '👨‍🎓' },
  { name: 'Teachers', href: '/teachers', icon: '👩‍🏫' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Transport', href: '/transport-customers', icon: '🚌' },
  { name: 'Fees', href: '/fees', icon: '💰' },
  { name: 'Reports', href: '/fees/reports', icon: '📈' },
  // Insurance section
  { name: 'Insurers', href: '/insurers', icon: '🏢' },
  { name: 'Policies', href: '/policies', icon: '📋' },
  { name: 'Customer Policies', href: '/customer-policies', icon: '📄' },
  { name: 'Policy Payments', href: '/policy-payments', icon: '💳' },
  { name: 'Claims', href: '/claims', icon: '⚖️' },
  { name: 'Insurance Reports', href: '/insurance/reports', icon: '📊' },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: '👤' },
  { name: 'Activity Logs', href: '/activity-logs', icon: '📋' },
  { name: 'Backup & Restore', href: '/backup-restore', icon: '💾' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // On desktop, start with sidebar open by default
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (pathname === href) return true;
    // Special case for fees - only match exact path, not sub-paths
    if (href === '/fees') {
      return pathname === '/fees';
    }
    // For other paths, allow sub-paths
    return pathname.startsWith(href + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg
        flex-shrink-0
        ${!sidebarOpen && !isMobile ? 'lg:hidden' : ''}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-orange-500">
          <h1 className="text-xl font-bold text-white">Tuition Manager</h1>
          {/* Desktop sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 rounded-md text-white hover:bg-orange-600 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 pb-4 overflow-y-auto h-full">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>

          {user?.role === 'admin' && (
            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administration
              </h3>
              <div className="space-y-2">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Info at bottom */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop sidebar toggle button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title for mobile */}
            <div className="lg:hidden flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {navigation.find(item => isActive(item.href))?.name || 
                 adminNavigation.find(item => isActive(item.href))?.name || 
                 'Tuition Manager'}
              </h1>
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm">
                <span className="text-gray-500">Welcome,</span>
                <span className="font-medium text-gray-900 ml-1">{user?.name}</span>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="sm:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}