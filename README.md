# Enterprise Support Ticket System

A modern, scalable support ticket management system built with Next.js 16, Firebase, and React. Designed for enterprises with complex support workflows requiring role-based access, real-time updates, and comprehensive analytics.

## Overview

The Support Ticket System is a three-role platform that streamlines customer support operations:

- **Complainers (Customers)**: Submit and track support tickets with real-time updates
- **Technicians**: Manage ticket queues, claim tickets, track shifts, and collaborate
- **Administrators**: Monitor system analytics, manage users, and ensure operational efficiency

## Key Features

### For Customers (Complainers)
- ✅ Create support tickets with priority levels and categories
- ✅ Track ticket status in real-time
- ✅ Direct messaging with assigned technicians
- ✅ View ticket history and communication
- ✅ Receive notifications on ticket updates

### For Technicians
- ✅ Browse and claim unassigned tickets from queue
- ✅ Manage shift schedules (start/end work sessions)
- ✅ View assigned tickets with filtering by status
- ✅ Add internal notes and updates to tickets
- ✅ Real-time ticket routing based on availability
- ✅ Track personal and team performance metrics

### For Administrators
- ✅ System-wide analytics dashboard
- ✅ View and manage all tickets with advanced filtering
- ✅ User management by role
- ✅ Performance monitoring and insights
- ✅ System configuration and settings

### Core Platform Features
- 🔐 **Authentication**: Email/password with role-based access control
- 📱 **Real-Time Updates**: Firebase Firestore listeners for instant data sync
- 🔔 **Notifications**: Push notifications via Firebase Cloud Messaging
- 📊 **Analytics**: Comprehensive metrics and performance tracking
- 🌓 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first design that works on all devices
- ♿ **Accessible**: WCAG 2.1 compliant with keyboard navigation

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **Firebase** | Authentication, Firestore database, Cloud Messaging |
| **React 19** | UI framework with latest features |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | High-quality component library |
| **TypeScript** | Type-safe JavaScript |
| **Zustand** | State management (optional) |
| **SWR** | Data fetching and caching |
| **Zod** | Schema validation |

## Project Structure

```
.
├── app/
│   ├── layout.tsx                 # Root layout with auth provider
│   ├── page.tsx                   # Landing page
│   ├── login/                      # Authentication pages
│   ├── signup/
│   ├── complainer/                # Customer dashboard
│   │   ├── page.tsx              # Ticket list
│   │   ├── create/               # Create ticket form
│   │   └── [ticketId]/           # Ticket detail
│   ├── technician/               # Technician dashboard
│   │   ├── page.tsx              # Ticket queue
│   │   ├── assigned/             # My tickets
│   │   └── shift/                # Shift management
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Analytics
│   │   ├── tickets/              # All tickets
│   │   └── users/                # User management
│   └── tickets/
│       └── [ticketId]/           # Shared ticket detail
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   ├── types.ts                  # TypeScript types
│   ├── auth-context.tsx          # Auth context provider
│   ├── auth-hooks.ts             # Auth hooks
│   └── firestore-service.ts      # Database service layer
├── components/
│   ├── ticket-card.tsx           # Ticket card component
│   ├── status-badge.tsx          # Status indicators
│   ├── badge.tsx                 # Badge component
│   └── setup-check.tsx           # Firebase setup checker
├── public/                        # Static assets
└── SETUP.md                      # Detailed setup guide
```

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Firebase project created at [firebase.google.com](https://firebase.google.com)
- Basic knowledge of Next.js and React

### Installation

1. **Clone or download the project**
   ```bash
   cd support-ticket-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
   - Copy your Firebase configuration
   - Create `.env.local` and add your Firebase keys (see `.env.local.example`)

4. **Configure Firebase Database**
   - Follow the detailed setup in `SETUP.md` to:
     - Create Firestore collections (`users`, `tickets`, `messages`, `shifts`)
     - Set up security rules
     - Enable authentication methods
     - Configure Cloud Messaging (optional)

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Sign up with different roles to test

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key  # Optional, for notifications
```

See `.env.local.example` for reference.

## Detailed Setup Guide

For comprehensive setup instructions, security rules, database schema, and deployment guidance, see [SETUP.md](./SETUP.md).

## Usage Guide

### For Customers
1. Sign up as a "Complainer"
2. Go to `/complainer/create` to submit a new ticket
3. View your tickets at `/complainer` and track status
4. Click on a ticket to view details and message technicians

### For Technicians
1. Sign up as a "Technician"
2. Go to `/technician` to see the queue of unassigned tickets
3. Click "Claim" to assign a ticket to yourself
4. Go to `/technician/assigned` to view your active tickets
5. Update ticket status and add notes
6. Manage your shift at `/technician/shift`

### For Administrators
1. Sign up as an "Admin"
2. View system analytics at `/admin`
3. Manage all tickets at `/admin/tickets` with advanced filtering
4. View and manage users at `/admin/users`
5. Configure system settings (feature coming soon)

## API Routes

The application uses Firebase Firestore as the database. Key operations:

- **Authentication**: Firebase Auth (handled by auth context)
- **Tickets**: Real-time listeners on Firestore collection
- **Messages**: Threaded messaging with real-time sync
- **Shifts**: Technician shift tracking and availability
- **Users**: User profiles with role management

See `lib/firestore-service.ts` for Firestore operations.

## Database Schema

### Collections

**users**
```typescript
{
  uid: string;
  email: string;
  name: string;
  role: 'complainer' | 'technician' | 'admin';
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Technician fields
  isOnShift?: boolean;
  currentShiftStart?: Timestamp;
}
```

**tickets**
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  createdById: string;
  assignedToId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessageAt?: Timestamp;
}
```

**messages**
```typescript
{
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

See `SETUP.md` for complete schema documentation.

## Security

- 🔐 Firebase Authentication with email/password
- 🛡️ Row-level security via Firestore security rules
- 🔒 Private environment variables for sensitive config
- ✅ Input validation with Zod schemas
- 🚫 XSS protection via React's built-in escaping

See `SETUP.md` for security rules configuration.

## Customization

### Adding Custom Ticket Categories
Edit `lib/types.ts` and update the `Ticket` type to include your categories.

### Changing Status Workflow
Update the status options in:
- `lib/types.ts` - Status type definition
- Components using `StatusBadge` - Add new status colors
- Firestore rules - Validate status transitions

### Styling
- Update colors in `app/globals.css` using CSS custom properties
- Modify Tailwind configuration if needed
- See `Design Guidelines` for color system details

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy automatically on push

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... add all other variables
vercel deploy
```

### Deploy to Other Platforms

The application can be deployed to any platform supporting Next.js:
- AWS Amplify
- Netlify
- Self-hosted server (Node.js)
- Docker container

See Next.js [deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Troubleshooting

### Firebase Configuration Error
**Problem**: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Ensure all environment variables are correctly set in `.env.local` and Vercel project settings

### Messages Not Updating in Real-Time
**Problem**: Ticket messages show but don't auto-refresh
**Solution**: Check Firestore security rules and ensure message listener is active in the component

### Users Can't See Assigned Tickets
**Problem**: Technician doesn't see their assigned tickets
**Solution**: Verify the Firestore rules allow reading tickets by `assignedToId` and check the query in `firestore-service.ts`

## Contributing

To contribute to this project:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and test thoroughly
3. Submit a pull request with a clear description

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Check the [SETUP.md](./SETUP.md) for detailed configuration
- Review the code comments for implementation details
- Consult Firebase documentation at [firebase.google.com/docs](https://firebase.google.com/docs)

## Roadmap

- [ ] Email notifications for ticket updates
- [ ] SLA tracking and alerts
- [ ] Knowledge base / FAQ integration
- [ ] Customer satisfaction surveys
- [ ] Advanced reporting and exports
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Next.js, Firebase, and React**
