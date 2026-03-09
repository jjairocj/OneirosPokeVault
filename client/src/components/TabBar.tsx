import { Collection } from '../hooks/useCollections';

interface TabBarProps {
  collections: Collection[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  cardCounts: Record<string, { owned: number; total: number }>;
}

export default function TabBar({ collections, activeId, onSelect, onRemove, cardCounts }: TabBarProps) {
  if (collections.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {collections.map((col) => {
        const counts = cardCounts[col.entryName] || { owned: 0, total: 0 };
        const isActive = col.id === activeId;

        return (
          <button
            key={col.id}
            onClick={() => onSelect(col.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-vault-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            <span>
              {col.entryName.startsWith('set:') ? col.entryName.split(':')[2] : col.entryName}
            </span>
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
    </div>
  );
}
