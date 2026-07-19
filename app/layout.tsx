import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { SetupCheck } from '@/components/setup-check'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { RealtimeProvider } from '@/components/realtime-provider'
import { ForegroundMessageHandler } from '@/components/foreground-message-handler'

export const metadata: Metadata = {
  title: 'Ticket Based Issue Management For RGPI',
  description: 'Enterprise support ticket management system',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ticket Based Issue Management For RGPI',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#FAF9F6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {/* <Analytics /> */}
        <SetupCheck />
        <ServiceWorkerRegistration />
        <AuthProvider>
          <RealtimeProvider>
            <ForegroundMessageHandler />
            {children}
          </RealtimeProvider>
          <Toaster position="top-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <footer className="bg-secondary/5 p-4 text-center text-xs text-foreground/50">
          <p className="mb-1">Copyright &copy; {new Date().getFullYear()} absyd. All Rights Reserved.</p>
          <p>A ticket-based issue management system for RGPI.</p>
        </footer>
      </body>
    </html>
  )
}
