'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { ReactNode } from 'react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-foreground/20 border-t-foreground mx-auto" />
        <p className="mt-4 text-foreground/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-lg text-foreground/70">Access Denied</p>
        <Link href="/" className="text-sm text-foreground underline underline-offset-4 hover:opacity-70">
          Return Home
        </Link>
      </div>
    </div>
  );
}

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface AppShellProps {
  title: string;
  icon: ReactNode;
  nav: NavItem[];
  userName: string;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({ title, icon, nav, userName, onSignOut, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-foreground shrink-0">{icon}</span>
            <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4 flex-wrap justify-end">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition px-2 py-1"
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-border">
              <span className="text-sm text-foreground/60 hidden md:inline max-w-[10rem] truncate">
                {userName}
              </span>
              <button
                onClick={onSignOut}
                className="p-1.5 text-foreground/60 hover:text-foreground transition"
                title="Sign out"
                type="button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

/** Shared form control classes matching login */
export const fieldClass =
  'w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition';

export const primaryBtnClass =
  'bg-foreground text-background font-medium px-5 py-2.5 hover:opacity-90 transition disabled:opacity-50';

export const secondaryBtnClass =
  'border border-border text-foreground font-medium px-5 py-2.5 hover:bg-secondary/60 transition disabled:opacity-50';

export const cardClass = 'bg-card border border-border p-6 sm:p-8';

export const pageTitleClass = 'text-3xl font-semibold tracking-tight';
export const pageSubClass = 'text-foreground/60 text-sm mt-2';
