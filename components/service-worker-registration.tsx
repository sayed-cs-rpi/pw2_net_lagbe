'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('[v0] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('[v0] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
