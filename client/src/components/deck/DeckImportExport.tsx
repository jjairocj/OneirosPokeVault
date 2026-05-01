import { useState } from 'react';

interface Props {
  deckId: number;
  onExport: () => Promise<string | null>;
  onImport: (deckId: number, text: string) => Promise<boolean>;
  onImportDone: () => void;
}

export default function DeckImportExport({ deckId, onExport, onImport, onImportDone }: Props) {
  const [mode, setMode] = useState<'none' | 'export' | 'import'>('none');
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState('');

  async function handleExport() {
    const text = await onExport();
    if (text) { setExportText(text); setMode('export'); }
  }

  async function handleImport() {
    if (!importText.trim()) return;
    setStatus('Importing...');
    const ok = await onImport(deckId, importText.trim());
    if (ok) {
      setStatus('Imported!');
      setImportText('');
      setMode('none');
      onImportDone();
    } else {
      setStatus('Import failed');
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(exportText);
    setStatus('Copied!');
    setTimeout(() => setStatus(''), 2000);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-200 flex-1">PTCGLive Format</h3>
        <button
          onClick={handleExport}
          className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
        >
          Export
        </button>
        <button
          onClick={() => setMode(mode === 'import' ? 'none' : 'import')}
          className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
        >
          Import
        </button>
      </div>

      {mode === 'export' && exportText && (
        <div className="flex flex-col gap-2">
          <textarea
            readOnly
            value={exportText}
            className="bg-gray-900 text-gray-300 text-xs rounded p-2 h-32 resize-none w-full"
          />
          <button onClick={copyToClipboard} className="text-xs bg-blue-700 hover:bg-blue-600 text-white py-1 rounded">
            Copy to Clipboard
          </button>
        </div>
      )}

      {mode === 'import' && (
        <div className="flex flex-col gap-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`4 Pikachu V SIT 49\n2 Boss's Orders BRS 132\n10 Lightning Energy SVI 257`}
            className="bg-gray-900 text-gray-300 text-xs rounded p-2 h-32 resize-none w-full focus:outline-none"
          />
          <button onClick={handleImport} className="text-xs bg-blue-700 hover:bg-blue-600 text-white py-1 rounded">
            Import Cards
          </button>
        </div>
      )}

      {status && <p className="text-xs text-green-400 mt-1">{status}</p>}
    </div>
  );
}
