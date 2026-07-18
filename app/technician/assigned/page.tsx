'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTicketsByTechnician } from '@/lib/firestore-service';
import { Ticket, TicketStatus } from '@/lib/types';
import { TicketCard } from '@/components/ticket-card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

const statusFilters: TicketStatus[] = ['assigned', 'in_progress', 'resolved', 'closed'];

export default function TechnicianAssignedPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    async function fetchTickets() {
      if (!user?.uid) return;
      try {
        const data = await getTicketsByTechnician(user.uid);
        setTickets(data);
      } catch (error) {
        console.error('[v0] Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  const filteredTickets = activeFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === activeFilter);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Assigned Tickets</h2>
        <p className="text-gray-600 mt-2">Tickets assigned to you for resolution</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 text-lg">
            {activeFilter === 'all' ? 'No tickets assigned yet' : `No ${activeFilter} tickets`}
          </p>
          <p className="text-gray-600 mb-4">
            {activeFilter === 'all' 
              ? 'Check the queue for available tickets to claim'
              : 'Change the filter to see other tickets'}
          </p>
          <Link
            href="/technician"
            className="inline-block text-green-600 hover:text-green-700 font-semibold"
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
