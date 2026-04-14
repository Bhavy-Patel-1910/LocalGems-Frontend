import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Gem, MessageCircle, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'talent' ? '/talent/dashboard' : '/dashboard';

  const navLinks = [
    { to: '/talent', label: 'Discover Talent' },
    { to: '/events', label: 'Events' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Gem size={18} className="text-white" />
            </div>
            <span className="text-gradient">LocalGems</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-brand-400 bg-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/chat" className="btn-ghost p-2 rounded-lg relative">
                  <MessageCircle size={20} />
                </Link>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm hover:border-brand-500 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-gray-200 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 card shadow-xl py-1" onMouseLeave={() => setDropdownOpen(false)}>
                      <div className="px-3 py-2 border-b border-dark-600">
                        <p className="text-xs text-gray-500">{user.role === 'talent' ? '🎤 Talent' : '🎯 Talent Provider'}</p>
                        <p className="text-sm font-medium text-gray-200 truncate">{user.email}</p>
                      </div>
                      <Link to={dashboardPath} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-dark-600 mt-2 pt-3 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-300 hover:bg-dark-700">Dashboard</Link>
                <Link to="/chat" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-300 hover:bg-dark-700">Messages</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-red-400 hover:bg-dark-700">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 px-4 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 py-2 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 py-2 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
