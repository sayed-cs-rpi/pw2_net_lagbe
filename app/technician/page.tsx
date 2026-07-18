'use client';

import { TicketCard } from '@/components/ticket-card';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getUnassignedTickets, assignTicket } from '@/lib/firestore-service';
import { sendTicketAssignmentNotification } from '@/lib/notifications';
import { Ticket } from '@/lib/types';

export default function TechnicianQueuePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await getUnassignedTickets();
        setTickets(data);
      } catch (error) {
        console.error('[v0] Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  async function handleAssignTicket(ticket: Ticket) {
    if (!user) return;
    if (ticket.assignedToId) {
      toast.error('Ticket already assigned');
      return;
    }

    setAssigning(ticket.id);
    try {
      await assignTicket(ticket.id, user.uid, user.name);

      const updatedTicket = {
        ...ticket,
        assignedToId: user.uid,
        assignedToName: user.name,
        status: 'assigned' as const,
      };

      await sendTicketAssignmentNotification(updatedTicket);

      setTickets(tickets.filter(t => t.id !== ticket.id));
      toast.success(`Ticket #${ticket.id.substring(0, 8)} assigned to you!`);
    } catch (error) {
      console.error('[v0] Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    } finally {
      setAssigning(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ticket queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Ticket Queue</h2>
        <p className="text-gray-600 mt-2">Available tickets waiting for assignment</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 text-lg">No tickets in queue</p>
          <p className="text-gray-600">All tickets are currently assigned.</p>
          <Link
            href="/technician/assigned"
            className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold"
          >
            View Your Assigned Tickets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{tickets.length}</span> unassigned tickets
            </p>
          </div>

          {tickets.map(ticket => (
            <div key={ticket.id} className="relative">
              <TicketCard ticket={ticket} />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => handleAssignTicket(ticket)}
                  disabled={assigning === ticket.id}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {assigning === ticket.id ? 'Assigning...' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Tip</p>
          <p className="text-sm text-blue-800">
            Click &quot;Claim&quot; to assign a ticket to yourself. It will appear in your assigned tickets list.
          </p>
        </div>
      </div>
    </div>
  );
}
