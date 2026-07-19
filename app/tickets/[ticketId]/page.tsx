'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  subscribeToTicket,
  subscribeToTicketMessages,
  addTicketMessage,
  updateTicket,
  assignTicket,
  getUsersByRole,
} from '@/lib/firestore-service';
import { Ticket, TicketMessage, TicketStatus, User } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/status-badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [ticketId, setTicketId] = useState<string>('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolveParams() {
      const resolved = await Promise.resolve(params);
      if (!cancelled) setTicketId(resolved.ticketId);
    }
    resolveParams();
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!ticketId || !user?.uid) return;

    const unsubTicket = subscribeToTicket(ticketId, ticketData => {
      if (ticketData) {
        const isComplainer = ticketData.complainerId === user.uid;
        const isTechnician = ticketData.assignedToId === user.uid;
        const isAdmin = user.role === 'admin';

        if (!isComplainer && !isTechnician && !isAdmin) {
          toast.error('You do not have access to this ticket');
          router.push('/');
          return;
        }

        setTicket(ticketData);
        setSelectedTechId(ticketData.assignedToId || '');
        setLoading(false);
      } else {
        setTicket(null);
        setLoading(false);
      }
    });

    const unsubMessages = subscribeToTicketMessages(ticketId, setMessages);

    if (user.role === 'admin') {
      Promise.all([
        getUsersByRole('technician'),
        getUsersByRole('staff'),
      ]).then(([technicians, staff]) => {
        setTechnicians([...technicians, ...staff]);
      });
    }

    return () => {
      unsubTicket();
      unsubMessages();
    };
  }, [ticketId, user?.uid, user?.role, router]);

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

      setMessageText('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('[v0] Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || !user) return;

    try {
      await updateTicket(ticket.id, { status: newStatus });
      toast.success('Status updated!');
    } catch (error) {
      console.error('[v0] Error updating status:', error);
      toast.error('Failed to update status');
    }
  }

  async function handleAdminAssign() {
    if (!ticket || !user || user.role !== 'admin') return;
    const tech = technicians.find(t => t.uid === selectedTechId);
    if (!tech) {
      toast.error('Please select a technician');
      return;
    }

    setAssigning(true);
    try {
      await assignTicket(ticket.id, tech.uid, tech.name);
      toast.success(`Assigned to ${tech.name}`);
    } catch (error) {
      console.error('[v0] Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground/20 border-t-foreground mx-auto"></div>
        <p className="mt-4 text-foreground/60">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-card border border-border p-8 text-center">
        <p className="text-foreground/60 mb-4">Ticket not found</p>
        <Link href="/" className="text-foreground hover:opacity-70">
          Return Home
        </Link>
      </div>
    );
  }

  const canUpdateStatus =
    (user?.role === 'technician' && ticket.assignedToId === user.uid) ||
    user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{ticket.title}</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="bg-card border border-border p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-foreground/60">#{ticket.id.substring(0, 8)}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Category</p>
              <p className="text-lg font-medium text-foreground">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Created</p>
              <p className="text-lg font-medium text-foreground">
                {format(ticket.createdAt, 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Complainer</p>
              <p className="text-lg font-medium text-foreground">{ticket.complainerName}</p>
              <p className="text-sm text-foreground/60">{ticket.complainerEmail}</p>
            </div>
            {ticket.assignedToName && (
              <div>
                <p className="text-sm text-foreground/60 mb-1">Assigned To</p>
                <p className="text-lg font-medium text-foreground">{ticket.assignedToName}</p>
              </div>
            )}
            {ticket.roomName && (
              <div className="md:col-span-2">
                <p className="text-sm text-foreground/60 mb-1">Room</p>
                <p className="text-lg font-medium text-foreground">{ticket.roomName}</p>
                <p className="text-sm text-foreground/60">
                  {ticket.roomBuilding} · Floor {ticket.roomFloor} · #{ticket.roomNumber}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
            <p className="text-foreground/60 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {user?.role === 'admin' && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {ticket.assignedToId ? 'Reassign Technician' : 'Assign Technician'}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select technician...</option>
                  {technicians.map(tech => (
                    <option key={tech.uid} value={tech.uid}>
                      {tech.name} ({tech.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAdminAssign}
                  disabled={assigning || !selectedTechId}
                  className="bg-foreground text-background hover:opacity-90 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : ticket.assignedToId ? 'Reassign' : 'Assign'}
                </button>
              </div>
              {technicians.length === 0 && (
                <p className="text-sm text-foreground/70 mt-2">No technician accounts found.</p>
              )}
            </div>
          )}

          {canUpdateStatus && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {(
                  ['open', 'assigned', 'in_progress', 'resolved', 'closed'] as TicketStatus[]
                ).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      ticket.status === status
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() +
                      status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Messages ({messages.length})</h3>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map(message => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.userId === user?.uid
                    ? 'bg-secondary/40 border border-border ml-8'
                    : 'bg-secondary/40 border border-border mr-8'
                } ${message.isInternal ? 'border-l-4 border-l-foreground/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {message.userName}
                      {message.isInternal && (
                        <span className="ml-2 text-xs bg-secondary text-foreground/70 px-2 py-1 rounded">
                          Internal
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-foreground/50">{message.userRole}</p>
                  </div>
                  <p className="text-xs text-foreground/60">
                    {format(message.createdAt, 'MMM dd, HH:mm')}
                  </p>
                </div>
                <p className="text-foreground/80">{message.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="bg-foreground text-background hover:opacity-90 font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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
