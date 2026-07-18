import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging, auth } from './firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getDbInstance } from './firebase';
import { Ticket, User } from './types';
import toast from 'react-hot-toast';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    ticketId?: string;
    type: 'assignment' | 'status_update' | 'message' | 'ticket_created';
  };
}

export function showNotificationToast(payload: NotificationPayload): void {
  if (typeof window === 'undefined') return;
  toast(`${payload.title}: ${payload.body}`, { duration: 6000, icon: '🔔' });
}

// Send notification to a specific user via their FCM token
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const db = getDbInstance();
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.warn('[v0] User not found:', userId);
      return false;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.warn('[v0] No FCM token for user:', userId);
      // Still allow local notification if this browser is the recipient
    } else {
      // Production would POST to FCM via Admin SDK / Cloud Function using fcmToken.
      console.log('[v0] FCM token present for user:', userId, 'payload:', payload);
    }

    // Client-side fallback: only show a browser notification if THIS session is the recipient.
    // Cross-device push requires a server with Firebase Admin SDK.
    const isCurrentUser = auth?.currentUser?.uid === userId;
    if (
      isCurrentUser &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192.png',
        badge: '/icon-light-32x32.png',
        data: payload.data,
      });
    }

    showNotificationToast(payload);

    return true;
  } catch (error) {
    console.error('[v0] Error sending notification:', error);
    return false;
  }
}

// Get all admin users
export async function getAdminUsers(): Promise<User[]> {
  try {
    const db = getDbInstance();
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as User[];
  } catch (error) {
    console.error('[v0] Error fetching admin users:', error);
    return [];
  }
}

// Send notification to all admins
export async function sendNotificationToAdmins(payload: NotificationPayload): Promise<void> {
  const admins = await getAdminUsers();
  for (const admin of admins) {
    await sendNotificationToUser(admin.uid, payload);
  }
}

// Send notification when a new ticket is created (to admins)
export async function sendTicketCreatedNotification(ticket: Ticket): Promise<void> {
  const payload: NotificationPayload = {
    title: 'New Ticket Created',
    body: `New ticket "${ticket.title}" created by ${ticket.complainerName}`,
    data: {
      ticketId: ticket.id,
      type: 'ticket_created',
    },
  };

  await sendNotificationToAdmins(payload);
}

// Send notification when a ticket is assigned to a technician (to technician and admins)
export async function sendTicketAssignmentNotification(ticket: Ticket): Promise<void> {
  if (!ticket.assignedToId) return;

  const technicianPayload: NotificationPayload = {
    title: 'New Ticket Assigned',
    body: `You have been assigned to ticket: ${ticket.title}`,
    data: {
      ticketId: ticket.id,
      type: 'assignment',
    },
  };

  // Notify the assigned technician
  await sendNotificationToUser(ticket.assignedToId, technicianPayload);

  // Also notify all admins
  const adminPayload: NotificationPayload = {
    title: 'Ticket Assigned',
    body: `Ticket "${ticket.title}" assigned to ${ticket.assignedToName || 'a technician'}`,
    data: {
      ticketId: ticket.id,
      type: 'assignment',
    },
  };
  await sendNotificationToAdmins(adminPayload);
}

// Send notification when ticket status changes (to complainer, assigned technician, and all admins)
export async function sendTicketStatusNotification(
  ticket: Ticket,
  previousStatus: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    assigned: `Ticket "${ticket.title}" has been assigned to ${ticket.assignedToName || 'a technician'}`,
    in_progress: `Ticket "${ticket.title}" is now in progress`,
    resolved: `Ticket "${ticket.title}" has been resolved`,
    closed: `Ticket "${ticket.title}" has been closed`,
  };

  const message = statusMessages[ticket.status] || `Ticket "${ticket.title}" status updated to ${ticket.status}`;

  const payload: NotificationPayload = {
    title: 'Ticket Status Update',
    body: message,
    data: {
      ticketId: ticket.id,
      type: 'status_update',
    },
  };

  // Notify complainer
  await sendNotificationToUser(ticket.complainerId, payload);

  // If assigned to technician, also notify them (only if it's their ticket)
  if (ticket.assignedToId && ticket.assignedToId !== ticket.complainerId) {
    await sendNotificationToUser(ticket.assignedToId, payload);
  }

  // Always notify all admins
  await sendNotificationToAdmins(payload);
}

// Send notification when a new message is added to a ticket (to relevant parties and all admins)
export async function sendTicketMessageNotification(
  ticket: Ticket,
  senderName: string,
  recipientId?: string
): Promise<void> {
  const payload: NotificationPayload = {
    title: 'New Message',
    body: `${senderName} sent a message on ticket: ${ticket.title}`,
    data: {
      ticketId: ticket.id,
      type: 'message',
    },
  };

  // Notify specific recipient if provided
  if (recipientId) {
    await sendNotificationToUser(recipientId, payload);
  }

  // Always notify all admins
  await sendNotificationToAdmins(payload);
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[v0] Foreground message received:', payload);
    callback(payload);
  });
}
