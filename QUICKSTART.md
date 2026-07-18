# Quick Start Guide - Support Ticket System

Get your Support Ticket System running in 10 minutes!

## Step 1: Create Firebase Project (2 minutes)

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **"Get Started"** (or **"Add project"**)
3. Enter project name: `support-ticket-system`
4. Accept terms and click **"Create project"**
5. Wait for project to initialize (about 30 seconds)

## Step 2: Get Firebase Credentials (3 minutes)

1. In Firebase Console, click the **Settings icon** (⚙️) → **Project settings**
2. Go to **"Your apps"** section
3. Click **"Web"** icon (</>) to create a web app
4. Enter app nickname: `Support System`
5. Click **"Register app"**
6. Copy the Firebase config object:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## Step 3: Set Up Environment Variables (1 minute)

1. In your project root, copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 4: Enable Authentication (1 minute)

1. In Firebase Console, go to **"Authentication"** (left menu)
2. Click **"Get started"**
3. Click on **"Email/Password"**
4. Toggle **"Enable"** → **"Save"**

## Step 5: Create Firestore Database (2 minutes)

1. In Firebase Console, go to **"Firestore Database"** (left menu)
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose location closest to you
5. Click **"Create"**

### Create Collections

In Firestore Console, create these collections by clicking **"Start collection"**:

1. **users** - Leave empty (auto-created on signup)
2. **tickets** - Leave empty (auto-created when creating tickets)
3. **messages** - Leave empty (auto-created when sending messages)
4. **shifts** - Leave empty (auto-created on shift start)

## Step 6: Install Dependencies & Run (1 minute)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## Step 7: Test the System (2 minutes)

### Create Test Accounts

1. Click **"Sign Up"**
2. Create account with role **"Complainer"**
   - Email: `customer@example.com`
   - Password: `TestPassword123!`

3. Create another account with role **"Technician"**
   - Email: `tech@example.com`
   - Password: `TestPassword123!`

4. Create admin account with role **"Admin"**
   - Email: `admin@example.com`
   - Password: `TestPassword123!`

### Test a Workflow

**As Complainer:**
1. Log in as `customer@example.com`
2. Click **"Create Ticket"**
3. Fill in the form and submit
4. View your ticket on the dashboard

**As Technician:**
1. Open new private/incognito window
2. Log in as `tech@example.com`
3. Go to `/technician` - see the ticket queue
4. Click **"Claim"** to assign to yourself
5. Go to `/technician/assigned` to see your tickets

**As Admin:**
1. Open new private/incognito window
2. Log in as `admin@example.com`
3. View system analytics at `/admin`
4. Manage all tickets at `/admin/tickets`
5. View users at `/admin/users`

## Firestore Security Rules (Optional - for Production)

When ready to deploy, update security rules. Go to Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || getUserRole() == "admin");
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets collection
    match /tickets/{ticketId} {
      allow read: if request.auth != null && (
        resource.data.createdById == request.auth.uid ||
        resource.data.assignedToId == request.auth.uid ||
        getUserRole() == "admin"
      );
      allow create: if request.auth != null && request.resource.data.createdById == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.createdById == request.auth.uid ||
        resource.data.assignedToId == request.auth.uid ||
        getUserRole() == "admin"
      );
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null && canAccessTicket(get(/databases/$(database)/documents/tickets/$(resource.data.ticketId)));
      allow create: if request.auth != null;
    }
    
    // Shifts collection
    match /shifts/{shiftId} {
      allow read, write: if request.auth != null && (
        resource.data.technicianId == request.auth.uid ||
        getUserRole() == "admin"
      );
    }
  }
  
  function getUserRole() {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
  }
  
  function canAccessTicket(ticket) {
    return ticket.data.createdById == request.auth.uid ||
           ticket.data.assignedToId == request.auth.uid ||
           getUserRole() == "admin";
  }
}
```

Update these rules in Firebase Console under Firestore → Rules before going to production.

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Verify all environment variables are correct in `.env.local`
- Ensure values don't have extra spaces or quotes
- Restart the dev server after updating `.env.local`

### "Collection not found"
- In Firebase Console, go to Firestore and manually create the collections
- Or, trigger their creation by signing up and creating a ticket

### Messages not appearing
- Check Firestore security rules allow read/write
- In test mode, rules should be open for development

### Users can't log in
- Verify Email/Password authentication is enabled in Firebase
- Check that user was created successfully (go to Firebase → Authentication)

## Next Steps

1. **Customize Categories**: Edit ticket categories in the create form
2. **Add Email Notifications**: Integrate Sendgrid or Firebase email triggers
3. **Deploy to Vercel**: Push to GitHub and deploy via Vercel
4. **Enable Push Notifications**: Get Firebase VAPID key and configure Cloud Messaging
5. **Add Custom Branding**: Update colors and logo in the UI

## Helpful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)

## Production Checklist

Before going live:

- [ ] Update Firestore security rules (see above)
- [ ] Set up proper error handling and logging
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Test with real user data
- [ ] Review Firebase pricing
- [ ] Configure email notifications
- [ ] Set up support channels

---

**You're all set! Start building. 🚀**
