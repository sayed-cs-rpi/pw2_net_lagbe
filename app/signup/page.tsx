'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp } from '@/lib/auth-hooks';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading } = useSignUp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'complainer' as UserRole,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name, formData.role);
      router.push(formData.role === 'complainer' ? '/complainer' : `/technician`);
    } catch (error) {
      console.error('[v0] Sign up error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link href="/" className="text-sm text-foreground/60 hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold mt-6 tracking-tight">Create Account</h1>
          <p className="text-foreground/60 text-sm mt-2">Join the Support Ticket System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              placeholder="John Doe"
            />
          </div>

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
              Role
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-3 border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            >
              <option value="complainer">Ticket Creator (Complainer)</option>
              <option value="technician">Support Technician</option>
              <option value="admin">Administrator</option>
            </select>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-medium py-3 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm text-foreground/60">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
