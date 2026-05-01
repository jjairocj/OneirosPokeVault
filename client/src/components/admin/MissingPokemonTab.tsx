import { useState } from 'react';

interface Pokemon { dexId: number; name: string; image?: string; }

export default function MissingPokemonTab({ pokemon }: { pokemon: Pokemon[] }) {
  const [search, setSearch] = useState('');

  const filtered = pokemon.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || String(p.dexId).includes(search)
  );

  return (
    <div className="space-y-4">
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or dex number..."
        className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-500" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 col-span-full">No missing Pokémon found.</p>
        ) : (
          filtered.map((p) => (
            <div key={p.dexId} className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <img src={p.image || '/card-back.svg'} alt={p.name}
                className="w-12 h-12 object-cover rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
              <div>
                <p className="font-medium text-gray-200">#{String(p.dexId).padStart(3, '0')}</p>
                <p className="text-sm text-gray-400 capitalize">{p.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
