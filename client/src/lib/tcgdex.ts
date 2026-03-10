import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(0); // Disable cache to avoid localStorage quota issues

// --- LRU eviction for @tcgdex-cache entries ---
const CACHE_PREFIX = '@tcgdex-cache';
const CACHE_META_KEY = '@tcgdex-cache-meta'; // tracks insertion order
const MAX_ENTRIES = 15;
const CLEAR_THRESHOLD = 20;

function getTcgdexKeys(): string[] {
  return Object.keys(localStorage).filter(
    (k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_META_KEY
  );
}

function getMeta(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_META_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveMeta(meta: string[]) {
  try {
    // Use native setItem to avoid infinite recursion inside the patch
    Storage.prototype.setItem.call(localStorage, CACHE_META_KEY, JSON.stringify(meta));
  } catch { /* ignore */ }
}

function enforceCacheLimit() {
  const keys = getTcgdexKeys();

  // Safety net: more than CLEAR_THRESHOLD → nuke everything
  if (keys.length > CLEAR_THRESHOLD) {
    keys.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(CACHE_META_KEY);
    return;
  }

  // LRU: remove oldest until under MAX_ENTRIES
  if (keys.length >= MAX_ENTRIES) {
    const meta = getMeta();
    while (getTcgdexKeys().length >= MAX_ENTRIES) {
      const oldest = meta.shift();
      if (oldest) {
        localStorage.removeItem(oldest);
      } else {
        const current = getTcgdexKeys();
        if (current.length) localStorage.removeItem(current[0]);
        else break;
      }
    }
    saveMeta(meta);
  }
}

// Patch Storage.prototype.setItem — works in Safari, Chrome, Firefox
// (patching the instance directly fails silently in Safari)
const _origSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function (key: string, value: string) {
  if (key.startsWith(CACHE_PREFIX) && key !== CACHE_META_KEY) {
    enforceCacheLimit();
    // Track insertion order
    const meta = getMeta().filter((k) => k !== key);
    meta.push(key);
    saveMeta(meta);
  }
  _origSetItem.call(this, key, value);
};

// Fallback: handle any quota errors that slip through
const originalRequest = (tcgdex as any).request;
(tcgdex as any).request = async function (url: string, options: any) {
  try {
    return await originalRequest.call(this, url, options);
  } catch (error: any) {
    if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('exceeded the quota')) {
      console.warn('localStorage quota exceeded, clearing tcgdex cache...');
      try {
        getTcgdexKeys().forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem(CACHE_META_KEY);
      } catch { /* ignore */ }
      return await originalRequest.call(this, url, options);
    }
    throw error;
  }
};

export default tcgdex;
