const DB_NAME = 'shigure-cafe-avatar-cache';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Gets a cached avatar blob as an object URL.
 * Returns null if not found.
 */
export async function getCachedAvatar(url: string): Promise<string | null> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return null;
  }

  if (objectUrlCache.has(url)) {
    return objectUrlCache.get(url)!;
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      request.onsuccess = () => {
        if (request.result instanceof Blob) {
          const blobUrl = URL.createObjectURL(request.result);
          objectUrlCache.set(url, blobUrl);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.error('Failed to get avatar from cache:', e);
    return null;
  }
}

/**
 * Caches an avatar from a URL and returns its object URL.
 */
export async function cacheAvatar(url: string, blob: Blob): Promise<string> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return '';
  }

  // Update object URL cache
  if (objectUrlCache.has(url)) {
    URL.revokeObjectURL(objectUrlCache.get(url)!);
  }
  const blobUrl = URL.createObjectURL(blob);
  objectUrlCache.set(url, blobUrl);

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
    console.error('Failed to cache avatar:', e);
  }

  return blobUrl;
}
