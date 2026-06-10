import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white select-none">
        <Zap className="w-5 h-5 text-indigo-400" />
        DevLog
      </Link>

      <div className="flex-1" />

      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
          <span className="text-xs text-gray-500 hidden sm:block capitalize">({user?.role})</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
