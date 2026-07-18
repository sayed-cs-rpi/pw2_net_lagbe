'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket, LogOut, Home } from 'lucide-react';

export default function ComplainerLayout({
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'complainer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Access Denied</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
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
            <Ticket className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link href="/complainer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home className="w-5 h-5" />
              <span>My Tickets</span>
            </Link>
            <Link href="/complainer/create" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Ticket className="w-5 h-5" />
              <span>New Ticket</span>
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
