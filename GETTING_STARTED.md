# Getting Started - Support Ticket System

Welcome! This guide will get you up and running in minutes.

## 🎯 What is This?

An **enterprise-grade support ticket system** for managing customer support with three user roles:
- **Complainers (Customers)**: Submit and track tickets
- **Technicians**: Manage and resolve tickets  
- **Admins**: Monitor system and manage users

## ⚡ Quick Start (10 minutes)

### 1️⃣ Prerequisites
- Node.js 18+ installed
- Firebase project (free at [firebase.google.com](https://firebase.google.com))
- Terminal/Command Prompt

### 2️⃣ Clone/Download
```bash
cd your-project-directory
```

### 3️⃣ Install Dependencies
```bash
pnpm install
# or: npm install / yarn install
```

### 4️⃣ Setup Firebase

**A. Create Firebase Project** (2 minutes)
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started"
3. Create new project named `support-ticket-system`

**B. Get Your Firebase Credentials** (2 minutes)
1. In Firebase Console: Settings ⚙️ → Project Settings
2. Scroll to "Your apps" → Click Web (</>) icon
3. Copy your Firebase config (the object with apiKey, projectId, etc.)

**C. Setup Environment Variables** (1 minute)
1. In your project: `cp .env.local.example .env.local`
2. Edit `.env.local` and paste your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**D. Enable Authentication** (1 minute)
1. Firebase Console → Authentication
2. Click "Get Started" → "Email/Password"
3. Toggle "Enable" → "Save"

**E. Create Firestore Database** (2 minutes)
1. Firebase Console → Firestore Database
2. Click "Create Database"
3. Select "Start in test mode"
4. Choose your location
5. Click "Create"

**F. Create Collections** (1 minute)
In Firestore, create these collections (they auto-populate):
- `users`
- `tickets`
- `messages`
- `shifts`

### 5️⃣ Start the Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📖 What to Do Next

### Test the System
1. **Sign Up** - Create account with role "Complainer"
2. **Create Ticket** - Go to `/complainer/create`
3. **Create Another Account** - Sign up as "Technician"
4. **Claim Ticket** - Go to `/technician` and claim the ticket
5. **View Updates** - See real-time updates across both accounts

### Explore Dashboards

**As Complainer:**
- Dashboard: `/complainer`
- Create Ticket: `/complainer/create`
- View Ticket: `/complainer/{ticketId}`

**As Technician:**
- Queue: `/technician`
- My Tickets: `/technician/assigned`
- Manage Shift: `/technician/shift`

**As Admin:**
- Analytics: `/admin`
- All Tickets: `/admin/tickets`
- Users: `/admin/users`

## 📚 Documentation

| Document | Read If... |
|---|---|
| [QUICKSTART.md](./QUICKSTART.md) | You want step-by-step Firebase setup |
| [README.md](./README.md) | You want complete feature overview |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | You want to see what's been built |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | You want to understand the system design |
| [SETUP.md](./SETUP.md) | You're deploying to production |

## 🗂️ Project Layout

```
app/
├── page.tsx              → Landing page (public)
├── login/               → Login page (public)
├── signup/              → Registration page (public)
├── complainer/          → Customer dashboard
├── technician/          → Support agent dashboard
└── admin/               → Admin dashboard

lib/
├── firebase.ts          → Firebase configuration
├── auth-context.tsx     → Authentication state
├── firestore-service.ts → Database queries
└── types.ts             → TypeScript definitions

components/
├── ticket-card.tsx      → Ticket display
├── status-badge.tsx     → Status indicator
└── setup-check.tsx      → Firebase config check
```

## 🔑 Key Features

✅ Real-time ticket updates  
✅ Role-based dashboards  
✅ Priority system  
✅ Shift management  
✅ Message threading  
✅ Mobile responsive  
✅ Dark mode  
✅ Type-safe (TypeScript)  

## 🚀 Ready to Deploy?

See [SETUP.md](./SETUP.md) for:
- Production security rules
- Vercel deployment
- Environment configuration
- Firebase monitoring

## ❓ Common Questions

**Q: Where's the database?**  
A: Firebase Firestore (cloud database). Auto-created in your Firebase project.

**Q: Do I need a backend?**  
A: No! Firebase handles authentication and database. Next.js is the frontend.

**Q: How much does it cost?**  
A: Firebase has a free tier covering small to medium projects. See firebase.google.com/pricing

**Q: Can I customize the UI?**  
A: Yes! Modify components in `components/` and pages in `app/`. Styling uses Tailwind CSS.

**Q: How do I add more roles?**  
A: Edit `lib/types.ts` to add roles, then create new pages in `app/`.

**Q: Can I use this for a real business?**  
A: Yes! This is production-ready code. Follow security rules in SETUP.md before going live.

**Q: What if I get stuck?**
A: Check the docs, review component code (it's well-commented), or read the Firebase docs.

## 🛠️ Troubleshooting

**Error: "Firebase: Error (auth/invalid-api-key)"**  
→ Check `.env.local` - make sure all Firebase credentials are correct. No extra spaces!

**App is blank**  
→ Check browser console (F12 → Console tab) for errors. Restart dev server: `pnpm dev`

**Collections not showing in Firestore**  
→ They auto-create on first use. Sign up and create a ticket to trigger it.

**Can't log in**  
→ Go to Firebase Console → Authentication. Is Email/Password enabled? Is user listed there?

**Real-time updates not working**  
→ Check Firebase Firestore security rules are allowing reads/writes (test mode allows all)

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## ✨ Next Steps

1. ✅ Complete steps 1-5 above
2. 🧪 Test with multiple accounts
3. 🎨 Customize colors and branding
4. 📋 Add more ticket categories
5. 📧 Setup email notifications
6. 🚀 Deploy to Vercel

---

## 💡 Pro Tips

1. **Keep `.env.local` private** - Never commit to GitHub
2. **Test in multiple browsers** - Especially if you add real-time features
3. **Check Firebase pricing** - Monitor usage in Firebase Console
4. **Backup your data** - Export Firestore backups regularly
5. **Monitor security rules** - Before going production, review SETUP.md

---

**Ready?** Start with step 1 above and you'll have a working system in 10 minutes! 🚀

*Questions?* Check [QUICKSTART.md](./QUICKSTART.md) or [README.md](./README.md)
