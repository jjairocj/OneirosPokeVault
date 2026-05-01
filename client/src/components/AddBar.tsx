import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import SearchModeToggle from './addbar/SearchModeToggle';
import { useAddBarSearch } from './addbar/useAddBarSearch';

type SearchMode = 'pokemon' | 'set' | 'artist';

interface AddBarProps {
  onAdd: (name: string) => void;
  disabled?: boolean;
}

const POKEMON_SUGGESTIONS = ['Pikachu', 'Charizard', 'Mewtwo', 'Eevee', 'Gengar', 'Ditto'];

export default function AddBar({ onAdd, disabled }: AddBarProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<SearchMode>('pokemon');
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, setSuggestions, search, resolveSubmit } = useAddBarSearch(mode);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (newValue: string) => {
    setValue(newValue); setHighlightIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { search(newValue); setShowSuggestions(true); }, 250);
  };

  const handleSelect = (item: { label: string; value: string }) => {
    onAdd(item.value); setValue(''); setSuggestions([]); setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) { handleSelect(suggestions[highlightIndex]); return; }
    if (value.trim()) { onAdd(resolveSubmit(value.trim())); setValue(''); setSuggestions([]); setShowSuggestions(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1)); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const placeholder = mode === 'pokemon' ? t('addBar.placeholder') : mode === 'set' ? t('addBar.placeholderSet') : t('addBar.placeholderArtist');

  return (
    <div className="space-y-3" ref={containerRef}>
      <SearchModeToggle mode={mode} onChange={(m) => { setMode(m); setValue(''); setSuggestions([]); }} />
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="text" value={value} onChange={(e) => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} onKeyDown={handleKeyDown}
            placeholder={placeholder} disabled={disabled} autoComplete="off"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vault-500 focus:border-transparent transition-all" />
          <button type="submit" disabled={disabled || !value.trim()}
            className="bg-vault-600 hover:bg-vault-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            {t('addBar.button')}
          </button>
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-40 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((item, i) => (
              <button type="button" key={item.value} onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${i === highlightIndex ? 'bg-vault-600/30 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {mode === 'pokemon' && (
        <div className="flex gap-2 flex-wrap">
          {POKEMON_SUGGESTIONS.map((name) => (
            <button type="button" key={name} onClick={() => onAdd(name)} disabled={disabled}
              className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
