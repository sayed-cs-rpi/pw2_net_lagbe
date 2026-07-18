'use client';

import { Ticket, TicketPriority, TicketStatus } from '@/lib/types';
import { Badge } from './badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Clock, AlertCircle, MapPin } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

const priorityConfig: Record<TicketPriority, { color: string; label: string }> = {
  low: { color: 'outline', label: 'Low' },
  medium: { color: 'default', label: 'Medium' },
  high: { color: 'warning', label: 'High' },
  critical: { color: 'danger', label: 'Critical' },
};

const statusConfig: Record<TicketStatus, { color: string; label: string }> = {
  open: { color: 'primary', label: 'Open' },
  assigned: { color: 'default', label: 'Assigned' },
  in_progress: { color: 'default', label: 'In Progress' },
  resolved: { color: 'success', label: 'Resolved' },
  closed: { color: 'outline', label: 'Closed' },
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const priorityInfo = priorityConfig[ticket.priority];
  const statusInfo = statusConfig[ticket.status];
  const createdDate = format(ticket.createdAt, 'MMM dd, yyyy HH:mm');

  return (
    <div
      onClick={onClick}
      className="block p-5 border border-border bg-card hover:bg-secondary/30 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2 gap-3">
        <Link
          href={`/tickets/${ticket.id}`}
          className="text-base font-medium text-foreground hover:opacity-70 line-clamp-2 transition"
          onClick={e => e.stopPropagation()}
        >
          {ticket.title}
        </Link>
        <span className="text-xs text-foreground/40 whitespace-nowrap font-mono">
          #{ticket.id.substring(0, 8)}
        </span>
      </div>

      <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{ticket.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={priorityInfo.color as any}>
          <AlertCircle className="w-3 h-3 mr-1" />
          {priorityInfo.label}
        </Badge>
        <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>
        {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/50">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {createdDate}
        </div>
        {ticket.assignedToName && (
          <div>
            Assigned to: <span className="text-foreground/80">{ticket.assignedToName}</span>
          </div>
        )}
      </div>
      {ticket.roomName && (
        <div className="mt-2 flex items-center gap-1 text-xs text-foreground/50">
          <MapPin className="w-3 h-3" />
          <span>
            {ticket.roomName}
            {ticket.roomBuilding
              ? ` · ${ticket.roomBuilding}, Floor ${ticket.roomFloor}, #${ticket.roomNumber}`
              : ''}
          </span>
        </div>
      )}
    </div>
  );
}
