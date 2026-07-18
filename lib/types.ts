export type UserRole = 'complainer' | 'technician' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  fcmToken?: string;
}

export interface Shift {
  id: string;
  technicianId: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  roomNumber: string;
  notes?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  complainerId: string;
  complainerName: string;
  complainerEmail: string;
  complainerPhone: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  roomId?: string;
  roomName?: string;
  roomBuilding?: string;
  roomFloor?: string;
  roomNumber?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  attachments: string[];
  tags: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  attachments: string[];
  createdAt: Date;
  isInternal: boolean;
}

export interface NotificationSettings {
  userId: string;
  fcmToken?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByStatus: Record<TicketStatus, number>;
  technicianStats: Array<{
    technicianId: string;
    technicianName: string;
    resolvedCount: number;
    averageResolutionTime: number;
  }>;
}
