import { useEffect, useState } from 'react';
import { useCardNote } from '../../hooks/useCardNote';

interface Props {
  cardId: string;
}

export default function CardNoteEditor({ cardId }: Props) {
  const { note, loading, saving, fetchNote, saveNote, deleteNote } = useCardNote(cardId);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchNote(); }, [fetchNote]);
  useEffect(() => { if (note) setText(note.note); }, [note]);

  async function handleSave() {
    const ok = await saveNote(text);
    if (ok) { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleDelete() {
    await deleteNote();
    setText('');
    setEditing(false);
  }

  if (loading) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-200">My Note</h3>
        <div className="flex gap-2">
          {saved && <span className="text-xs text-green-400">Saved!</span>}
          {note && !editing && (
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">Delete</button>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
          >
            {editing ? 'Cancel' : note ? 'Edit' : '+ Add'}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Write a note about this card..."
            className="bg-gray-900 text-gray-200 text-sm rounded px-3 py-2 resize-none focus:outline-none w-full"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{text.length}/1000</span>
            <button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : note ? (
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.note}</p>
      ) : (
        <p className="text-xs text-gray-500">No note yet. Click + Add to write one.</p>
      )}
    </div>
  );
}
