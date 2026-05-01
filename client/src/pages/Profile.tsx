import { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';

const FALLBACK = '/card-back.svg';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, saving, fetchProfile, saveProfile, featuredCardIds } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setBannerImage(profile.bannerImage ?? '');
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const ok = await saveProfile({ displayName: displayName || undefined, bannerImage: bannerImage || undefined });
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  const topBar = <span className="text-sm font-semibold text-gray-200">👤 Profile</span>;

  if (loading) {
    return (
      <AppShell topBar={topBar}>
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell topBar={topBar}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-white">
        {bannerImage && (
          <div className="h-32 rounded-xl overflow-hidden mb-6">
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-lg font-bold text-purple-300">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile?.displayName || user?.email}</h1>
            <span className={`text-xs font-medium ${user?.plan === 'pro' ? 'text-amber-400' : 'text-gray-500'}`}>
              {user?.plan?.toUpperCase()} · {user?.email}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 flex flex-col gap-4 mb-8">
          <h2 className="text-sm font-semibold text-gray-300">Edit Profile</h2>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="Trainer name"
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Banner Image URL</label>
            <input
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            {saved && <span className="text-xs text-green-400">Saved!</span>}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {featuredCardIds.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Featured Cards</h2>
            <div className="flex flex-wrap gap-2">
              {featuredCardIds.map((id) => (
                <img
                  key={id}
                  src={`https://assets.tcgdex.net/en/${id}/low.webp`}
                  alt={id}
                  className="w-20 rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
