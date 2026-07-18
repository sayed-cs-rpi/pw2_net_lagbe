import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  QueryConstraint,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Ticket, TicketMessage, Shift, User } from './types';

// Tickets
export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
  const ticketRef = doc(collection(db, 'tickets'));
  const now = new Date();
  await setDoc(ticketRef, {
    ...ticket,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return ticketRef.id;
}

export async function getTicket(ticketId: string) {
  const docRef = doc(db, 'tickets', ticketId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      resolvedAt: data.resolvedAt?.toDate?.(),
    } as Ticket;
  }
  return null;
}

export async function getTickets(constraints: QueryConstraint[]) {
  const q = query(collection(db, 'tickets'), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    resolvedAt: doc.data().resolvedAt?.toDate?.(),
  })) as Ticket[];
}

export async function getTicketsByComplainer(complainerId: string) {
  return getTickets([where('complainerId', '==', complainerId), orderBy('createdAt', 'desc')]);
}

export async function getTicketsByTechnician(technicianId: string) {
  return getTickets([where('assignedToId', '==', technicianId), orderBy('createdAt', 'desc')]);
}

export async function getUnassignedTickets() {
  return getTickets([
    where('status', 'in', ['open', 'assigned']),
    where('assignedToId', '==', undefined),
    orderBy('priority'),
    orderBy('createdAt', 'desc'),
  ]);
}

export function subscribeToTickets(
  constraints: QueryConstraint[],
  onUpdate: (tickets: Ticket[]) => void
): Unsubscribe {
  const q = query(collection(db, 'tickets'), ...constraints);
  return onSnapshot(q, querySnapshot => {
    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate?.(),
    })) as Ticket[];
    onUpdate(tickets);
  });
}

export async function updateTicket(ticketId: string, updates: Partial<Ticket>) {
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Ticket Messages
export async function addTicketMessage(message: Omit<TicketMessage, 'id' | 'createdAt'>) {
  const messageRef = doc(collection(db, 'tickets', message.ticketId, 'messages'));
  await setDoc(messageRef, {
    ...message,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return messageRef.id;
}

export async function getTicketMessages(ticketId: string) {
  const q = query(
    collection(db, 'tickets', ticketId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  })) as TicketMessage[];
}

export function subscribeToTicketMessages(
  ticketId: string,
  onUpdate: (messages: TicketMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'tickets', ticketId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, querySnapshot => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as TicketMessage[];
    onUpdate(messages);
  });
}

// Shifts
export async function createShift(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) {
  const shiftRef = doc(collection(db, 'shifts'));
  const now = new Date();
  await setDoc(shiftRef, {
    ...shift,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return shiftRef.id;
}

export async function getActiveShifts() {
  const q = query(collection(db, 'shifts'), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate?.() || new Date(),
    endTime: doc.data().endTime?.toDate?.() || new Date(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as Shift[];
}

export async function updateShift(shiftId: string, updates: Partial<Shift>) {
  const shiftRef = doc(db, 'shifts', shiftId);
  await updateDoc(shiftRef, {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Analytics
export async function getTicketStats() {
  const allTickets = await getTickets([]);
  
  const stats = {
    total: allTickets.length,
    open: allTickets.filter(t => t.status === 'open').length,
    assigned: allTickets.filter(t => t.status === 'assigned').length,
    inProgress: allTickets.filter(t => t.status === 'in_progress').length,
    resolved: allTickets.filter(t => t.status === 'resolved').length,
    closed: allTickets.filter(t => t.status === 'closed').length,
  };

  return stats;
}
