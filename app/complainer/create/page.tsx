'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createTicket, getRoomsByOwner } from '@/lib/firestore-service';
import { sendTicketCreatedNotification } from '@/lib/notifications';
import { Room, TicketPriority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const categories = [
  'Technical Issue',
  'Billing',
  'Account',
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

      const newTicket = {
        id: ticketId,
        complainerId: user.uid,
        complainerName: user.name,
        complainerEmail: user.email,
        complainerPhone: formData.phone,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'open' as const,
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
      };
      await sendTicketCreatedNotification(newTicket);

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
    <div className="max-w-2xl mx-auto">
      <Link href="/complainer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ticket</h1>
        <p className="text-gray-600 mb-8">Describe the issue you&apos;re experiencing</p>

        {!roomsLoading && rooms.length === 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-medium">No rooms on your account</p>
            <p className="text-sm mt-1">
              An admin must create a room and bind it to your account before you can open a ticket.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Room <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={roomsLoading || rooms.length === 0}
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {roomsLoading ? 'Loading rooms...' : 'Select a room...'}
              </option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} — {room.building}, Floor {room.floor}, #{room.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              placeholder="Provide detailed information about your issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || rooms.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
            <Link href="/complainer" className="flex-1">
              <button
                type="button"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
