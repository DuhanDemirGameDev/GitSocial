import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

function DashboardLayout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Feed', path: '/', icon: 'F' },
    { name: 'Jobs', path: '/jobs', icon: 'J' },
    { name: 'Communities', path: '/communities', icon: 'C' },
    { name: 'Profile', path: '/profile', icon: 'P' },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter">
          Git<span className="text-blue-500">Social</span>
        </div>

        <div className="flex-1 max-w-md px-8 hidden md:block">
          <div className="relative group">
            <input
              type="text"
              className="block w-full pl-4 pr-4 py-1.5 border border-gray-800 rounded-xl bg-gray-800/40 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full border border-gray-700 shadow-sm"></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 p-2 rounded-2xl shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-700/50 transition-all active:scale-90"
            >
              <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-gray-800 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700 shadow-xl transition-all duration-200">
                {item.name}
              </span>

              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-all">
                {item.icon}
              </span>
            </Link>
          ))}

          <div className="w-px h-6 bg-gray-700 mx-1"></div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex items-center justify-center w-12 h-12 rounded-xl hover:bg-red-500/10 transition-all active:scale-90 disabled:opacity-50"
          >
            <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-gray-800 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700 shadow-xl transition-all duration-200">
              Logout
            </span>
            <span className="text-sm font-bold text-red-300">
              {isLoggingOut ? '...' : 'Q'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default DashboardLayout;
