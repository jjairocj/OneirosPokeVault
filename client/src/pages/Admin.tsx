import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { apiFetch } from '../lib/api';
import PokemonDexManager from '../components/admin/PokemonDexManager';
import CollectionReportManager from '../components/admin/CollectionReportManager';
import UsersTable from '../components/admin/UsersTable';
import AppShell from '../components/AppShell';

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
    `px-3 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === tab ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-gray-200'}`;

  const topBar = (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-purple-400">🔧 {t('admin.title')}</span>
      <div className="flex gap-1 border-l border-gray-700 pl-3">
        <button type="button" onClick={() => setActiveTab('config')} className={tabClass('config')}>Config</button>
        <button type="button" onClick={() => setActiveTab('report')} className={tabClass('report')}>Reports</button>
        <button type="button" onClick={() => setActiveTab('users')} className={tabClass('users')}>
          Users <span className="ml-1 text-xs opacity-60">({users.length})</span>
        </button>
      </div>
    </div>
  );

  return (
    <AppShell topBar={topBar}>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'config' && <PokemonDexManager />}
        {activeTab === 'report' && <CollectionReportManager />}
        {activeTab === 'users' && <UsersTable users={users} updating={updating} onTogglePlan={togglePlan} />}
      </main>
    </AppShell>
  );
}
