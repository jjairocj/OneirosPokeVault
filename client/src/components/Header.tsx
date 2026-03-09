import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
  totalCards: number;
  ownedCount: number;
  onAuthClick: () => void;
}

export default function Header({ totalCards, ownedCount, onAuthClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const percentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Oneiros PokeVault" className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Oneiros <span className="text-lg font-medium opacity-80">PokeVault</span>
            </h1>
          </div>
          {user && totalCards > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span>{ownedCount}/{totalCards}</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-vault-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span>{percentage}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded-md border border-gray-700 transition-colors"
          >
            {lang === 'en' ? 'ES' : 'EN'}
          </button>

          {user ? (
            <>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.plan === 'pro'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {user.plan.toUpperCase()}
              </span>
              <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
              {(user.plan === 'pro' || user.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => navigate('/masterdex')}
                  className="text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-2 py-1 rounded-md border border-amber-500/30 transition-colors font-medium"
                >
                  MasterDex
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 px-2 py-1 rounded-md border border-purple-500/30 transition-colors"
                >
                  Admin
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t('header.logout')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAuthClick}
              className="bg-vault-600 hover:bg-vault-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {t('header.signIn')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
