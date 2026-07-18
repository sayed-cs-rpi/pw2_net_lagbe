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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">All Tickets</h2>
        <p className="text-gray-600 mt-2">Manage and monitor all support tickets</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <input
          type="text"
          placeholder="Search by title, complainer name, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          <div>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-2 text-lg">No tickets found</p>
          <p className="text-gray-600">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredTickets.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{tickets.length}</span> tickets
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
