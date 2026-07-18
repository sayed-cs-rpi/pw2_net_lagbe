# System Architecture - Support Ticket System

## Overview

The Support Ticket System is built on a modern, scalable architecture using Next.js 16, Firebase, and React. The system follows a client-server architecture with real-time synchronization.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ React Components                                         ││
│  │ ├─ Pages (Complainer, Technician, Admin)               ││
│  │ ├─ Shared Components (TicketCard, StatusBadge)         ││
│  │ └─ Layouts (role-specific navigation)                  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ State Management                                         ││
│  │ ├─ React Context (Authentication)                       ││
│  │ ├─ SWR (Data fetching & caching)                        ││
│  │ └─ Component State (Forms, UI state)                    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Firebase SDK                                             ││
│  │ ├─ Authentication (signUp, signIn, signOut)            ││
│  │ ├─ Firestore (Real-time listeners, queries)           ││
│  │ └─ Cloud Messaging (Push notifications)               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
           │
           │ HTTPS (Encrypted)
           │
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Firebase)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Firebase Authentication                                 ││
│  │ ├─ Email/Password auth                                 ││
│  │ ├─ Session management                                  ││
│  │ └─ JWT tokens                                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Firestore Database                                      ││
│  │ ├─ Collections (users, tickets, messages, shifts)     ││
│  │ ├─ Security Rules (RLS)                               ││
│  │ └─ Real-time Listeners                                ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Firebase Cloud Messaging (Optional)                     ││
│  │ ├─ Push notifications                                  ││
│  │ └─ Device token management                             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Input (Email, Password)
    ↓
SignUp/Login Page Component
    ↓
Firebase Auth.signUp() / signIn()
    ↓
Firebase Authentication Service
    ↓
User created/verified ✓
    ↓
JWT Token generated
    ↓
AuthProvider updates context
    ↓
User routed to role-specific dashboard
```

### Ticket Creation Flow

```
User clicks "Create Ticket"
    ↓
Create Form Component
    ↓
Form validation (Zod schema)
    ↓
Submit to Firestore
    ↓
firestore-service.createTicket()
    ↓
Firestore: tickets collection
    ↓
Real-time listener triggered
    ↓
Component re-renders with new ticket
    ↓
Notification sent to admin
```

### Real-Time Update Flow

```
Technician updates ticket status
    ↓
Firestore query executed
    ↓
Database updated
    ↓
Real-time listener on client detects change
    ↓
SWR cache invalidated
    ↓
Components re-fetch data
    ↓
UI updated instantly
    ↓
Other users see the update automatically
```

## Component Architecture

### Page Structure

```
app/
├── layout.tsx
│   └── AuthProvider (context)
│   └── SetupCheck (guards against misconfiguration)
│   └── Toaster (notifications)
│
├── page.tsx (Landing page - public)
│
├── login/ (Public route)
│   └── page.tsx - Email/password login
│
├── signup/ (Public route)
│   └── page.tsx - Registration with role selection
│
├── complainer/ (Protected - Complainer role only)
│   ├── layout.tsx - Sidebar navigation
│   ├── page.tsx - Ticket list
│   ├── create/page.tsx - Create ticket form
│   └── [ticketId]/page.tsx - Ticket detail
│
├── technician/ (Protected - Technician role only)
│   ├── layout.tsx - Sidebar navigation
│   ├── page.tsx - Ticket queue
│   ├── assigned/page.tsx - My tickets
│   └── shift/page.tsx - Shift management
│
├── admin/ (Protected - Admin role only)
│   ├── layout.tsx - Sidebar navigation
│   ├── page.tsx - Analytics dashboard
│   ├── tickets/page.tsx - All tickets
│   └── users/page.tsx - User management
│
└── tickets/
    └── [ticketId]/page.tsx - Shared detail view
```

### Component Hierarchy

```
RootLayout
├── SetupCheck (modal)
├── AuthProvider
│   ├── Page/Layout
│   │   ├── Navigation (role-based)
│   │   ├── TicketCard
│   │   │   ├── StatusBadge
│   │   │   ├── PriorityBadge
│   │   │   └── UserAvatar
│   │   ├── TicketForm
│   │   │   ├── Input fields
│   │   │   ├── Select dropdowns
│   │   │   └── Form validation
│   │   └── MessageThread
│   │       ├── Message item
│   │       ├── Reply form
│   │       └── Real-time listener
│   └── Toaster (notifications)
```

## State Management Strategy

### 1. Authentication State
**Location**: `lib/auth-context.tsx`
**Purpose**: Global auth state and user info
**Scope**: Application-wide

```typescript
interface AuthContext {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

**Usage**: All protected pages use `useAuth()` hook

### 2. Component-Level State
**Method**: React `useState`
**Examples**:
- Form inputs
- Modal visibility
- Loading states
- Local filters

### 3. Data Caching
**Library**: SWR
**Purpose**: Real-time data synchronization
**Examples**:
- Tickets list
- Messages
- User profiles

## Firestore Data Model

### Collections & Documents

#### users
```
users/{uid}
├── uid: string (document ID)
├── email: string
├── name: string
├── role: "complainer" | "technician" | "admin"
├── avatar: string? (optional)
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── isOnShift: boolean? (technician only)
└── currentShiftStart: Timestamp? (technician only)
```

#### tickets
```
tickets/{ticketId}
├── id: string (document ID)
├── title: string
├── description: string
├── status: "open" | "assigned" | "in_progress" | "waiting" | "resolved" | "closed"
├── priority: "low" | "medium" | "high" | "critical"
├── category: string
├── createdById: string (reference to users/{uid})
├── assignedToId: string? (reference to users/{uid})
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── lastMessageAt: Timestamp?
```

#### messages
```
messages/{messageId}
├── id: string (document ID)
├── ticketId: string (reference to tickets/{ticketId})
├── authorId: string (reference to users/{uid})
├── content: string
├── isInternal: boolean
├── attachments: string[]? (URLs)
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### shifts
```
shifts/{shiftId}
├── id: string (document ID)
├── technicianId: string (reference to users/{uid})
├── startTime: Timestamp
├── endTime: Timestamp?
├── duration: number? (in minutes)
├── status: "active" | "completed"
└── createdAt: Timestamp
```

## Security Architecture

### Authentication
- Firebase Auth handles authentication
- Email/password validation
- Session managed via JWT tokens
- Tokens verified on every request

### Authorization
- Role-based access control (RBAC)
- Firestore Security Rules enforce data access
- Client-side route guards prevent navigation

### Firestore Security Rules Pattern
```javascript
match /tickets/{ticketId} {
  // Owner can read/write their own tickets
  allow read, write: if resource.data.createdById == request.auth.uid;
  
  // Assigned technician can read/update
  allow read, write: if resource.data.assignedToId == request.auth.uid;
  
  // Admins can do everything
  allow read, write: if getUserRole() == "admin";
}
```

### Input Validation
- Zod schemas for form validation
- Client-side validation for UX
- Server-side validation (Firestore) for security

## Performance Optimization

### 1. Code Splitting
- Next.js automatic route-based splitting
- Dynamic imports for heavy components

### 2. Caching Strategy
- SWR for API-like queries
- Browser cache for static assets
- Firestore indexes for query performance

### 3. Real-Time Optimization
- Firestore listeners only on active pages
- Unsubscribe on component unmount
- Efficient query design with indexes

### 4. Image Optimization
- Next.js Image component (when used)
- Lazy loading for images
- Responsive images

## Error Handling

### Firebase Errors
```typescript
// Example: Handle auth errors
try {
  await firebaseSignUp(email, password);
} catch (error) {
  if (error.code === "auth/email-already-in-use") {
    // Show specific message
  } else {
    // Show generic error
  }
}
```

### Form Validation Errors
```typescript
// Using Zod
const schema = z.object({
  email: z.string().email("Invalid email"),
  // ...
});
```

### Network Errors
- SWR retry logic
- Toast notifications for failures
- Fallback UI states

## Scalability Considerations

### Current Limitations
- Firestore reads are billed per query
- Real-time listeners count as reads
- No built-in full-text search

### Scaling Solutions
1. **Firestore Indexes**: Create composite indexes for complex queries
2. **Caching Layer**: Add Redis for frequently accessed data
3. **Search**: Implement Algolia or Elasticsearch
4. **Cloud Functions**: Add backend logic as needed
5. **Database Sharding**: Distribute data across sub-collections

### Recommended Improvements at Scale
- Implement pagination
- Add request debouncing
- Use Cloud Functions for heavy operations
- Implement message archiving
- Add analytics to separate database

## Deployment Architecture

### Local Development
```
pnpm dev
    ↓
Next.js dev server (http://localhost:3000)
    ↓
Hot reload on file changes
    ↓
Connected to Firebase project
```

### Production (Vercel)
```
GitHub Push
    ↓
Vercel detects build
    ↓
Build Next.js app (Turbopack)
    ↓
Run tests (optional)
    ↓
Deploy to CDN + Serverless Functions
    ↓
Environment variables from Vercel dashboard
    ↓
Connected to Firebase project
    ↓
SSL/TLS certificate (automatic)
    ↓
Global edge caching
```

## Monitoring & Logging

### Client-Side Logging
```typescript
console.log("[v0] Debug message");  // Development
console.error("[v0] Error message");  // Errors
```

### Firebase Monitoring
- Firebase Console shows:
  - Authentication stats
  - Firestore read/write counts
  - Usage and billing
  - Error rates

### Recommended Tools
- Sentry for error tracking
- LogRocket for session replay
- Firebase Analytics for user behavior

## API Contract

### Authentication Endpoints
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Sign in
- `POST /auth/signout` - Sign out
- `GET /auth/user` - Get current user

### Ticket Endpoints
- `GET /tickets` - List tickets (filtered by role)
- `POST /tickets` - Create ticket
- `GET /tickets/{id}` - Get ticket details
- `PATCH /tickets/{id}` - Update ticket
- `DELETE /tickets/{id}` - Delete ticket

### Message Endpoints
- `GET /tickets/{id}/messages` - Get messages
- `POST /tickets/{id}/messages` - Send message

### User Endpoints
- `GET /users` - List users (admin only)
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## Technology Decisions

| Technology | Why Chosen | Alternative |
|---|---|---|
| Next.js | Full-stack React framework | Remix, SvelteKit |
| Firebase | Managed backend, real-time DB | Supabase, AWS Amplify |
| Tailwind CSS | Utility-first CSS | Bootstrap, Material-UI |
| React Context | Simple auth state | Redux, Zustand |
| SWR | Data fetching with caching | React Query, Apollo |
| Zod | TypeScript schema validation | Yup, Joi |

## Future Architecture Enhancements

1. **GraphQL API**: Add Apollo Server for flexible queries
2. **Microservices**: Split into separate services (Auth, Tickets, Notifications)
3. **Message Queue**: Add Bull/Redis for async operations
4. **Search Engine**: Elasticsearch for full-text search
5. **Cache Layer**: Redis for hot data
6. **File Storage**: Cloud Storage integration
7. **Analytics**: Dedicated analytics database
8. **Mobile App**: React Native app sharing business logic

---

**Last Updated**: 2024
**Architecture Version**: 1.0
