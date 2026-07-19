'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createTicket, getRoomsByOwner } from '@/lib/firestore-service';
import { sendTicketCreatedNotification } from '@/lib/notifications';
import { Room, TicketPriority } from '@/lib/types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
  cardClass,
  pageTitleClass,
  pageSubClass,
} from '@/components/app-shell';

const categories = [
  'Technical Issue',
  'Student Issue',
  'Account',
  'Finance',
  'Feature Request',
  'Other',
];

export default function CreateTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: 'medium' as TicketPriority,
    phone: '',
    roomId: '',
  });

  useEffect(() => {
    async function loadRooms() {
      if (!user?.uid) return;
      try {
        const data = await getRoomsByOwner(user.uid);
        setRooms(data);
        if (data.length === 1) {
          setFormData(prev => ({ ...prev, roomId: data[0].id }));
        }
      } catch (error) {
        console.error('[v0] Error loading rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setRoomsLoading(false);
      }
    }
    loadRooms();
  }, [user?.uid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (rooms.length === 0) {
      toast.error('No rooms linked to your account. Please contact an admin.');
      return;
    }
    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    setLoading(true);
    try {
      const ticketId = await createTicket({
        complainerId: user.uid,
        complainerName: user.name,
        complainerEmail: user.email,
        complainerPhone: formData.phone,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'open',
        category: formData.category,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        roomBuilding: selectedRoom.building,
        roomFloor: selectedRoom.floor,
        roomNumber: selectedRoom.roomNumber,
        attachments: [],
        tags: [],
      });

      await sendTicketCreatedNotification({
        id: ticketId,
        complainerId: user.uid,
        complainerName: user.name,
        complainerEmail: user.email,
        complainerPhone: formData.phone,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'open',
        category: formData.category,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        roomBuilding: selectedRoom.building,
        roomFloor: selectedRoom.floor,
        roomNumber: selectedRoom.roomNumber,
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Ticket created successfully!');
      router.push(`/complainer/${ticketId}`);
    } catch (error) {
      console.error('[v0] Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/complainer"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      <div className={cardClass}>
        <h1 className={pageTitleClass}>Create Ticket</h1>
        <p className={pageSubClass}>Describe the issue you&apos;re experiencing</p>

        {!roomsLoading && rooms.length === 0 && (
          <div className="mt-6 border border-border bg-secondary/40 p-4 text-sm">
            <p className="font-medium">No rooms on your account</p>
            <p className="text-foreground/60 mt-1">
              An admin must create a room and bind it to your account before you can open a ticket.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Room <span className="text-destructive">*</span>
            </label>
            <select
              required
              disabled={roomsLoading || rooms.length === 0}
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              className={`${fieldClass} disabled:opacity-50`}
            >
              <option value="">{roomsLoading ? 'Loading rooms...' : 'Select a room...'}</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} — {room.building}, Floor {room.floor}, #{room.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={fieldClass}
              placeholder="Brief summary of your issue"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={`${fieldClass} h-32 resize-y`}
              placeholder="Provide detailed information about your issue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className={fieldClass}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Priority</label>
              <select
                value={formData.priority}
                onChange={e =>
                  setFormData({ ...formData, priority: e.target.value as TicketPriority })
                }
                className={fieldClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={fieldClass}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || rooms.length === 0}
              className={`flex-1 ${primaryBtnClass}`}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
            <Link href="/complainer" className={`flex-1 text-center ${secondaryBtnClass}`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
