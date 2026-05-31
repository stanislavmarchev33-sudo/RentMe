import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Plus, Bell, LogOut, Settings, Home, Search, User, MessageSquare, Menu, X
} from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69c469273e636ee05afbc0bf/df76933c9_IMG_7117.png';

export default function Navbar() {
  const { t, lang, switchLang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  const [user, setUser] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user?.email) {
      base44.entities.Notification.filter({ user_email: user.email, is_read: false })
        .then(n => setNotifCount(n.length)).catch(() => {});
      
      // Track unread message threads
      base44.entities.ChatThread.list('-updated_date', 100)
        .then(threads => {
          const mine = threads.filter(t => t.participant_emails?.includes(user.email));
          const unread = mine.filter(t => t.unread_count > 0).length;
          setUnreadMessages(unread);
        }).catch(() => {});
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe(() => {
      base44.entities.ChatThread.list('-updated_date', 100)
        .then(threads => {
          const mine = threads.filter(t => t.participant_emails?.includes(user.email));
          const unread = mine.filter(t => t.unread_count > 0).length;
          setUnreadMessages(unread);
        }).catch(() => {});
    });
    return unsubscribe;
  }, [user?.email]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const publicNavItems = [
    { label: 'Начало', action: () => goTo('/') },
    { label: 'Как работи', action: () => goTo('/how-it-works') },
    { label: 'Въпроси', action: () => goTo('/faq') },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={LOGO_URL}
                alt="RentMe"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Primary Nav — hidden on mobile, shown on md+ */}
            <div className="hidden md:flex items-center gap-1">
              {publicNavItems.map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="px-3 sm:px-4 py-2 rounded-xl text-[13px] sm:text-sm font-medium text-gray-600 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-500 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {user ? (
                <>
                  <Link to="/notifications" className="relative">
                    <button className="p-2 rounded-xl text-gray-500 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all">
                      <Bell className="w-5 h-5" />
                      {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-brand rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center rounded-full hover:ring-2 hover:ring-purple-200 transition-all">
                        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden rounded-2xl shadow-xl border border-gray-100">
                      {/* Header */}
                      <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-100">
                        <p className="font-bold text-[15px] text-gray-900 truncate">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Primary actions */}
                      <div className="px-2 py-2">
                        <Link to="/dashboard">
                          <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[14px] font-semibold text-gray-800 hover:bg-purple-50 hover:text-[#7b2ff7]">
                            <span className="text-base">📦</span> {lang === 'bg' ? 'Моите обяви' : 'My Listings'}
                          </DropdownMenuItem>
                        </Link>
                        <Link to="/favorites">
                          <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[14px] font-semibold text-gray-800 hover:bg-purple-50 hover:text-[#7b2ff7]">
                            <span className="text-base">❤️</span> {lang === 'bg' ? 'Харесани' : 'Favorites'}
                          </DropdownMenuItem>
                        </Link>
                        <Link to="/dashboard">
                          <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[14px] font-semibold text-gray-800 hover:bg-purple-50 hover:text-[#7b2ff7]">
                            <span className="text-base">📅</span> {lang === 'bg' ? 'Моите наеми' : 'My Rentals'}
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => goTo('/messages')} className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[14px] font-semibold text-gray-800 hover:bg-purple-50 hover:text-[#7b2ff7]">
                          <span className="text-base">💬</span> {lang === 'bg' ? 'Съобщения' : 'Messages'}
                          {unreadMessages > 0 && (
                            <span className="ml-auto text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {unreadMessages}
                            </span>
                          )}
                        </DropdownMenuItem>
                      </div>

                      {/* Secondary actions */}
                      <div className="px-2 pb-2 border-t border-gray-100 pt-2">
                        <Link to="/settings">
                          <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                            <Settings className="w-4 h-4 shrink-0" /> {lang === 'bg' ? 'Настройки' : 'Settings'}
                          </DropdownMenuItem>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="px-2 pb-2 border-t border-gray-100 pt-2">
                        <DropdownMenuItem
                          onClick={() => base44.auth.logout()}
                          className="gap-3 px-3 py-3 rounded-xl cursor-pointer text-[13px] font-medium text-red-500 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 shrink-0" /> {lang === 'bg' ? 'Изход' : 'Logout'}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all"
                  >
                    {lang === 'bg' ? 'Вход' : 'Login'}
                  </button>
                  <button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity"
                  >
                    {lang === 'bg' ? 'Регистрация' : 'Sign Up'}
                  </button>
                </>
              )}
            </div>

          </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-1">
            {publicNavItems.map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all"
              >
                {item.label}
              </button>
            ))}
            {!user && (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-[#7b2ff7] hover:bg-purple-50 transition-all text-left"
                >
                  {lang === 'bg' ? 'Вход' : 'Login'}
                </button>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-90 transition-opacity text-center"
                >
                  {lang === 'bg' ? 'Регистрация' : 'Sign Up'}
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around py-2 px-2">
            <button onClick={() => goTo('/')} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">{lang === 'bg' ? 'Начало' : 'Home'}</span>
            </button>
            <Link to="/browse" className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/browse') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium">{lang === 'bg' ? 'Търси' : 'Browse'}</span>
            </Link>
            <Link to="/create-listing" className="flex flex-col items-center gap-0.5 px-3 -mt-5">
              <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center shadow-brand-lg">
                <Plus className="w-7 h-7 text-white" />
              </div>
            </Link>
            <Link to="/notifications" className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/notifications') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <Bell className="w-5 h-5" />
              {notifCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 gradient-brand rounded-full text-white text-[9px] flex items-center justify-center font-bold">{notifCount}</span>}
              <span className="text-[10px] font-medium">{lang === 'bg' ? 'Известия' : 'Alerts'}</span>
            </Link>
            <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/dashboard') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">{lang === 'bg' ? 'Профил' : 'Profile'}</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}