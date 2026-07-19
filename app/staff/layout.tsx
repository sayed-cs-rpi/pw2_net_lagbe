'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Ticket, Home, Settings } from 'lucide-react';
import { AccessDenied, AppShell, LoadingScreen } from '@/components/app-shell';

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'staff') return <AccessDenied />;

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <AppShell
      title="Staff"
      icon={<Ticket className="w-5 h-5" />}
      userName={user.name}
      onSignOut={handleSignOut}
      nav={[
        { href: '/staff', label: 'Queue', icon: <Home className="w-4 h-4" /> },
        { href: '/staff/assigned', label: 'My Tickets', icon: <Ticket className="w-4 h-4" /> },
        { href: '/staff/shift', label: 'Shift', icon: <Settings className="w-4 h-4" /> },
      ]}
    >
      {children}
    </AppShell>
  );
}
