import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(0); // Disable cache to avoid localStorage quota issues with large results

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

function enforceCacheLimit() {
  const keys = getTcgdexKeys();

  // Safety net: more than 20 → nuke everything
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
        // No meta info → just remove the first key found
        const current = getTcgdexKeys();
        if (current.length) localStorage.removeItem(current[0]);
        else break;
      }
    }
    try {
      localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
    } catch { /* ignore */ }
  }
}

// Patch setItem to intercept tcgdex cache writes
const _origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (key: string, value: string) {
  if (key.startsWith(CACHE_PREFIX) && key !== CACHE_META_KEY) {
    enforceCacheLimit();
    // Update meta: move this key to the end (most recent)
    const meta = getMeta().filter((k) => k !== key);
    meta.push(key);
    try { _origSetItem(CACHE_META_KEY, JSON.stringify(meta)); } catch { /* ignore */ }
  }
  _origSetItem(key, value);
};

// Wrap to handle any remaining localStorage quota errors
const originalRequest = (tcgdex as any).request;
(tcgdex as any).request = async function (url: string, options: any) {
  try {
    return await originalRequest.call(this, url, options);
  } catch (error: any) {
    if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('exceeded the quota')) {
      console.warn('localStorage quota exceeded, clearing cache...');
      try {
        getTcgdexKeys().forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem(CACHE_META_KEY);
      } catch (e) {
        console.error('Failed to clear cache:', e);
      }
      return await originalRequest.call(this, url, options);
    }
    throw error;
  }
};

export default tcgdex;
