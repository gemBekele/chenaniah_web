/**
 * Offline storage utility using IndexedDB for attendance records
 */

const DB_NAME = 'attendance_db';
const DB_VERSION = 1;
const STORE_NAME = 'attendance_records';

interface OfflineAttendanceRecord {
  id?: number;
  sessionId: number;
  qrCode: string;
  scannedAt: string; // ISO string
  synced: boolean;
}

let db: IDBDatabase | null = null;

export async function initOfflineStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        objectStore.createIndex('sessionId', 'sessionId', { unique: false });
        objectStore.createIndex('synced', 'synced', { unique: false });
        objectStore.createIndex('scannedAt', 'scannedAt', { unique: false });
      }
    };
  });
}

export async function saveOfflineRecord(
  record: Omit<OfflineAttendanceRecord, 'id' | 'synced'>
): Promise<number> {
  if (!db) {
    await initOfflineStorage();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({
      ...record,
      synced: false,
    });

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineRecords(
  sessionId?: number
): Promise<OfflineAttendanceRecord[]> {
  if (!db) {
    await initOfflineStorage();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = sessionId
      ? store.index('sessionId').getAll(sessionId)
      : store.getAll();

    request.onsuccess = () => {
      const records = request.result as OfflineAttendanceRecord[];
      resolve(records.filter((r) => !r.synced));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markRecordAsSynced(id: number): Promise<void> {
  if (!db) {
    await initOfflineStorage();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const record = getRequest.result;
      if (record) {
        record.synced = true;
        const updateRequest = store.put(record);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteSyncedRecords(): Promise<void> {
  if (!db) {
    await initOfflineStorage();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.openCursor(IDBKeyRange.only(true));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineRecordCount(): Promise<number> {
  if (!db) {
    await initOfflineStorage();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.count(IDBKeyRange.only(false));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
