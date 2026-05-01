import { useEffect, useState } from 'react';
import { usePriceHistory } from '../../hooks/usePrices';
import Sparkline from './Sparkline';
import type { FullCard } from '../card-detail/types';

interface Props {
  cardId: string;
  pricing?: FullCard['pricing'];
}

const DAYS_OPTIONS = [7, 30, 90];

function CardmarketSummary({ cm }: { cm: NonNullable<NonNullable<FullCard['pricing']>['cardmarket']> }) {
  const avg = cm.avg30 ?? cm.avg7 ?? cm.avg1 ?? cm.avg;
  return (
    <div className="space-y-1">
      {avg !== undefined && <div className="text-base font-semibold text-white">€{avg.toFixed(2)} <span className="text-xs text-gray-400">avg30d</span></div>}
      <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-400">
        {cm.avg1 !== undefined && <span>1d: €{cm.avg1.toFixed(2)}</span>}
        {cm.avg7 !== undefined && <span>7d: €{cm.avg7.toFixed(2)}</span>}
        {cm.avg30 !== undefined && <span>30d: €{cm.avg30.toFixed(2)}</span>}
      </div>
      {cm.updated && <div className="text-xs text-gray-500">Updated {cm.updated}</div>}
    </div>
  );
}

function TCGPlayerSummary({ tcp }: { tcp: NonNullable<NonNullable<FullCard['pricing']>['tcgplayer']> }) {
  const normal = tcp.normal;
  const holo = tcp['reverse-holofoil'];
  return (
    <div className="space-y-2">
      {normal && (
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Normal</div>
          <div className="flex flex-wrap gap-x-3 text-xs text-gray-300">
            {normal.lowPrice !== undefined && <span>Low: ${normal.lowPrice.toFixed(2)}</span>}
            {normal.midPrice !== undefined && <span>Mid: ${normal.midPrice.toFixed(2)}</span>}
            {normal.highPrice !== undefined && <span>High: ${normal.highPrice.toFixed(2)}</span>}
            {normal.marketPrice !== undefined && <span className="text-white font-medium">Market: ${normal.marketPrice.toFixed(2)}</span>}
          </div>
        </div>
      )}
      {holo && (
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Reverse Holo</div>
          <div className="flex flex-wrap gap-x-3 text-xs text-gray-300">
            {holo.lowPrice !== undefined && <span>Low: ${holo.lowPrice.toFixed(2)}</span>}
            {holo.midPrice !== undefined && <span>Mid: ${holo.midPrice.toFixed(2)}</span>}
            {holo.highPrice !== undefined && <span>High: ${holo.highPrice.toFixed(2)}</span>}
            {holo.marketPrice !== undefined && <span className="text-white font-medium">Market: ${holo.marketPrice.toFixed(2)}</span>}
          </div>
        </div>
      )}
      {tcp.updated && <div className="text-xs text-gray-500">Updated {tcp.updated}</div>}
    </div>
  );
}

export default function PriceTrendPanel({ cardId, pricing }: Props) {
  const { history, loading, fetchHistory, recordPrice } = usePriceHistory(cardId);
  const [days, setDays] = useState(30);
  const [source, setSource] = useState<'tcgplayer' | 'cardmarket'>('tcgplayer');
  const [addMode, setAddMode] = useState(false);
  const [inputPrice, setInputPrice] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'EUR'>('USD');
  const [saveMsg, setSaveMsg] = useState('');
  const [activeView, setActiveView] = useState<'history' | 'live'>('live');

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

  const hasLivePricing = pricing?.tcgplayer || pricing?.cardmarket;
  const hasTabs = hasLivePricing;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Price Trend</h3>
        <div className="flex items-center gap-2">
          {hasTabs && (
            <div className="flex rounded overflow-hidden border border-gray-700">
              <button type="button" onClick={() => setActiveView('live')}
                className={`text-xs px-2 py-1 ${activeView === 'live' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                Live
              </button>
              <button type="button" onClick={() => setActiveView('history')}
                className={`text-xs px-2 py-1 ${activeView === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                History
              </button>
            </div>
          )}
          {activeView === 'history' && (
            <button type="button" onClick={() => setAddMode((v) => !v)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">
              + Add
            </button>
          )}
        </div>
      </div>

      {activeView === 'live' && hasLivePricing && (
        <div className="space-y-4">
          {pricing?.tcgplayer && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">TCGPlayer</div>
              <TCGPlayerSummary tcp={pricing.tcgplayer} />
            </div>
          )}
          {pricing?.cardmarket && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cardmarket</div>
              <CardmarketSummary cm={pricing.cardmarket} />
            </div>
          )}
        </div>
      )}

      {activeView === 'live' && !hasLivePricing && (
        <div className="text-xs text-gray-500">No live pricing available for this card.</div>
      )}

      {activeView === 'history' && (
        <>
          <div className="flex gap-2 mb-3">
            <select title="Price source" value={source} onChange={(e) => setSource(e.target.value as any)}
              className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1">
              <option value="tcgplayer">TCGPlayer</option>
              <option value="cardmarket">Cardmarket</option>
            </select>
            <div className="flex gap-1">
              {DAYS_OPTIONS.map((d) => (
                <button type="button" key={d} onClick={() => setDays(d)}
                  className={`text-xs px-2 py-1 rounded ${days === d ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {addMode && (
            <div className="flex gap-2 mb-3">
              <input type="number" step="0.01" min="0" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)}
                placeholder="Price" className="bg-gray-700 text-white text-xs rounded px-2 py-1 w-24 focus:outline-none" />
              <select title="Currency" value={inputCurrency} onChange={(e) => setInputCurrency(e.target.value as any)}
                className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <button type="button" onClick={handleRecord} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                Save
              </button>
            </div>
          )}

          {saveMsg && <p className="text-xs text-green-400 mb-2">{saveMsg}</p>}

          {loading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : snapshots.length === 0 ? (
            <div className="text-xs text-gray-500">No history yet. Add a price to start tracking.</div>
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
        </>
      )}
    </div>
  );
}
