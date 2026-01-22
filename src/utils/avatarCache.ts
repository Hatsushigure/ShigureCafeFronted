const DB_NAME = 'shigure-cafe-avatar-cache';
const STORE_NAME = 'avatars';
const MC_STORE_NAME = 'minecraft-avatars';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(MC_STORE_NAME)) {
        db.createObjectStore(MC_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Gets an avatar from memory cache, IndexedDB, or network.
 */
export async function getAvatar(url: string): Promise<string | null> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url || null;
  }

  if (objectUrlCache.has(url)) {
    return objectUrlCache.get(url)!;
  }

  const existingPromise = pendingRequests.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      const db = await getDB();
      const cachedBlob = await new Promise<Blob | null>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
        request.onerror = () => resolve(null);
      });

      if (cachedBlob) {
        if (objectUrlCache.has(url)) return objectUrlCache.get(url)!;
        const blobUrl = URL.createObjectURL(cachedBlob);
        objectUrlCache.set(url, blobUrl);
        return blobUrl;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const freshBlob = await response.blob();
      
      return await cacheAvatar(url, freshBlob);
    } catch (e) {
      console.error('Failed to load avatar:', e);
      return null;
    }
  })();

  pendingRequests.set(url, promise);
  promise.finally(() => {
    if (pendingRequests.get(url) === promise) {
      pendingRequests.delete(url);
    }
  });

  return promise;
}

/**
 * Caches an avatar from a URL and returns its object URL.
 */
export async function cacheAvatar(url: string, blob: Blob): Promise<string> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return '';
  }

  const oldUrl = objectUrlCache.get(url);
  const blobUrl = URL.createObjectURL(blob);
  objectUrlCache.set(url, blobUrl);
  
  if (oldUrl && oldUrl !== blobUrl) {
    URL.revokeObjectURL(oldUrl);
  }

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to cache avatar in IndexedDB:', e);
  }

  return blobUrl;
}

interface CachedMinecraftAvatar {
  blob: Blob;
  timestamp: number;
}

/**
 * Gets a Minecraft avatar with 24-hour caching.
 * @param playerId The player's unique identifier (e.g., username)
 * @param uuid The player's Minecraft UUID
 * @param size The avatar size
 * @param force Whether to bypass cache and force a fresh fetch
 */
export async function getMinecraftAvatar(playerId: string, uuid: string, size: number = 32, force: boolean = false): Promise<string | null> {
  const cacheKey = `mc-${playerId}`;
  
  // 1. Check memory cache (only if not forcing refresh)
  if (!force && objectUrlCache.has(cacheKey)) {
    return objectUrlCache.get(cacheKey)!;
  }

  // 2. Check pending requests
  const existingPromise = pendingRequests.get(cacheKey);
  if (existingPromise && !force) return existingPromise;

  const promise = (async () => {
    try {
      const db = await getDB();
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (!force) {
        const cached = await new Promise<CachedMinecraftAvatar | null>((resolve) => {
          const transaction = db.transaction(MC_STORE_NAME, 'readonly');
          const store = transaction.objectStore(MC_STORE_NAME);
          const request = store.get(playerId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });

        if (cached && (now - cached.timestamp < ONE_DAY)) {
          const blobUrl = URL.createObjectURL(cached.blob);
          objectUrlCache.set(cacheKey, blobUrl);
          return blobUrl;
        }
      }

      // Fetch fresh
      const url = `https://crafthead.net/avatar/${uuid}/${size}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();

      // Save to IndexedDB
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(MC_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(MC_STORE_NAME);
        const request = store.put({ blob, timestamp: now }, playerId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const oldUrl = objectUrlCache.get(cacheKey);
      const blobUrl = URL.createObjectURL(blob);
      objectUrlCache.set(cacheKey, blobUrl);
      if (oldUrl && oldUrl !== blobUrl) {
        URL.revokeObjectURL(oldUrl);
      }
      return blobUrl;
    } catch (e) {
      console.error('Failed to load Minecraft avatar:', e);
      return null;
    }
  })();

  pendingRequests.set(cacheKey, promise);
  promise.finally(() => {
    if (pendingRequests.get(cacheKey) === promise) {
      pendingRequests.delete(cacheKey);
    }
  });

  return promise;
}