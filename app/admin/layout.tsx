'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { BarChart3, Ticket, Users, Building2 } from 'lucide-react';
import { AccessDenied, AppShell, LoadingScreen } from '@/components/app-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'admin') return <AccessDenied />;

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <AppShell
      title="Admin"
      icon={<BarChart3 className="w-5 h-5" />}
      userName={user.name}
      onSignOut={handleSignOut}
      nav={[
        { href: '/admin', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { href: '/admin/tickets', label: 'Tickets', icon: <Ticket className="w-4 h-4" /> },
        { href: '/admin/rooms', label: 'Rooms', icon: <Building2 className="w-4 h-4" /> },
        { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      ]}
    >
      {children}
    </AppShell>
  );
}
