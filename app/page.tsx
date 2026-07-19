'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Page() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const redirectPath = user.role === 'complainer' ? '/complainer' : user.role === 'technician' ? '/technician' : user.role === 'staff' ? '/staff' : '/admin';
        router.push(redirectPath);
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground/20 border-t-foreground mx-auto"></div>
          <p className="mt-4 text-foreground/60 text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return null;
}
