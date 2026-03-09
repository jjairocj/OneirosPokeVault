import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCollections } from '../hooks/useCollections';
import { useOwnedCards } from '../hooks/useOwnedCards';
import { useLanguage } from '../hooks/useLanguage';
import { CardSummary } from '../hooks/useCards';
import Header from '../components/Header';
import AddBar from '../components/AddBar';
import TabBar from '../components/TabBar';
import EntryView from '../components/EntryView';
import AuthModal from '../components/AuthModal';
import ProModal from '../components/ProModal';
import LandingPage from '../components/LandingPage';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { collections, addCollection, removeCollection } = useCollections();
  const { isOwned, toggleOwned } = useOwnedCards();
  const { t } = useLanguage();

  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [entryCards, setEntryCards] = useState<Record<string, CardSummary[]>>({});

  const activeTab = useMemo(() => {
    if (activeTabId && collections.find((c) => c.id === activeTabId)) {
      return collections.find((c) => c.id === activeTabId)!;
    }
    return collections[0] || null;
  }, [activeTabId, collections]);

  const handleAdd = async (name: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      const result = await addCollection(name);
      if (!result.success && result.planLimit) {
        setShowPro(true);
      }
    } catch {
      // handled silently
    }
  };

  const handleCardsLoaded = useCallback((entryName: string, cards: CardSummary[]) => {
    setEntryCards((prev) => ({ ...prev, [entryName]: cards }));
  }, []);

  const cardCounts = useMemo(() => {
    const counts: Record<string, { owned: number; total: number }> = {};
    for (const col of collections) {
      const cards = entryCards[col.entryName] || [];
      counts[col.entryName] = {
        total: cards.length,
        owned: cards.filter((c) => isOwned(c.id)).length,
      };
    }
    return counts;
  }, [collections, entryCards, isOwned]);

  const totalCards = useMemo(
    () => Object.values(cardCounts).reduce((sum, c) => sum + c.total, 0),
    [cardCounts]
  );
  const totalOwned = useMemo(
    () => Object.values(cardCounts).reduce((sum, c) => sum + c.owned, 0),
    [cardCounts]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-vault-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        totalCards={totalCards}
        ownedCount={totalOwned}
        onAuthClick={() => setShowAuth(true)}
      />

      {!user ? (
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <AddBar onAdd={handleAdd} />
          <TabBar
            collections={collections}
            activeId={activeTab?.id ?? null}
            onSelect={setActiveTabId}
            onRemove={removeCollection}
            cardCounts={cardCounts}
          />
          {activeTab && (
            <EntryView
              key={activeTab.id}
              entryName={activeTab.entryName}
              isOwned={isOwned}
              onToggleOwned={toggleOwned}
              onCardsLoaded={handleCardsLoaded}
            />
          )}
          {collections.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">{t('empty.title')}</p>
              <p className="text-sm mt-1">{t('empty.subtitle')}</p>
            </div>
          )}
        </main>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </div>
  );
}
