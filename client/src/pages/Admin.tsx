import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { apiFetch } from '../lib/api';
import PokemonDexManager from '../components/admin/PokemonDexManager';
import CollectionReportManager from '../components/admin/CollectionReportManager';
import UsersTable from '../components/admin/UsersTable';

interface AdminUser { id: number; email: string; plan: string; role: string; createdAt: string; }

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'config' | 'report' | 'users'>('config');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      apiFetch('/api/admin/users').then((r) => r.ok ? r.json() : []).then(setUsers).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  async function togglePlan(userId: number, currentPlan: string) {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    setUpdating(userId);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan: newPlan }) });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan: updated.plan } : u)));
      }
    } catch { /* silent */ } finally { setUpdating(null); }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-vault-500 border-t-transparent" />
      </div>
    );
  }
  if (!user || user.role !== 'admin') return null;

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'text-purple-400 border-purple-400' : 'text-gray-400 hover:text-gray-200 border-transparent'}`;

  return (
    <div className="min-h-screen">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Oneiros PokeVault" className="w-8 h-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{t('admin.title')}</h1>
          </div>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition-colors">{t('admin.backHome')}</button>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 border-t border-gray-800">
          <button type="button" onClick={() => setActiveTab('config')} className={tabClass('config')}>Config</button>
          <button type="button" onClick={() => setActiveTab('report')} className={tabClass('report')}>Collection Report</button>
          <button type="button" onClick={() => setActiveTab('users')} className={tabClass('users')}>Users <span className="ml-1 text-xs opacity-60">({users.length})</span></button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'config' && <PokemonDexManager />}
        {activeTab === 'report' && <CollectionReportManager />}
        {activeTab === 'users' && <UsersTable users={users} updating={updating} onTogglePlan={togglePlan} />}
      </main>
    </div>
  );
}
