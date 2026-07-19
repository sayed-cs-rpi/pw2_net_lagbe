'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToTickets } from '@/lib/firestore-service';
import { Ticket, TicketStatus } from '@/lib/types';
import { TicketCard } from '@/components/ticket-card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { orderBy, where } from 'firebase/firestore';

const statusFilters: TicketStatus[] = ['assigned', 'in_progress', 'resolved', 'closed'];

export default function TechnicianAssignedPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToTickets(
      [where('assignedToId', '==', user.uid), orderBy('createdAt', 'desc')],
      data => {
        setTickets(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const filteredTickets = activeFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === activeFilter);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground/20 border-t-foreground mx-auto"></div>
        <p className="mt-4 text-foreground/60">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">My Assigned Tickets</h2>
        <p className="text-foreground/60 mt-2">Tickets assigned to you for resolution</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-foreground/80 hover:bg-secondary/40'
          }`}
        >
          All ({tickets.length})
        </button>
        {statusFilters.map(status => {
          const count = tickets.filter(t => t.status === status).length;
          const label = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === status
                  ? 'bg-foreground text-background'
                  : 'bg-card border border-border text-foreground/80 hover:bg-secondary/40'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <AlertCircle className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
          <p className="text-foreground/60 mb-2 text-lg">
            {activeFilter === 'all' ? 'No tickets assigned yet' : `No ${activeFilter} tickets`}
          </p>
          <p className="text-foreground/60 mb-4">
            {activeFilter === 'all' 
              ? 'Check the queue for available tickets to claim'
              : 'Change the filter to see other tickets'}
          </p>
          <Link
            href="/technician"
            className="inline-block text-foreground hover:opacity-70 font-semibold"
          >
            Back to Queue
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <TicketCard ticket={ticket} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
