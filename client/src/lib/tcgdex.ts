import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(0); // Disable cache to avoid localStorage quota issues with large results

// Wrap to handle localStorage quota errors
const originalRequest = (tcgdex as any).request;
(tcgdex as any).request = async function (url: string, options: any) {
  try {
    return await originalRequest.call(this, url, options);
  } catch (error: any) {
    // If localStorage is full, clear it and retry
    if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('exceeded the quota')) {
      console.warn('localStorage quota exceeded, clearing cache...');
      try {
        // Clear TCGdex cache entries
        const keys = Object.keys(localStorage).filter(k => k.includes('@tcgdex-cache'));
        keys.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.error('Failed to clear cache:', e);
      }
      // Retry the request
      return await originalRequest.call(this, url, options);
    }
    throw error;
  }
};

export default tcgdex;
