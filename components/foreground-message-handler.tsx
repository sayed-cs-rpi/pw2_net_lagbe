'use client';

import { useEffect } from 'react';
import { onForegroundMessage } from '@/lib/notifications';
import toast from 'react-hot-toast';

export function ForegroundMessageHandler() {
  useEffect(() => {
    return onForegroundMessage(payload => {
      const title = payload.notification?.title || 'New notification';
      const body = payload.notification?.body || '';
      toast(`${title}: ${body}`, { duration: 6000, icon: '🔔' });
    });
  }, []);

  return null;
}
