// Utility for caching music score sheets and assets for offline PWA access

const CACHE_NAME = 'smartband-music-cache-v1';

export const cacheResourceForOffline = async (url) => {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      await cache.put(url, response);
      return true;
    }
  } catch (err) {
    console.warn('Failed to cache resource offline:', url, err);
  }
  return false;
};

export const isResourceCachedOffline = async (url) => {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    return !!match;
  } catch (err) {
    return false;
  }
};

export const getCachedResourceUrl = async (url) => {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn('Error fetching cached blob:', err);
  }
  return url;
};

export const removeOfflineResource = async (url) => {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(url);
  } catch (err) {
    return false;
  }
};
