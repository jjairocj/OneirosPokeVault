import React, { useState } from 'react';
import { Deck } from '../../hooks/useDecks';

interface Props {
  decks: Deck[];
  activeDeckId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNew: (name: string, format: string) => void;
}

const FORMATS = ['standard', 'expanded', 'unlimited'];

export default function DeckList({ decks, activeDeckId, onSelect, onDelete, onNew }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('standard');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onNew(name.trim(), format);
    setName('');
    setFormat('standard');
    setShowForm(false);
  }

  return (
    <div className="w-64 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-gray-300">My Decks</span>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
          + New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded p-2 flex flex-col gap-2">
          <input
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none"
            placeholder="Deck name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <select
            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs py-1 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-1 overflow-y-auto max-h-[70vh]">
        {decks.map((deck) => (
          <div
            key={deck.id}
            onClick={() => onSelect(deck.id)}
            className={`flex items-center justify-between rounded px-3 py-2 cursor-pointer text-sm ${
              activeDeckId === deck.id ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="truncate flex-1">
              <div className="font-medium truncate">{deck.name}</div>
              <div className="text-xs opacity-60">{deck.format}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}
              className="ml-2 text-red-400 hover:text-red-300 text-xs"
            >
              ×
            </button>
          </div>
        ))}
        {decks.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-4">No decks yet</p>
        )}
      </div>
    </div>
  );
}
