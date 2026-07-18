'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTicket, getTicketMessages, addTicketMessage, updateTicket } from '@/lib/firestore-service';
import { sendTicketStatusNotification, sendTicketMessageNotification } from '@/lib/notifications';
import { Ticket, TicketMessage } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/status-badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const ticketData = await getTicket(params.ticketId);
        if (ticketData) {
          const isComplainer = ticketData.complainerId === user?.uid;
          const isTechnician = ticketData.assignedToId === user?.uid;
          const isAdmin = user?.role === 'admin';

          if (!isComplainer && !isTechnician && !isAdmin) {
            toast.error('You do not have access to this ticket');
            router.push('/');
            return;
          }

          setTicket(ticketData);
          const messagesData = await getTicketMessages(params.ticketId);
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('[v0] Error loading ticket:', error);
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadTicket();
    }
  }, [params.ticketId, user?.uid, user?.role, router]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !ticket || !messageText.trim()) return;

    setSending(true);
    try {
      await addTicketMessage({
        ticketId: ticket.id,
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        message: messageText,
        attachments: [],
        isInternal: user.role === 'technician' || user.role === 'admin',
      });

      // Send notification to the other party
      let recipientId: string | undefined;
      if (user.role === 'complainer' && ticket.assignedToId) {
        recipientId = ticket.assignedToId;
      } else if (user.role !== 'complainer' && ticket.complainerId !== user.uid) {
        recipientId = ticket.complainerId;
      }

      if (recipientId) {
        await sendTicketMessageNotification(ticket, user.name, recipientId);
      }

      setMessageText('');
      const updatedMessages = await getTicketMessages(ticket.id);
      setMessages(updatedMessages);
      toast.success('Message sent!');
    } catch (error) {
      console.error('[v0] Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!ticket || !user) return;

    const previousStatus = ticket.status;
    
    try {
      const updatedTicket = { ...ticket, status: newStatus as any };
      await updateTicket(ticket.id, updatedTicket);

      // Send notification about status change
      await sendTicketStatusNotification(updatedTicket, previousStatus);

      setTicket(updatedTicket);
      toast.success('Status updated!');
    } catch (error) {
      console.error('[v0] Error updating status:', error);
      toast.error('Failed to update status');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600 mb-4">Ticket not found</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700">
          Return Home
        </Link>
      </div>
    );
  }

  const canUpdateStatus = user?.role === 'technician' && ticket.assignedToId === user.uid || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-gray-600">#{ticket.id.substring(0, 8)}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-medium text-gray-900">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-lg font-medium text-gray-900">{format(ticket.createdAt, 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Complainer</p>
              <p className="text-lg font-medium text-gray-900">{ticket.complainerName}</p>
              <p className="text-sm text-gray-600">{ticket.complainerEmail}</p>
            </div>
            {ticket.assignedToName && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                <p className="text-lg font-medium text-gray-900">{ticket.assignedToName}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {canUpdateStatus && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['open', 'assigned', 'in_progress', 'resolved', 'closed'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      ticket.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Messages ({messages.length})</h3>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map(message => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.userId === user?.uid
                    ? 'bg-blue-50 border border-blue-200 ml-8'
                    : 'bg-gray-50 border border-gray-200 mr-8'
                } ${message.isInternal ? 'border-l-4 border-l-orange-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {message.userName}
                      {message.isInternal && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Internal</span>}
                    </p>
                    <p className="text-xs text-gray-500">{message.userRole}</p>
                  </div>
                  <p className="text-xs text-gray-600">{format(message.createdAt, 'MMM dd, HH:mm')}</p>
                </div>
                <p className="text-gray-700">{message.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
