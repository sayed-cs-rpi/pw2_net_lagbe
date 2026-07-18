'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRooms,
  getUsersByRole,
  countActiveTicketsForRoom,
} from '@/lib/firestore-service';
import { Room, User } from '@/lib/types';
import toast from 'react-hot-toast';
import { Building2, Pencil, Plus, Trash2, X } from 'lucide-react';

const emptyForm = {
  name: '',
  building: '',
  floor: '',
  roomNumber: '',
  notes: '',
  ownerId: '',
};

export default function AdminRoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [complainers, setComplainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  async function loadData() {
    try {
      const [roomsData, complainersData] = await Promise.all([
        getRooms(),
        getUsersByRole('complainer'),
      ]);
      setRooms(roomsData);
      setComplainers(complainersData);
    } catch (error) {
      console.error('[v0] Error loading rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setFormData({
      name: room.name,
      building: room.building,
      floor: room.floor,
      roomNumber: room.roomNumber,
      notes: room.notes || '',
      ownerId: room.ownerId,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.building.trim() || !formData.floor.trim() || !formData.roomNumber.trim()) {
      toast.error('Please fill in name, building, floor, and room number');
      return;
    }
    if (!formData.ownerId) {
      toast.error('Please select a complainer account');
      return;
    }

    const owner = complainers.find(c => c.uid === formData.ownerId);
    if (!owner) {
      toast.error('Selected account not found');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        building: formData.building.trim(),
        floor: formData.floor.trim(),
        roomNumber: formData.roomNumber.trim(),
        notes: formData.notes.trim() || undefined,
        ownerId: owner.uid,
        ownerName: owner.name,
        ownerEmail: owner.email,
      };

      if (editing) {
        await updateRoom(editing.id, payload);
        toast.success('Room updated');
      } else {
        await createRoom({
          ...payload,
          createdBy: user.uid,
        });
        toast.success('Room created');
      }

      setShowModal(false);
      setEditing(null);
      setFormData(emptyForm);
      await loadData();
    } catch (error) {
      console.error('[v0] Error saving room:', error);
      toast.error('Failed to save room');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(room: Room) {
    const active = await countActiveTicketsForRoom(room.id);
    if (active > 0) {
      toast.error(`Cannot delete: ${active} active ticket(s) use this room`);
      return;
    }
    if (!confirm(`Delete room "${room.name}"?`)) return;

    try {
      await deleteRoom(room.id);
      toast.success('Room deleted');
      setRooms(rooms.filter(r => r.id !== room.id));
    } catch (error) {
      console.error('[v0] Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rooms</h2>
          <p className="text-gray-600 mt-2">Create rooms and bind them to complainer accounts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 text-lg">No rooms yet</p>
          <p className="text-gray-600">Create a room and bind it to a complainer account.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Account</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{room.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {room.building} · Floor {room.floor} · #{room.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{room.ownerName}</div>
                    <div className="text-xs text-gray-500">{room.ownerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{room.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(room)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editing ? 'Edit Room' : 'Create Room'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Lab 204"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Building *</label>
                  <input
                    required
                    value={formData.building}
                    onChange={e => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Floor *</label>
                  <input
                    required
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Room # *</label>
                  <input
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Bind to account *</label>
                <select
                  required
                  value={formData.ownerId}
                  onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select complainer...</option>
                  {complainers.map(c => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                {complainers.length === 0 && (
                  <p className="text-sm text-amber-700 mt-1">No complainer accounts found. Create one under Users first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-20"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Room'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
