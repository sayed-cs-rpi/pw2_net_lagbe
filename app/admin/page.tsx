'use client';

import { useEffect, useState } from 'react';
import { getTicketStats, getTickets } from '@/lib/firestore-service';
import { Ticket } from '@/lib/types';
import { Ticket as TicketIcon, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await getTicketStats();
        setStats({
          total: statsData.total,
          open: statsData.open,
          assigned: statsData.assigned,
          inProgress: statsData.inProgress,
          resolved: statsData.resolved,
          closed: statsData.closed,
        });

        const recentTickets = await getTickets([orderBy('createdAt', 'desc')]);
        setTickets(recentTickets.slice(0, 10));
      } catch (error) {
        console.error('[v0] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: TicketIcon, color: 'bg-blue-50' },
    { label: 'Open', value: stats.open, icon: AlertCircle, color: 'bg-red-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-yellow-50' },
    { label: 'Resolved', value: stats.resolved + stats.closed, icon: CheckCircle, color: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`${card.color} rounded-lg border border-gray-200 p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                {/* <Icon className="w-8 h-8 text-gray-400" /> */}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Tickets</h3>
        
        {tickets.length === 0 ? (
          <p className="text-gray-600">No tickets found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Complainer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-blue-600">{ticket.title.substring(0, 40)}...</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{ticket.complainerName}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.status === 'resolved' || ticket.status === 'closed'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'open'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.priority === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
