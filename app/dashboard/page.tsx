'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import router from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
 
  console.log(user, authLoading);
  useEffect(() => {
    if (user && !authLoading) {
      let redirectPath;

      if (user.role === 'complainer') {
        redirectPath = '/complainer';
      } else if (user.role === 'technician') {
        redirectPath = '/technician';
      } else if (user.role === 'staff') {
        redirectPath = '/staff';
      } else {
        redirectPath = '/admin';
      }

      router.push(redirectPath);
    }
  }, [user, authLoading, router]);

 
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground/20 border-t-foreground mx-auto"></div>
          <p className="mt-4 text-foreground/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6"> 
    Redirecting .....
    </div>
  );
}
