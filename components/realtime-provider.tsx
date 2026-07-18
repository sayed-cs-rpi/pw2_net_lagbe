'use client';

import { useEffect, useRef } from 'react';
import { orderBy, where, Unsubscribe } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import {
  subscribeToTickets,
  subscribeToTicketMessages,
} from '@/lib/firestore-service';
import {
  showNotificationToast,
  sendNotificationToUser,
  sendNotificationToAdmins,
  NotificationPayload,
} from '@/lib/notifications';
import { Ticket, TicketMessage, UserRole } from '@/lib/types';

function shouldNotifyForMessage(message: TicketMessage, role: UserRole): boolean {
  if (message.isInternal && role === 'complainer') return false;
  return true;
}

function notifyUser(userId: string, payload: NotificationPayload) {
  void sendNotificationToUser(userId, payload);
}

function notifyAdmins(payload: NotificationPayload) {
  void sendNotificationToAdmins(payload);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const prevTicketsRef = useRef<Map<string, Ticket>>(new Map());
  const ticketsInitializedRef = useRef(false);
  const messageUnsubsRef = useRef<Map<string, Unsubscribe>>(new Map());
  const prevMessageIdsRef = useRef<Map<string, Set<string>>>(new Map());
  const messagesInitializedRef = useRef<Map<string, boolean>>(new Map());
  const ticketMetaRef = useRef<Map<string, Ticket>>(new Map());

  useEffect(() => {
    if (!user?.uid) {
      prevTicketsRef.current.clear();
      ticketsInitializedRef.current = false;
      ticketMetaRef.current.clear();
      for (const unsub of messageUnsubsRef.current.values()) unsub();
      messageUnsubsRef.current.clear();
      prevMessageIdsRef.current.clear();
      messagesInitializedRef.current.clear();
      return;
    }

    const constraints =
      user.role === 'admin'
        ? [orderBy('createdAt', 'desc')]
        : user.role === 'technician'
          ? [where('assignedToId', '==', user.uid), orderBy('createdAt', 'desc')]
          : [where('complainerId', '==', user.uid), orderBy('createdAt', 'desc')];

    const unsubTickets = subscribeToTickets(constraints, tickets => {
      handleTicketSnapshot(tickets, user.uid, user.role);
    });

    const extraUnsubs: Unsubscribe[] = [];

    if (user.role === 'admin') {
      extraUnsubs.push(
        subscribeToTickets([where('status', '==', 'open'), orderBy('createdAt', 'desc')], tickets => {
          handleOpenTicketSnapshot(tickets, user.uid);
        })
      );
    }

    if (user.role === 'technician') {
      extraUnsubs.push(
        subscribeToTickets([where('status', '==', 'open'), orderBy('createdAt', 'desc')], tickets => {
          handleOpenTicketSnapshot(tickets, user.uid);
        })
      );
    }

    return () => {
      unsubTickets();
      extraUnsubs.forEach(u => u());
      for (const unsub of messageUnsubsRef.current.values()) unsub();
      messageUnsubsRef.current.clear();
      prevMessageIdsRef.current.clear();
      messagesInitializedRef.current.clear();
      prevTicketsRef.current.clear();
      ticketsInitializedRef.current = false;
      ticketMetaRef.current.clear();
    };
  }, [user?.uid, user?.role]);

  function syncMessageListeners(tickets: Ticket[], userId: string, role: UserRole) {
    const ticketIds = new Set(tickets.map(t => t.id));

    for (const [id, unsub] of messageUnsubsRef.current) {
      if (!ticketIds.has(id)) {
        unsub();
        messageUnsubsRef.current.delete(id);
        prevMessageIdsRef.current.delete(id);
        messagesInitializedRef.current.delete(id);
      }
    }

    for (const ticket of tickets) {
      ticketMetaRef.current.set(ticket.id, ticket);

      if (messageUnsubsRef.current.has(ticket.id)) continue;

      prevMessageIdsRef.current.set(ticket.id, new Set());

      const unsub = subscribeToTicketMessages(ticket.id, messages => {
        handleMessageSnapshot(ticket.id, messages, userId, role);
      });
      messageUnsubsRef.current.set(ticket.id, unsub);
    }
  }

  function handleTicketSnapshot(tickets: Ticket[], userId: string, role: UserRole) {
    if (!ticketsInitializedRef.current) {
      tickets.forEach(t => prevTicketsRef.current.set(t.id, t));
      ticketsInitializedRef.current = true;
      syncMessageListeners(tickets, userId, role);
      return;
    }

    const prev = prevTicketsRef.current;

    for (const ticket of tickets) {
      const old = prev.get(ticket.id);
      if (!old) {
        if (role === 'admin' && ticket.complainerId !== userId) {
          const payload: NotificationPayload = {
            title: 'New Ticket Created',
            body: `New ticket "${ticket.title}" from ${ticket.complainerName}`,
            data: { ticketId: ticket.id, type: 'ticket_created' },
          };
          showNotificationToast(payload);
          notifyUser(userId, payload);
        } else if (role === 'complainer' && ticket.complainerId === userId) {
          // Own ticket — no notification needed
        } else if (role === 'technician' && ticket.assignedToId === userId) {
          const payload: NotificationPayload = {
            title: 'New Ticket Assigned',
            body: `You have been assigned: ${ticket.title}`,
            data: { ticketId: ticket.id, type: 'assignment' },
          };
          showNotificationToast(payload);
          notifyUser(userId, payload);
        }
      } else {
        if (old.status !== ticket.status) {
          const payload: NotificationPayload = {
            title: 'Ticket Status Update',
            body: `"${ticket.title}" is now ${ticket.status.replace('_', ' ')}`,
            data: { ticketId: ticket.id, type: 'status_update' },
          };
          showNotificationToast(payload);
          if (role === 'complainer' && ticket.complainerId === userId) {
            notifyUser(userId, payload);
          } else if (role === 'technician' && ticket.assignedToId === userId) {
            notifyUser(userId, payload);
          } else if (role === 'admin') {
            notifyUser(userId, payload);
          }
        }

        if (old.assignedToId !== ticket.assignedToId && ticket.assignedToId) {
          if (role === 'technician' && ticket.assignedToId === userId && old.assignedToId !== userId) {
            const payload: NotificationPayload = {
              title: 'New Ticket Assigned',
              body: `You have been assigned: ${ticket.title}`,
              data: { ticketId: ticket.id, type: 'assignment' },
            };
            showNotificationToast(payload);
            notifyUser(userId, payload);
          } else if (role === 'admin') {
            const payload: NotificationPayload = {
              title: 'Ticket Assigned',
              body: `"${ticket.title}" assigned to ${ticket.assignedToName || 'a technician'}`,
              data: { ticketId: ticket.id, type: 'assignment' },
            };
            showNotificationToast(payload);
            notifyUser(userId, payload);
          } else if (role === 'complainer' && ticket.complainerId === userId) {
            const payload: NotificationPayload = {
              title: 'Ticket Assigned',
              body: `Your ticket "${ticket.title}" was assigned to ${ticket.assignedToName || 'a technician'}`,
              data: { ticketId: ticket.id, type: 'assignment' },
            };
            showNotificationToast(payload);
            notifyUser(userId, payload);
          }
        }
      }
    }

    prevTicketsRef.current = new Map(tickets.map(t => [t.id, t]));
    syncMessageListeners(tickets, userId, role);
  }

  function handleOpenTicketSnapshot(tickets: Ticket[], userId: string) {
    const unassigned = tickets.filter(t => !t.assignedToId);
    if (!ticketsInitializedRef.current) {
      unassigned.forEach(t => prevTicketsRef.current.set(`open:${t.id}`, t));
      return;
    }

    for (const ticket of unassigned) {
      if (!prevTicketsRef.current.has(`open:${t.id}`) && !prevTicketsRef.current.has(ticket.id)) {
        const payload: NotificationPayload = {
          title: 'New Ticket in Queue',
          body: `New open ticket: ${ticket.title}`,
          data: { ticketId: ticket.id, type: 'ticket_created' },
        };
        showNotificationToast(payload);
        notifyUser(userId, payload);
      }
      prevTicketsRef.current.set(`open:${t.id}`, ticket);
    }
  }

  function handleMessageSnapshot(
    ticketId: string,
    messages: TicketMessage[],
    userId: string,
    role: UserRole
  ) {
    const prevIds = prevMessageIdsRef.current.get(ticketId) ?? new Set();
    const initialized = messagesInitializedRef.current.get(ticketId) ?? false;
    const ticket = ticketMetaRef.current.get(ticketId);

    if (!initialized) {
      messages.forEach(m => prevIds.add(m.id));
      prevMessageIdsRef.current.set(ticketId, prevIds);
      messagesInitializedRef.current.set(ticketId, true);
      return;
    }

    for (const message of messages) {
      if (prevIds.has(message.id)) continue;
      prevIds.add(message.id);

      if (message.userId === userId) continue;
      if (!shouldNotifyForMessage(message, role)) continue;
      if (!ticket) continue;

      const payload: NotificationPayload = {
        title: 'New Message',
        body: `${message.userName}: ${message.message.substring(0, 80)}${message.message.length > 80 ? '…' : ''}`,
        data: { ticketId, type: 'message' },
      };

      showNotificationToast(payload);
      notifyUser(userId, payload);

      if (role === 'admin') {
        notifyAdmins(payload);
      }
    }

    prevMessageIdsRef.current.set(ticketId, prevIds);
  }

  return <>{children}</>;
}
