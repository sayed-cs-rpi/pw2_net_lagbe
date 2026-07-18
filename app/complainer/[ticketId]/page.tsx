'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTicket, getTicketMessages, addTicketMessage, updateTicket } from '@/lib/firestore-service';
import { sendTicketMessageNotification } from '@/lib/notifications';
import { Ticket, TicketMessage } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/status-badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const ticketData = await getTicket(params?.ticketId);
        if (ticketData && ticketData.complainerId === user?.uid) {
          setTicket(ticketData);
          const messagesData = await getTicketMessages(params?.ticketId);
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
  }, [params?.ticketId, user?.uid]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !ticket || !messageText.trim()) return;

    setSending(true);
    try {
      await addTicketMessage({
        ticketId: ticket.id,
        userId: user.uid,
        userName: user.name,
        userRole: 'complainer',
        message: messageText,
        attachments: [],
        isInternal: false,
      });

      // Send notification to the assigned technician
      if (ticket.assignedToId) {
        await sendTicketMessageNotification(ticket, user.name, ticket.assignedToId);
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
        <Link href="/complainer" className="text-blue-600 hover:text-blue-700">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/complainer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
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
          {ticket.assignedToName && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Assigned To</p>
              <p className="text-lg font-medium text-gray-900">{ticket.assignedToName}</p>
            </div>
          )}
          {ticket.resolvedAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-lg font-medium text-gray-900">{format(ticket.resolvedAt, 'MMM dd, yyyy HH:mm')}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
        </div>
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
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{message.userName}</p>
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
  );
}
