'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Ticket, Home } from 'lucide-react';
import { AccessDenied, AppShell, LoadingScreen } from '@/components/app-shell';

export default function ComplainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'complainer') return <AccessDenied />;

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <AppShell
      title="Support Center"
      icon={<Ticket className="w-5 h-5" />}
      userName={user.name}
      onSignOut={handleSignOut}
      nav={[
        { href: '/complainer', label: 'My Tickets', icon: <Home className="w-4 h-4" /> },
        { href: '/complainer/create', label: 'New Ticket', icon: <Ticket className="w-4 h-4" /> },
      ]}
    >
      {children}
    </AppShell>
  );
}
