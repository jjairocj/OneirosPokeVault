import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  proOnly?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Collection', icon: '🃏' },
  { to: '/decks', label: 'Deck Builder', icon: '📦' },
  { to: '/lists', label: 'My Lists', icon: '📋' },
  { to: '/masterdex', label: 'MasterDex', icon: '⭐', proOnly: true },
  { to: '/pricing', label: 'Go Pro', icon: '🚀' },
  { to: '/admin', label: 'Admin', icon: '🔧', adminOnly: true },
];

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const isPro = user?.plan === 'pro' || user?.role === 'admin';

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return user?.role === 'admin';
    if (item.proOnly) return isPro;
    if (item.to === '/pricing') return user?.plan === 'free';
    return true;
  });

  async function handleLogout() {
    await logout();
    onClose();
    navigate('/');
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <img src="/logo.svg" alt="PokeVault" className="w-8 h-8 shrink-0" />
          <div className="leading-tight">
            <div className="text-base font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
              Oneiros
            </div>
            <div className="text-xs text-gray-500 font-medium tracking-wide">PokeVault</div>
          </div>
          {/* Close on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-white lg:hidden text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {item.to === '/pricing' && (
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  NEW
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user info */}
        {user ? (
          <div className="border-t border-gray-800 px-4 py-4 space-y-3">
            {/* Profile link */}
            <button
              type="button"
              onClick={() => { navigate('/profile'); onClose(); }}
              className="w-full flex items-center gap-3 rounded-lg hover:bg-gray-800 px-2 py-2 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">{user.email}</div>
                <div className={`text-xs font-medium ${isPro ? 'text-amber-400' : 'text-gray-500'}`}>
                  {user.plan.toUpperCase()}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 py-1.5 rounded-md border border-gray-700 transition-colors"
              >
                {lang === 'en' ? '🇪🇸 ES' : '🇬🇧 EN'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 text-xs text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700/50 py-1.5 rounded-md border border-gray-700 transition-colors"
              >
                {t('header.logout')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-800 px-4 py-4">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 py-1.5 rounded-md border border-gray-700 transition-colors"
            >
              {lang === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
