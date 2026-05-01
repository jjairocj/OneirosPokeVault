import React, { useState } from 'react';
import { CardList, LIST_TYPES, LIST_TYPE_LABELS, ListType } from '../../hooks/useLists';

interface Props {
  lists: CardList[];
  activeListId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNew: (name: string, listType: ListType) => void;
}

const TYPE_ICONS: Record<ListType, string> = {
  wishlist: '⭐',
  trade_binder: '🔄',
  custom: '📋',
  pokemon_binder: '📕',
  graded_collection: '🏆',
};

export default function ListSidebar({ lists, activeListId, onSelect, onDelete, onNew }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [listType, setListType] = useState<ListType>('wishlist');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onNew(name.trim(), listType);
    setName('');
    setListType('wishlist');
    setShowForm(false);
  }

  return (
    <div className="w-64 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-gray-300">My Lists</span>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
          + New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded p-2 flex flex-col gap-2">
          <input
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none"
            placeholder="List name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <select
            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
            value={listType}
            onChange={(e) => setListType(e.target.value as ListType)}
          >
            {LIST_TYPES.map((t) => (
              <option key={t} value={t}>{LIST_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs py-1 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-1 overflow-y-auto max-h-[70vh]">
        {lists.map((list) => (
          <div
            key={list.id}
            onClick={() => onSelect(list.id)}
            className={`flex items-center justify-between rounded px-3 py-2 cursor-pointer text-sm ${
              activeListId === list.id ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="truncate flex-1">
              <div className="font-medium truncate">{TYPE_ICONS[list.listType]} {list.name}</div>
              <div className="text-xs opacity-60">{LIST_TYPE_LABELS[list.listType]} · {list.visibility}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
              className="ml-2 text-red-400 hover:text-red-300 text-xs"
            >
              ×
            </button>
          </div>
        ))}
        {lists.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-4">No lists yet</p>
        )}
      </div>
    </div>
  );
}
