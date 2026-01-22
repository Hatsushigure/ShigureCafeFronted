const DB_NAME = 'shigure-cafe-avatar-cache';
const STORE_NAME = 'avatars';
const DB_VERSION = 3;
const ONE_DAY = 24 * 60 * 60 * 1000;

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

interface CachedAvatar {
  blob: Blob;
  timestamp: number;
}

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (_event) => {
      const db = request.result;
      // Remove old stores and recreate avatars store to ensure clean schema
      if (db.objectStoreNames.contains('minecraft-avatars')) {
        db.deleteObjectStore('minecraft-avatars');
      }
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Gets an avatar from memory cache, IndexedDB, or network.
 */
export async function getAvatar(url: string, force: boolean = false): Promise<string | null> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url || null;
  }

  if (!force && objectUrlCache.has(url)) {
    return objectUrlCache.get(url)!;
  }

  const existingPromise = pendingRequests.get(url);
  if (!force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      const db = await getDB();
      const now = Date.now();

      if (!force) {
        const cached = await new Promise<CachedAvatar | null>((resolve) => {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(url);
          request.onsuccess = () => {
            const result = request.result;
            if (result && result.blob instanceof Blob && typeof result.timestamp === 'number') {
              resolve(result);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });

        if (cached && (now - cached.timestamp < ONE_DAY)) {
          if (objectUrlCache.has(url)) return objectUrlCache.get(url)!;
          const blobUrl = URL.createObjectURL(cached.blob);
          objectUrlCache.set(url, blobUrl);
          return blobUrl;
        }
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
      const request = store.put({ blob, timestamp: Date.now() }, url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to cache avatar in IndexedDB:', e);
  }

  return blobUrl;
}

/**
 * Gets a Minecraft avatar with 24-hour caching.
 * @param uuid The player's Minecraft UUID
 * @param size The avatar size
 * @param force Whether to bypass cache and force a fresh fetch
 */
export async function getMinecraftAvatar(_playerId: string, uuid: string, size: number = 32, force: boolean = false): Promise<string | null> {
  const url = `https://crafthead.net/avatar/${uuid}/${size}`;
  return getAvatar(url, force);
}