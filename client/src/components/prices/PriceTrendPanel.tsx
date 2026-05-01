import { useEffect, useState } from 'react';
import { usePriceHistory } from '../../hooks/usePrices';
import Sparkline from './Sparkline';

interface Props {
  cardId: string;
}

const DAYS_OPTIONS = [7, 30, 90];

export default function PriceTrendPanel({ cardId }: Props) {
  const { history, loading, fetchHistory, recordPrice } = usePriceHistory(cardId);
  const [days, setDays] = useState(30);
  const [source, setSource] = useState<'tcgplayer' | 'cardmarket'>('tcgplayer');
  const [addMode, setAddMode] = useState(false);
  const [inputPrice, setInputPrice] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'EUR'>('USD');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetchHistory(days, source);
  }, [fetchHistory, days, source]);

  async function handleRecord() {
    const p = parseFloat(inputPrice);
    if (isNaN(p) || p < 0) return;
    const ok = await recordPrice(source, p, inputCurrency);
    if (ok) {
      setSaveMsg('Saved!');
      setInputPrice('');
      setAddMode(false);
      fetchHistory(days, source);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  const snapshots = history?.snapshots ?? [];
  const sparkData = snapshots.map((s) => ({ value: s.price / 100, date: s.snapshotDate }));
  const latest = history?.latest;
  const latestDisplay = latest ? `$${(latest.price / 100).toFixed(2)} ${latest.currency}` : '—';

  const trend = snapshots.length >= 2
    ? ((snapshots.at(-1)!.price - snapshots[0].price) / snapshots[0].price) * 100
    : null;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Price Trend</h3>
        <button onClick={() => setAddMode((v) => !v)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">
          + Add
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as any)}
          className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1"
        >
          <option value="tcgplayer">TCGPlayer</option>
          <option value="cardmarket">Cardmarket</option>
        </select>
        <div className="flex gap-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-2 py-1 rounded ${days === d ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {addMode && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            step="0.01"
            min="0"
            value={inputPrice}
            onChange={(e) => setInputPrice(e.target.value)}
            placeholder="Price"
            className="bg-gray-700 text-white text-xs rounded px-2 py-1 w-24 focus:outline-none"
          />
          <select
            value={inputCurrency}
            onChange={(e) => setInputCurrency(e.target.value as any)}
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <button onClick={handleRecord} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
            Save
          </button>
        </div>
      )}

      {saveMsg && <p className="text-xs text-green-400 mb-2">{saveMsg}</p>}

      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : snapshots.length === 0 ? (
        <div className="text-xs text-gray-500">No price data yet. Add a price to start tracking.</div>
      ) : (
        <div className="flex items-end gap-4">
          <Sparkline data={sparkData} width={140} height={44} />
          <div>
            <div className="text-base font-semibold text-white">{latestDisplay}</div>
            {trend !== null && (
              <div className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% ({days}d)
              </div>
            )}
            <div className="text-xs text-gray-500">{snapshots.length} snapshots</div>
          </div>
        </div>
      )}
    </div>
  );
}
