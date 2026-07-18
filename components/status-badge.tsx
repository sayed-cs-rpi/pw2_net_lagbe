'use client';

import { TicketStatus, TicketPriority } from '@/lib/types';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: TicketStatus;
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const statusConfig: Record<TicketStatus, string> = {
  open: 'primary',
  assigned: 'default',
  in_progress: 'default',
  resolved: 'success',
  closed: 'outline',
};

const priorityConfig: Record<TicketPriority, string> = {
  low: 'outline',
  medium: 'default',
  high: 'warning',
  critical: 'danger',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusConfig[status];
  const label = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  
  return <Badge variant={variant as any}>{label}</Badge>;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variant = priorityConfig[priority];
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);
  
  return <Badge variant={variant as any}>{label}</Badge>;
}
