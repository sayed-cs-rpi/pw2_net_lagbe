# Support Ticket System - Setup Guide

## Overview

This is a comprehensive **Enterprise Support Ticket Management System** built with:
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Messaging)
- **Features**: Real-time updates, role-based access (Complainer, Technician, Admin), PWA support

## Prerequisites

1. Node.js 18+ and pnpm
2. A Firebase project (free tier works)
3. Basic knowledge of Firebase console

## Quick Start

### 1. Setup Firebase Project

Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.

#### Enable Services:
- **Authentication** → Enable Email/Password auth
- **Firestore Database** → Create database (Start in test mode for development)
- **Cloud Messaging** → Get Web Push Certificate (for PWA notifications)

### 2. Get Firebase Credentials

In Firebase Console → Project Settings → General tab:
- Copy your config values
- Go to Cloud Messaging tab → Get Web Push Certificate (VAPID key)

### 3. Set Environment Variables

Create `.env.local` in the project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 4. Install & Run

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

## User Roles & Features

### 1. **Complainer** (Customer/Support Requester)
- **Dashboard**: View all their submitted tickets
- **Create Ticket**: File new support requests with priority & category
- **Track Status**: Real-time updates on ticket progress
- **Messaging**: Direct communication with assigned technician
- **Route**: `/complainer`

### 2. **Technician** (Support Agent)
- **Ticket Queue**: Browse unassigned tickets sorted by priority
- **Claim Tickets**: Pick up tickets to work on
- **Assigned Tickets**: Manage tickets assigned to them
- **Shift Management**: Start/end work shifts
- **Internal Notes**: Add internal comments (not visible to complainers)
- **Route**: `/technician`

### 3. **Admin** (System Manager)
- **Analytics Dashboard**: View system statistics and trends
- **All Tickets**: Search and filter all tickets in the system
- **User Management**: View user directory by role
- **Ticket Monitoring**: Track ticket flow and technician performance
- **Routes**: `/admin`

## Database Schema

### Collections:

**users**
```
├── uid (Document ID)
├── email
├── name
├── role: 'complainer' | 'technician' | 'admin'
├── avatar
├── createdAt
└── updatedAt
```

**tickets**
```
├── id
├── complainerId
├── complainerName
├── complainerEmail
├── complainerPhone
├── title
├── description
├── priority: 'low' | 'medium' | 'high' | 'critical'
├── status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
├── category
├── assignedToId
├── assignedToName
├── attachments: []
├── tags: []
├── createdAt
├── updatedAt
└── resolvedAt
```

**tickets/{ticketId}/messages** (Subcollection)
```
├── id
├── userId
├── userName
├── userRole
├── message
├── attachments: []
├── isInternal: boolean
└── createdAt
```

**shifts**
```
├── id
├── technicianId
├── startTime
├── endTime
├── isActive
├── createdAt
└── updatedAt
```

## Firestore Security Rules

For production, apply these basic security rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Complainers can only see their own tickets
    match /tickets/{ticketId} {
      allow read: if request.auth.uid == resource.data.complainerId;
      allow create: if request.auth.uid == request.resource.data.complainerId;
      
      // Technicians can see assigned tickets
      allow read: if request.auth.uid == resource.data.assignedToId;
      allow update: if request.auth.uid == resource.data.assignedToId;
      
      // Admins can see everything
      // (add admin check in your backend)
    }
  }
}
```

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                 # Root layout with Auth Provider
│   ├── page.tsx                   # Home/Landing page
│   ├── login/page.tsx             # Login page
│   ├── signup/page.tsx            # Sign up page
│   ├── complainer/
│   │   ├── layout.tsx             # Complainer layout
│   │   ├── page.tsx               # Dashboard
│   │   ├── create/page.tsx        # Create ticket
│   │   └── [ticketId]/page.tsx    # Ticket details
│   ├── technician/
│   │   ├── layout.tsx             # Technician layout
│   │   ├── page.tsx               # Ticket queue
│   │   ├── assigned/page.tsx      # My tickets
│   │   └── shift/page.tsx         # Shift management
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout
│   │   ├── page.tsx               # Analytics
│   │   ├── tickets/page.tsx       # All tickets
│   │   └── users/page.tsx         # User management
│   └── tickets/
│       └── [ticketId]/page.tsx    # Shared ticket view
├── components/
│   ├── badge.tsx                  # Badge component
│   ├── ticket-card.tsx            # Ticket card
│   └── status-badge.tsx           # Status/Priority badges
├── lib/
│   ├── firebase.ts                # Firebase config
│   ├── types.ts                   # TypeScript types
│   ├── auth-context.tsx           # Auth provider
│   ├── auth-hooks.ts              # Auth hooks
│   └── firestore-service.ts       # Database queries
└── globals.css                    # Global styles
```

## Features Breakdown

### Authentication
- Email/password signup and login
- Automatic role assignment during signup
- Session persistence with Firebase Auth
- Secure logout functionality

### Ticket Management
- Create tickets with priority levels and categories
- Automatic ticket ID generation
- Status tracking (open → assigned → in_progress → resolved → closed)
- Priority sorting (critical > high > medium > low)

### Real-Time Updates
- Firestore real-time listeners for live updates
- Message notifications
- Ticket status changes propagate instantly

### Role-Based Access Control
- Three distinct roles with separate dashboards
- Protected routes (only authenticated users can access)
- Role-specific data visibility

### Shift System
- Technicians can start/end work shifts
- Shift tracking with start/end times
- Active shift indicator

### Analytics
- Ticket statistics by status and priority
- User distribution by role
- Recent ticket activity feed
- Performance metrics

## Testing

### Test Accounts to Create:

1. **Complainer Account**
   - Email: complainer@example.com
   - Password: test123456
   - Role: Complainer

2. **Technician Account**
   - Email: technician@example.com
   - Password: test123456
   - Role: Technician

3. **Admin Account**
   - Email: admin@example.com
   - Password: test123456
   - Role: Admin

### Test Flow:

1. Sign up as complainer → Create a ticket
2. Sign up as technician → Claim ticket from queue
3. Send messages between accounts
4. View analytics as admin

## Next Steps (Future Enhancements)

- [ ] Email notifications for ticket updates
- [ ] File attachments/uploads to Cloud Storage
- [ ] Advanced search and filtering
- [ ] Ticket categories and tags management
- [ ] Service Level Agreements (SLA) tracking
- [ ] Automated ticket assignment based on skills
- [ ] Customer satisfaction ratings
- [ ] PDF report generation
- [ ] Slack/Email integration
- [ ] Mobile app (React Native)

## Troubleshooting

### Firebase Error: "auth/invalid-api-key"
- Verify all environment variables are set correctly
- Check that your Firebase project allows this domain

### Tickets not appearing
- Check Firestore database is created and rules allow access
- Verify you're logged in with correct role

### Real-time updates not working
- Check browser console for errors
- Verify Firestore collection paths are correct
- Check Firestore security rules allow read access

## Support

For questions or issues:
1. Check Firebase documentation: https://firebase.google.com/docs
2. Review Firestore security rules
3. Check browser console for errors

## License

MIT
