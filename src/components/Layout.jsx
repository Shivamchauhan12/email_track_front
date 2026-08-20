import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { LogOut, Mail, Menu } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600 shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Email Tracker</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-gray-600 truncate max-w-[120px] sm:max-w-xs">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 py-1.5 px-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

