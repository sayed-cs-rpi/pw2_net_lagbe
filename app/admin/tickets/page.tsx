'use client';

import { useEffect, useState } from 'react';
import { getTickets } from '@/lib/firestore-service';
import { Ticket, TicketStatus, TicketPriority } from '@/lib/types';
import { TicketCard } from '@/components/ticket-card';
import Link from 'next/link';
import { orderBy } from 'firebase/firestore';

const statusFilters: TicketStatus[] = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
const priorityFilters: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await getTickets([orderBy('createdAt', 'desc')]);
        setTickets(data);
      } catch (error) {
        console.error('[v0] Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.complainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.complainerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground/20 border-t-foreground mx-auto"></div>
        <p className="mt-4 text-foreground/60">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">All Tickets</h2>
        <p className="text-foreground/60 mt-2">Manage and monitor all support tickets</p>
      </div>

      <div className="bg-card border border-border p-6 space-y-4">
        <input
          type="text"
          placeholder="Search by title, complainer name, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          <div>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground/80 hover:bg-secondary'
              }`}
            >
              All Status
            </button>
            {statusFilters.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground/80 hover:bg-secondary'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div>
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                priorityFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground/80 hover:bg-secondary'
              }`}
            >
              All Priority
            </button>
            {priorityFilters.map(priority => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  priorityFilter === priority
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground/80 hover:bg-secondary'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <p className="text-foreground/60 mb-2 text-lg">No tickets found</p>
          <p className="text-foreground/60">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-foreground/60">
            Showing <span className="font-semibold text-foreground">{filteredTickets.length}</span> of{' '}
            <span className="font-semibold text-foreground">{tickets.length}</span> tickets
          </p>
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
