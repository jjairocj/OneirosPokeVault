import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

interface PokemonDexEntry {
  dexId: number;
  name: string;
}

export default function PokemonDexManager() {
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
    apiFetch('/api/pokemon-dex').then((r) => r.json()).then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => String(e.dexId).includes(search) || e.name.toLowerCase().includes(search.toLowerCase()));

  async function saveEdit(dexId: number) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/pokemon-dex/${dexId}`, { method: 'PATCH', body: JSON.stringify({ name: editName.trim() }) });
      if (res.ok) {
        const updated: PokemonDexEntry = await res.json();
        setEntries((prev) => prev.map((e) => (e.dexId === dexId ? updated : e)));
        setEditingId(null);
      }
    } finally { setSaving(false); }
  }

  async function addPokemon() {
    const dexId = parseInt(newDexId, 10);
    if (isNaN(dexId) || dexId < 1 || !newName.trim()) { setError('Valid Pokédex number and name required.'); return; }
    setAdding(true); setError('');
    try {
      const res = await apiFetch('/api/pokemon-dex', { method: 'POST', body: JSON.stringify({ dexId, name: newName.trim() }) });
      if (res.ok) {
        const created: PokemonDexEntry = await res.json();
        setEntries((prev) => [...prev, created].sort((a, b) => a.dexId - b.dexId));
        setNewDexId(''); setNewName('');
      } else {
        const body = await res.json();
        setError(body.error ?? 'Failed to add Pokémon.');
      }
    } finally { setAdding(false); }
  }

  if (loading) return <div className="text-center text-gray-500 py-8 text-sm">Loading Pokédex...</div>;

  return (
    <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">Pokédex Names</h2>
        <span className="text-sm text-gray-500">{entries.length} entries</span>
      </div>

      <div className="px-4 py-3 border-b border-gray-800 flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Dex #</label>
          <input type="number" value={newDexId} onChange={(e) => setNewDexId(e.target.value)} placeholder="1026"
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Name</label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New Pokémon"
            className="w-48 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500"
            onKeyDown={(e) => { if (e.key === 'Enter') addPokemon(); }} />
        </div>
        <button type="button" disabled={adding} onClick={addPokemon}
          className="bg-vault-600 hover:bg-vault-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
          {adding ? '...' : 'Add'}
        </button>
        {error && <p className="text-xs text-red-400 self-center">{error}</p>}
      </div>

      <div className="px-4 py-2 border-b border-gray-800">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or number..."
          className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-vault-500" />
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
                <td className="px-4 py-2 text-gray-500 tabular-nums">#{String(e.dexId).padStart(4, '0')}</td>
                <td className="px-4 py-2">
                  {editingId === e.dexId ? (
                    <input autoFocus type="text" value={editName} title="Edit Pokémon name" placeholder="Pokémon name"
                      onChange={(ev) => setEditName(ev.target.value)}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') saveEdit(e.dexId); if (ev.key === 'Escape') setEditingId(null); }}
                      className="bg-gray-800 border border-vault-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full max-w-xs" />
                  ) : (
                    <span className="text-gray-200">{e.name}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === e.dexId ? (
                    <div className="flex gap-1 justify-end">
                      <button type="button" disabled={saving} onClick={() => saveEdit(e.dexId)} className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50">{saving ? '...' : 'Save'}</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setEditingId(e.dexId); setEditName(e.name); }} className="text-xs text-gray-500 hover:text-vault-400 transition-colors">Edit</button>
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
