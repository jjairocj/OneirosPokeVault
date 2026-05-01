import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import ExistingCardsTab from './ExistingCardsTab';
import MissingPokemonTab from './MissingPokemonTab';

export default function CollectionReportManager() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'missing'>('existing');

  useEffect(() => { loadReport(); }, []);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/collection-report');
      if (res.ok) setReport(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }

  async function generateReport() {
    setGenerating(true);
    try {
      const res = await apiFetch('/api/admin/collection-report', { method: 'POST' });
      if (res.ok) setReport(await res.json());
    } catch { /* silent */ } finally { setGenerating(false); }
  }

  const tabClass = (tab: 'existing' | 'missing') =>
    `px-4 py-2 font-medium text-sm transition-colors ${activeTab === tab ? 'text-vault-400 border-b-2 border-vault-400' : 'text-gray-400 hover:text-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Collection Report</h2>
        <div className="flex gap-3">
          <button type="button" onClick={generateReport} disabled={generating}
            className="px-4 py-2 bg-vault-600 hover:bg-vault-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          <button type="button" onClick={loadReport} disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="mb-6">
            <p className="text-sm text-gray-400">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
            <p className="text-lg font-semibold text-gray-200 mt-2">Total Collection Value: ${report.totalValue.toFixed(2)}</p>
          </div>
          <div className="flex border-b border-gray-700 mb-6">
            <button type="button" onClick={() => setActiveTab('existing')} className={tabClass('existing')}>
              Existing Cards ({report.existingCards?.length || 0})
            </button>
            <button type="button" onClick={() => setActiveTab('missing')} className={tabClass('missing')}>
              Missing Pokémon ({report.missingPokemon?.length || 0})
            </button>
          </div>
          {activeTab === 'existing' && <ExistingCardsTab cards={report.existingCards ?? []} />}
          {activeTab === 'missing' && <MissingPokemonTab pokemon={report.missingPokemon ?? []} />}
        </div>
      )}

      {!report && !loading && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <p className="text-gray-400">No report generated yet. Click "Generate Report" to create one.</p>
        </div>
      )}
    </div>
  );
}
