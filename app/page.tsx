'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Ticket, Users, BarChart3, LogOut } from 'lucide-react';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirectPath = user.role === 'complainer' ? '/complainer' : user.role === 'technician' ? '/technician' : '/admin';
      router.push(redirectPath);
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

  if (user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6" />
            <h1 className="text-lg font-semibold tracking-tight">Support Ticket</h1>
          </div>
          <nav className="flex gap-8 items-center">
            <Link href="/login" className="text-sm hover:text-foreground/70 transition">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        <section className="py-24 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-5xl font-semibold tracking-tight leading-tight">
              Support Ticket Management
            </h2>
            <p className="text-foreground/60 text-lg">
              Enterprise-grade ticket system with real-time updates, role-based access, and comprehensive analytics for modern support teams.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/signup" className="px-6 py-3 bg-foreground text-background font-medium hover:opacity-90 transition">
              Get Started
            </Link>
            <Link href="/login" className="px-6 py-3 border border-border hover:bg-secondary transition">
              Sign In
            </Link>
          </div>
        </section>

        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 p-8 border border-border bg-card">
            <div className="w-8 h-8 bg-foreground/10 rounded" />
            <h3 className="font-semibold">For Customers</h3>
            <p className="text-sm text-foreground/60">
              Create tickets, track progress in real-time, and message support staff directly.
            </p>
            <Link href="/signup" className="text-sm font-medium hover:underline">
              Create Account →
            </Link>
          </div>

          <div className="space-y-4 p-8 border border-border bg-card">
            <div className="w-8 h-8 bg-foreground/10 rounded" />
            <h3 className="font-semibold">For Technicians</h3>
            <p className="text-sm text-foreground/60">
              Manage shifts, claim tickets, and resolve issues with team collaboration.
            </p>
            <Link href="/signup" className="text-sm font-medium hover:underline">
              Join Team →
            </Link>
          </div>

          <div className="space-y-4 p-8 border border-border bg-card">
            <div className="w-8 h-8 bg-foreground/10 rounded" />
            <h3 className="font-semibold">For Administrators</h3>
            <p className="text-sm text-foreground/60">
              Monitor analytics, manage users, and ensure operational excellence.
            </p>
            <Link href="/signup" className="text-sm font-medium hover:underline">
              Admin Access →
            </Link>
          </div>
        </section>

        <section className="py-20 border-t border-border space-y-12">
          <h2 className="text-3xl font-semibold">Everything you need</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Real-Time Updates</h4>
              <p className="text-sm text-foreground/60">Instant notifications and live ticket status</p>
            </div>

            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Role-Based Access</h4>
              <p className="text-sm text-foreground/60">Separate dashboards for different user types</p>
            </div>

            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Shift Management</h4>
              <p className="text-sm text-foreground/60">Track technician schedules and availability</p>
            </div>

            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Priority System</h4>
              <p className="text-sm text-foreground/60">Manage critical and urgent issues first</p>
            </div>

            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Analytics Dashboard</h4>
              <p className="text-sm text-foreground/60">Comprehensive insights and metrics</p>
            </div>

            <div className="space-y-2">
              <div className="w-6 h-6 bg-foreground/10 rounded" />
              <h4 className="font-semibold">Messaging System</h4>
              <p className="text-sm text-foreground/60">Internal and external communication</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
