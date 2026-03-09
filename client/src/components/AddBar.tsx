import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import tcgdex from '../lib/tcgdex';
import { Query } from '@tcgdex/sdk';

type SearchMode = 'pokemon' | 'set';

interface SetSuggestion {
  id: string;
  name: string;
  cardCount?: { total: number };
}

interface AddBarProps {
  onAdd: (name: string) => void;
  disabled?: boolean;
}

const POKEMON_SUGGESTIONS = ['Pikachu', 'Charizard', 'Mewtwo', 'Eevee', 'Gengar', 'Ditto'];

export default function AddBar({ onAdd, disabled }: AddBarProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<SearchMode>('pokemon');
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; value: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSets, setAllSets] = useState<SetSuggestion[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load sets once
  useEffect(() => {
    tcgdex.set.list().then((sets) => {
      if (sets) {
        setAllSets(sets as unknown as SetSuggestion[]);
      }
    }).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchPokemon = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await tcgdex.card.list(
        Query.create().like('name', query).paginate(1, 50)
      );
      if (!results) {
        setSuggestions([]);
        return;
      }
      const names = new Set<string>();
      results.forEach((c) => names.add(c.name));
      setSuggestions(
        Array.from(names)
          .filter((n) => n.toLowerCase().includes(query.toLowerCase()))
          .sort()
          .slice(0, 8)
          .map((n) => ({ label: n, value: n }))
      );
    } catch {
      setSuggestions([]);
    }
  }, []);

  const searchSets = useCallback((query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matched = allSets
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((s) => ({
        label: `${s.name}${s.cardCount ? ` (${s.cardCount.total})` : ''}`,
        value: `set:${s.id}:${s.name}`,
      }));
    setSuggestions(matched);
  }, [allSets]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setHighlightIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (mode === 'pokemon') {
        searchPokemon(newValue);
      } else {
        searchSets(newValue);
      }
      setShowSuggestions(true);
    }, 250);
  };

  const handleSelect = (item: { label: string; value: string }) => {
    onAdd(item.value);
    setValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
      handleSelect(suggestions[highlightIndex]);
      return;
    }
    if (value.trim()) {
      if (mode === 'set') {
        const match = allSets.find((s) => s.name.toLowerCase() === value.trim().toLowerCase());
        if (match) {
          onAdd(`set:${match.id}:${match.name}`);
        } else {
          onAdd(value.trim());
        }
      } else {
        onAdd(value.trim());
      }
      setValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => { setMode('pokemon'); setValue(''); setSuggestions([]); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'pokemon'
              ? 'bg-vault-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
        >
          {t('addBar.modePokemon')}
        </button>
        <button
          type="button"
          onClick={() => { setMode('set'); setValue(''); setSuggestions([]); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'set'
              ? 'bg-vault-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
        >
          {t('addBar.modeSet')}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'pokemon' ? t('addBar.placeholder') : t('addBar.placeholderSet')}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vault-500 focus:border-transparent transition-all"
            disabled={disabled}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="bg-vault-600 hover:bg-vault-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {t('addBar.button')}
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-40 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((item, i) => (
              <button
                type="button"
                key={item.value}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  i === highlightIndex
                    ? 'bg-vault-600/30 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick suggestions (only for Pokemon mode) */}
      {mode === 'pokemon' && (
        <div className="flex gap-2 flex-wrap">
          {POKEMON_SUGGESTIONS.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => onAdd(name)}
              disabled={disabled}
              className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
