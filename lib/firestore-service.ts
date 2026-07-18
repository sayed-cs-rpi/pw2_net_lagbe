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
import { getDbInstance } from './firebase';
import { Ticket, TicketMessage, Shift, User, Room, UserRole } from './types';

function mapTicketDoc(id: string, data: Record<string, unknown>): Ticket {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    resolvedAt: (data.resolvedAt as { toDate?: () => Date })?.toDate?.(),
  } as Ticket;
}

function mapRoomDoc(id: string, data: Record<string, unknown>): Room {
  return {
    id,
    name: (data.name as string) || '',
    building: (data.building as string) || '',
    floor: (data.floor as string) || '',
    roomNumber: (data.roomNumber as string) || '',
    notes: data.notes as string | undefined,
    ownerId: (data.ownerId as string) || '',
    ownerName: (data.ownerName as string) || '',
    ownerEmail: (data.ownerEmail as string) || '',
    createdBy: (data.createdBy as string) || '',
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
  };
}

// Tickets
export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
  const database = getDbInstance();
  const ticketRef = doc(collection(database, 'tickets'));
  const now = new Date();
  const payload: Record<string, unknown> = {
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };
  for (const [key, value] of Object.entries(ticket)) {
    if (value !== undefined) payload[key] = value;
  }
  await setDoc(ticketRef, payload);
  return ticketRef.id;
}

export async function getTicket(ticketId: string) {
  const database = getDbInstance();
  const docRef = doc(database, 'tickets', ticketId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapTicketDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
  }
  return null;
}

export async function getTickets(constraints: QueryConstraint[]) {
  const database = getDbInstance();
  const q = query(collection(database, 'tickets'), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => mapTicketDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getTicketsByComplainer(complainerId: string) {
  return getTickets([where('complainerId', '==', complainerId), orderBy('createdAt', 'desc')]);
}

export async function getTicketsByTechnician(technicianId: string) {
  return getTickets([where('assignedToId', '==', technicianId), orderBy('createdAt', 'desc')]);
}

export async function getUnassignedTickets() {
  // Firestore cannot query for missing fields reliably; load open tickets and filter.
  const openTickets = await getTickets([
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
  ]);
  return openTickets.filter(t => !t.assignedToId);
}

export async function assignTicket(
  ticketId: string,
  technicianId: string,
  technicianName: string
) {
  await updateTicket(ticketId, {
    assignedToId: technicianId,
    assignedToName: technicianName,
    status: 'assigned',
  });
}

export function subscribeToTickets(
  constraints: QueryConstraint[],
  onUpdate: (tickets: Ticket[]) => void
): Unsubscribe {
  const q = query(collection(getDbInstance(), 'tickets'), ...constraints);
  return onSnapshot(q, querySnapshot => {
    const tickets = querySnapshot.docs.map(d =>
      mapTicketDoc(d.id, d.data() as Record<string, unknown>)
    );
    onUpdate(tickets);
  });
}

export async function updateTicket(ticketId: string, updates: Partial<Ticket>) {
  const ticketRef = doc(getDbInstance(), 'tickets', ticketId);
  const payload: Record<string, unknown> = {
    updatedAt: Timestamp.fromDate(new Date()),
  };

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || value === undefined) {
      continue;
    }
    if (value instanceof Date) {
      payload[key] = Timestamp.fromDate(value);
    } else {
      payload[key] = value;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(ticketRef, payload as any);
}

// Rooms
export async function createRoom(
  room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>
) {
  const roomRef = doc(collection(getDbInstance(), 'rooms'));
  const now = new Date();
  await setDoc(roomRef, {
    ...room,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return roomRef.id;
}

export async function getRoom(roomId: string) {
  const docRef = doc(getDbInstance(), 'rooms', roomId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapRoomDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
  }
  return null;
}

export async function getRooms() {
  const q = query(collection(getDbInstance(), 'rooms'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => mapRoomDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getRoomsByOwner(ownerId: string) {
  const q = query(collection(getDbInstance(), 'rooms'), where('ownerId', '==', ownerId));
  const querySnapshot = await getDocs(q);
  const rooms = querySnapshot.docs.map(d => mapRoomDoc(d.id, d.data() as Record<string, unknown>));
  return rooms.sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateRoom(roomId: string, updates: Partial<Room>) {
  const roomRef = doc(getDbInstance(), 'rooms', roomId);
  const { id: _id, createdAt: _c, ...safeUpdates } = updates as Partial<Room> & {
    id?: string;
    createdAt?: Date;
  };
  await updateDoc(roomRef, {
    ...safeUpdates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function deleteRoom(roomId: string) {
  await deleteDoc(doc(getDbInstance(), 'rooms', roomId));
}

export async function countActiveTicketsForRoom(roomId: string) {
  const tickets = await getTickets([where('roomId', '==', roomId)]);
  return tickets.filter(t =>
    t.status === 'open' || t.status === 'assigned' || t.status === 'in_progress'
  ).length;
}

// Users
export async function getUsersByRole(role: UserRole) {
  const q = query(collection(getDbInstance(), 'users'), where('role', '==', role));
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(d => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email || '',
      name: data.name || '',
      role: data.role as UserRole,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      avatar: data.avatar,
      fcmToken: data.fcmToken,
    } as User;
  });
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

// Ticket Messages
export async function addTicketMessage(message: Omit<TicketMessage, 'id' | 'createdAt'>) {
  const messageRef = doc(collection(getDbInstance(), 'tickets', message.ticketId, 'messages'));
  await setDoc(messageRef, {
    ...message,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return messageRef.id;
}

export async function getTicketMessages(ticketId: string) {
  const q = query(
    collection(getDbInstance(), 'tickets', ticketId, 'messages'),
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
    collection(getDbInstance(), 'tickets', ticketId, 'messages'),
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
  const shiftRef = doc(collection(getDbInstance(), 'shifts'));
  const now = new Date();
  await setDoc(shiftRef, {
    ...shift,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return shiftRef.id;
}

export async function getActiveShifts() {
  const q = query(collection(getDbInstance(), 'shifts'), where('isActive', '==', true));
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
  const shiftRef = doc(getDbInstance(), 'shifts', shiftId);
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
