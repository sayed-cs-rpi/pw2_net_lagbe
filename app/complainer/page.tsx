'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTicketsByComplainer } from '@/lib/firestore-service';
import { Ticket } from '@/lib/types';
import { TicketCard } from '@/components/ticket-card';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';

export default function ComplainerPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!user?.uid) return;
      try {
        const data = await getTicketsByComplainer(user.uid);
        setTickets(data);
      } catch (error) {
        console.error('[v0] Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Tickets</h2>
          <p className="text-gray-600 mt-2">Track and manage your support requests</p>
        </div>
        <Link
          href="/complainer/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You haven&apos;t created any tickets yet.</p>
          <Link
            href="/complainer/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Ticket
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{tickets.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {tickets.filter(t => t.status === 'open').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
