// Utilities for PWA features - offline cache, push notifications, etc.

// Request permission for push notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Send a test notification
export async function sendNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      });
    } else {
      new Notification(title, options);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// IndexedDB utilities for offline storage
export const DB_NAME = 'menusafe';
export const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('offlineScans')) {
        database.createObjectStore('offlineScans', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('cachedAnalytics')) {
        database.createObjectStore('cachedAnalytics', { keyPath: 'userId' });
      }
    };
  });
}

export async function saveScanOffline(scanData: any) {
  const database = db || (await initDB());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offlineScans'], 'readwrite');
    const store = transaction.objectStore('offlineScans');
    const request = store.add({
      id: Date.now(),
      data: scanData,
      timestamp: new Date().toISOString(),
      synced: false,
    });

    request.onerror = () => reject(new Error('Failed to save scan'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getOfflineScans() {
  const database = db || (await initDB());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offlineScans'], 'readonly');
    const store = transaction.objectStore('offlineScans');
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get scans'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteOfflineScan(scanId: number) {
  const database = db || (await initDB());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offlineScans'], 'readwrite');
    const store = transaction.objectStore('offlineScans');
    const request = store.delete(scanId);

    request.onerror = () => reject(new Error('Failed to delete scan'));
    request.onsuccess = () => resolve(request.result);
  });
}

// Image compression utility
export async function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

// Check if app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline changes
export function onOnlineStatusChange(callback: (isOnline: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));

  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}
