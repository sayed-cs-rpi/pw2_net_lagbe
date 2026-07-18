'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Ticket, Users, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Access Denied</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link href="/admin/tickets" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Ticket className="w-5 h-5" />
              <span>Tickets</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">{user.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
