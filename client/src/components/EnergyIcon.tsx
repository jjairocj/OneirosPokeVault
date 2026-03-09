const ENERGY_COLORS: Record<string, { bg: string; text: string; symbol: string }> = {
  Grass:      { bg: 'bg-green-600',   text: 'text-white', symbol: 'G' },
  Fire:       { bg: 'bg-red-600',     text: 'text-white', symbol: 'R' },
  Water:      { bg: 'bg-blue-500',    text: 'text-white', symbol: 'W' },
  Lightning:  { bg: 'bg-yellow-400',  text: 'text-gray-900', symbol: 'L' },
  Psychic:    { bg: 'bg-purple-500',  text: 'text-white', symbol: 'P' },
  Fighting:   { bg: 'bg-orange-700',  text: 'text-white', symbol: 'F' },
  Darkness:   { bg: 'bg-gray-800',    text: 'text-white', symbol: 'D' },
  Metal:      { bg: 'bg-gray-400',    text: 'text-gray-900', symbol: 'M' },
  Dragon:     { bg: 'bg-amber-600',   text: 'text-white', symbol: 'N' },
  Fairy:      { bg: 'bg-pink-400',    text: 'text-white', symbol: 'Y' },
  Colorless:  { bg: 'bg-gray-300',    text: 'text-gray-700', symbol: 'C' },
  // Spanish
  Planta:       { bg: 'bg-green-600',   text: 'text-white', symbol: 'G' },
  Fuego:        { bg: 'bg-red-600',     text: 'text-white', symbol: 'R' },
  Agua:         { bg: 'bg-blue-500',    text: 'text-white', symbol: 'W' },
  Rayo:         { bg: 'bg-yellow-400',  text: 'text-gray-900', symbol: 'L' },
  'Ps\u00edquico': { bg: 'bg-purple-500', text: 'text-white', symbol: 'P' },
  Lucha:        { bg: 'bg-orange-700',  text: 'text-white', symbol: 'F' },
  Oscuridad:    { bg: 'bg-gray-800',    text: 'text-white', symbol: 'D' },
  Metal_es:     { bg: 'bg-gray-400',    text: 'text-gray-900', symbol: 'M' },
  'Drag\u00f3n': { bg: 'bg-amber-600',  text: 'text-white', symbol: 'N' },
  Hada:         { bg: 'bg-pink-400',    text: 'text-white', symbol: 'Y' },
  Incoloro:     { bg: 'bg-gray-300',    text: 'text-gray-700', symbol: 'C' },
  // French
  Plante:       { bg: 'bg-green-600',   text: 'text-white', symbol: 'G' },
  Feu:          { bg: 'bg-red-600',     text: 'text-white', symbol: 'R' },
  Eau:          { bg: 'bg-blue-500',    text: 'text-white', symbol: 'W' },
  '\u00c9lectrique': { bg: 'bg-yellow-400', text: 'text-gray-900', symbol: 'L' },
  Psy:          { bg: 'bg-purple-500',  text: 'text-white', symbol: 'P' },
  Combat:       { bg: 'bg-orange-700',  text: 'text-white', symbol: 'F' },
  Obscurit\u00e9:   { bg: 'bg-gray-800', text: 'text-white', symbol: 'D' },
  'M\u00e9tal':     { bg: 'bg-gray-400', text: 'text-gray-900', symbol: 'M' },
  'F\u00e9e':       { bg: 'bg-pink-400', text: 'text-white', symbol: 'Y' },
  Incolore:     { bg: 'bg-gray-300',    text: 'text-gray-700', symbol: 'C' },
};

interface EnergyIconProps {
  type: string;
  size?: 'sm' | 'md';
}

export default function EnergyIcon({ type, size = 'sm' }: EnergyIconProps) {
  const config = ENERGY_COLORS[type] || { bg: 'bg-gray-500', text: 'text-white', symbol: type.charAt(0).toUpperCase() };
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ${config.bg} ${config.text} ${sizeClass}`}
      title={type}
    >
      {config.symbol}
    </span>
  );
}
