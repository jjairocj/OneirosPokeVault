import { useState } from 'react';
import { Collection } from '../hooks/useCollections';

interface TabBarProps {
  collections: Collection[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  cardCounts: Record<string, { owned: number; total: number }>;
}

export default function TabBar({ collections, activeId, onSelect, onRemove, cardCounts }: TabBarProps) {
  const [search, setSearch] = useState('');

  if (collections.length === 0) return null;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? collections.filter((col) => {
        const label = col.entryName.startsWith('set:') ? col.entryName.split(':')[2] : col.entryName.startsWith('artist:') ? col.entryName.split(':')[1] : col.entryName;
        return label.toLowerCase().includes(q);
      })
    : collections;

  return (
    <div className="space-y-2">
      {collections.length >= 8 && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar colección..."
            className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-500"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filtered.map((col) => {
          const counts = cardCounts[col.entryName] || { owned: 0, total: 0 };
          const isActive = col.id === activeId;
          const label = col.entryName.startsWith('set:') ? col.entryName.split(':')[2] : col.entryName.startsWith('artist:') ? col.entryName.split(':')[1] : col.entryName;

          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onSelect(col.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-vault-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              <span>{label}</span>
              <span className="text-xs opacity-70">
                {counts.owned}/{counts.total}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(col.id);
                }}
                className="ml-1 text-xs opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity cursor-pointer"
              >
                x
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && q && (
          <p className="text-sm text-gray-500 py-1">Sin resultados para "{search}"</p>
        )}
      </div>
    </div>
  );
}
