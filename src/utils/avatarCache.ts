const DB_NAME = 'shigure-cafe-avatar-cache';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

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
 * Gets an avatar from memory cache, IndexedDB, or network.
 * Deduplicates concurrent requests for the same URL.
 */
export async function getAvatar(url: string): Promise<string | null> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url || null;
  }

  // 1. Check memory cache
  if (objectUrlCache.has(url)) {
    return objectUrlCache.get(url)!;
  }

  // 2. Check if there's already a request (DB or Network) in progress
  const existingPromise = pendingRequests.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  // 3. Create a new pending request
  const promise = (async () => {
    try {
      // Try IndexedDB first
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

      // Not in DB, fetch from network
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const freshBlob = await response.blob();
      
      // Store in DB and create Object URL
      return await cacheAvatar(url, freshBlob);
    } catch (e) {
      console.error('Failed to load avatar:', e);
      return null;
    }
  })();

  pendingRequests.set(url, promise);
  
  // Cleanup logic
  promise.finally(() => {
    if (pendingRequests.get(url) === promise) {
      pendingRequests.delete(url);
    }
  });

  return promise;
}

/**
 * Gets a cached avatar blob as an object URL.
 * Returns null if not found.
 */
export async function getCachedAvatar(url: string): Promise<string | null> {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return null;
  }

  // 1. Check memory cache
  if (objectUrlCache.has(url)) {
    return objectUrlCache.get(url)!;
  }

  // 2. Check if there's already a request in progress for this URL
  const existingPromise = pendingRequests.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  // 3. Create a new pending request for IndexedDB lookup
  const promise = (async () => {
    try {
      const db = await getDB();
      const blob = await new Promise<Blob | null>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
        request.onerror = () => resolve(null);
      });

      if (blob) {
        // Double check memory cache in case it was set while we were waiting
        if (objectUrlCache.has(url)) {
          return objectUrlCache.get(url)!;
        }
        const blobUrl = URL.createObjectURL(blob);
        objectUrlCache.set(url, blobUrl);
        return blobUrl;
      }
      return null;
    } catch (e) {
      console.error('Failed to get avatar from IndexedDB:', e);
      return null;
    }
  })();

  pendingRequests.set(url, promise);

  // Cleanup logic
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

  // Update object URL cache
  const oldUrl = objectUrlCache.get(url);
  const blobUrl = URL.createObjectURL(blob);
  objectUrlCache.set(url, blobUrl);
  
  // Revoke old URL if it exists to prevent memory leaks
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
