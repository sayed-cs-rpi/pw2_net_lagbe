'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@/lib/auth-hooks';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { signIn, loading } = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      const redirectPath = user.role === 'complainer' ? '/complainer' : user.role === 'technician' ? '/technician' : '/admin';
      router.push(redirectPath);
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const authUser = await signIn(formData.email, formData.password);
      // Auth context will handle fetching user data and redirecting
    } catch (error) {
      console.error('[v0] Sign in error:', error);
    }
  }

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
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link href="/" className="text-sm text-foreground/60 hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold mt-6 tracking-tight">Sign In</h1>
          <p className="text-foreground/60 text-sm mt-2">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-medium py-3 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-foreground/60">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
