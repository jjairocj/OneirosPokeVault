import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { apiFetch } from '../lib/api';

interface AdminUser {
  id: number;
  email: string;
  plan: string;
  role: string;
  createdAt: string;
}

interface PokemonDexEntry {
  dexId: number;
  name: string;
}

// --- Pokemon Dex Management Section ---
function PokemonDexManager() {
  const [entries, setEntries] = useState<PokemonDexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newDexId, setNewDexId] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/pokemon-dex')
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(
    (e) =>
      String(e.dexId).includes(search) ||
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  async function saveEdit(dexId: number) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/pokemon-dex/${dexId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        const updated: PokemonDexEntry = await res.json();
        setEntries((prev) => prev.map((e) => (e.dexId === dexId ? updated : e)));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function addPokemon() {
    const dexId = parseInt(newDexId, 10);
    if (isNaN(dexId) || dexId < 1 || !newName.trim()) {
      setError('Valid Pokédex number and name required.');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const res = await apiFetch('/api/pokemon-dex', {
        method: 'POST',
        body: JSON.stringify({ dexId, name: newName.trim() }),
      });
      if (res.ok) {
        const created: PokemonDexEntry = await res.json();
        setEntries((prev) => [...prev, created].sort((a, b) => a.dexId - b.dexId));
        setNewDexId('');
        setNewName('');
      } else {
        const body = await res.json();
        setError(body.error ?? 'Failed to add Pokémon.');
      }
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="text-center text-gray-500 py-8 text-sm">Loading Pokédex...</div>;

  return (
    <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">Pokédex Names</h2>
        <span className="text-sm text-gray-500">{entries.length} entries</span>
      </div>

      {/* Add new Pokémon */}
      <div className="px-4 py-3 border-b border-gray-800 flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Dex #</label>
          <input
            type="number"
            value={newDexId}
            onChange={(e) => setNewDexId(e.target.value)}
            placeholder="1026"
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New Pokémon"
            className="w-48 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500"
            onKeyDown={(e) => { if (e.key === 'Enter') addPokemon(); }}
          />
        </div>
        <button
          type="button"
          disabled={adding}
          onClick={addPokemon}
          className="bg-vault-600 hover:bg-vault-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {adding ? '...' : 'Add'}
        </button>
        {error && <p className="text-xs text-red-400 self-center">{error}</p>}
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or number..."
          className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500"
        />
      </div>

      <div className="overflow-y-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900">
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="px-4 py-2 font-medium w-20">#</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.dexId} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="px-4 py-2 text-gray-500 tabular-nums">
                  #{String(e.dexId).padStart(4, '0')}
                </td>
                <td className="px-4 py-2">
                  {editingId === e.dexId ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      title="Edit Pokémon name"
                      placeholder="Pokémon name"
                      onChange={(ev) => setEditName(ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') saveEdit(e.dexId);
                        if (ev.key === 'Escape') setEditingId(null);
                      }}
                      className="bg-gray-800 border border-vault-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full max-w-xs"
                    />
                  ) : (
                    <span className="text-gray-200">{e.name}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === e.dexId ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveEdit(e.dexId)}
                        className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingId(e.dexId); setEditName(e.name); }}
                      className="text-xs text-gray-500 hover:text-vault-400 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  async function fetchUsers() {
    try {
      const res = await apiFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function togglePlan(userId: number, currentPlan: string) {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    setUpdating(userId);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan: updated.plan } : u)));
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-vault-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Oneiros PokeVault" className="w-8 h-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {t('admin.title')}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t('admin.backHome')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <PokemonDexManager />

        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-200">{t('admin.users')}</h2>
            <span className="text-sm text-gray-500">{users.length} {t('admin.total')}</span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">{t('auth.email')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.plan')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.role')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.registered')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-400">{u.id}</td>
                    <td className="px-4 py-3 text-gray-200">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.plan === 'pro'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {u.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-gray-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={updating === u.id}
                        onClick={() => togglePlan(u.id, u.plan)}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                          u.plan === 'pro'
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                        } disabled:opacity-50`}
                      >
                        {updating === u.id
                          ? '...'
                          : u.plan === 'pro'
                            ? t('admin.removePro')
                            : t('admin.givePro')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-800/50">
            {users.map((u) => (
              <div key={u.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-medium text-sm truncate max-w-[60%]">{u.email}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.plan === 'pro'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {u.plan.toUpperCase()}
                    </span>
                    {u.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        admin
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    disabled={updating === u.id}
                    onClick={() => togglePlan(u.id, u.plan)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                      u.plan === 'pro'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                    } disabled:opacity-50`}
                  >
                    {updating === u.id
                      ? '...'
                      : u.plan === 'pro'
                        ? t('admin.removePro')
                        : t('admin.givePro')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
