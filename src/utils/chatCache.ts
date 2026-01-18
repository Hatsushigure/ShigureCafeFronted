import type { Message } from '../types/chat';

const DB_NAME = 'shigure-cafe-chat-cache';
const STORE_NAME = 'messages';
const DB_VERSION = 1;
const MAX_MESSAGES = 1000; // Keep last 1000 messages

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (event.oldVersion < 1) {
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function saveMessage(message: Message): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.put(message);
    
    transaction.oncomplete = async () => {
      // Optional: Cleanup old messages if count exceeds MAX_MESSAGES
      // This could be optimized to run less frequently
    };
  } catch (e) {
    console.error('Failed to save message to IndexedDB:', e);
  }
}

export async function getAllMessages(): Promise<Message[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const messages = request.result || [];
        // Sort by timestamp just in case
        messages.sort((a: Message, b: Message) => a.timestamp - b.timestamp);
        resolve(messages);
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error('Failed to get all messages from IndexedDB:', e);
    return [];
  }
}

export async function clearMessages(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to clear messages from IndexedDB:', e);
  }
}

export async function trimMessages(): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        if (countRequest.result > MAX_MESSAGES) {
          const deleteCount = countRequest.result - MAX_MESSAGES;
          const cursorRequest = store.openCursor();
          let deleted = 0;
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (cursor && deleted < deleteCount) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        }
      };
    } catch (e) {
      console.error('Failed to trim messages in IndexedDB:', e);
    }
  }
