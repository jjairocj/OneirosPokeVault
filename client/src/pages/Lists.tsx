import { useEffect, useState } from 'react';
import { useLists, ListType } from '../hooks/useLists';
import ListSidebar from '../components/lists/ListSidebar';
import ListEditor from '../components/lists/ListEditor';
import AppShell from '../components/AppShell';

export default function Lists() {
  const { lists, loading, error, fetchLists, createList, deleteList } = useLists();
  const [activeListId, setActiveListId] = useState<number | null>(null);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  async function handleNewList(name: string, listType: ListType) {
    const list = await createList(name, listType);
    if (list) setActiveListId(list.id);
  }

  async function handleDeleteList(id: number) {
    if (!confirm('Delete this list?')) return;
    await deleteList(id);
    if (activeListId === id) setActiveListId(null);
  }

  const topBar = (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-200">📋 My Lists</span>
      {lists.length > 0 && (
        <span className="text-xs text-gray-500">{lists.length} list{lists.length !== 1 ? 's' : ''}</span>
      )}
    </div>
  );

  return (
    <AppShell topBar={topBar}>
      <div className="p-4 sm:p-6 text-white">
        {error && (
          <div className="bg-red-900 text-red-300 rounded p-3 text-sm mb-4">{error}</div>
        )}
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex items-center justify-center w-64 text-gray-500">Loading...</div>
          ) : (
            <ListSidebar
              lists={lists}
              activeListId={activeListId}
              onSelect={setActiveListId}
              onDelete={handleDeleteList}
              onNew={handleNewList}
            />
          )}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeListId ? (
              <ListEditor listId={activeListId} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p>Select a list or create a new one</p>
                  <p className="text-sm mt-1">Wishlist · Trade Binder · Custom · Pokémon Binder · Graded Collection</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
