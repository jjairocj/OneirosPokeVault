import { useLanguage } from '../../hooks/useLanguage';

type SearchMode = 'pokemon' | 'set' | 'artist';

interface Props {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const MODES: SearchMode[] = ['pokemon', 'set', 'artist'];
const LABEL_KEYS = { pokemon: 'addBar.modePokemon', set: 'addBar.modeSet', artist: 'addBar.modeArtist' } as const;

export default function SearchModeToggle({ mode, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 w-fit">
      {MODES.map((m) => (
        <button key={m} type="button" onClick={() => onChange(m)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === m ? 'bg-vault-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}>
          {t(LABEL_KEYS[m])}
        </button>
      ))}
    </div>
  );
}
