'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createTicket } from '@/lib/firestore-service';
import { sendTicketCreatedNotification } from '@/lib/notifications';
import { TicketPriority } from '@/lib/types';
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: 'medium' as TicketPriority,
    phone: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
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
        attachments: [],
        tags: [],
      });

      // Send notification to admins about new ticket
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

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
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
              disabled={loading}
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
