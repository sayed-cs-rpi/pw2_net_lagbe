# Rooms, Admin Assignment, Notifications & PWA — Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-managed rooms bound to complainers (required on tickets), admin technician assignment plus existing claim, verify notifications, add installable PWA.

**Architecture:** Extend Firestore client services and App Router pages. Rooms collection + denormalized room fields on tickets. Shared `assignTicket` for admin and claim. Manifest + icons for PWA; keep FCM SW.

**Tech Stack:** Next.js 15, React 19, Firebase Auth/Firestore/FCM, Tailwind

## Global Constraints

- Follow existing UI patterns (role-colored dashboards, TicketCard, toast).
- Client-side Firestore only (no new API routes).
- Room required on ticket create.
- Soft-block room delete if active tickets reference it.
- Keep technician claim; add admin assign.

---

### Task 1: Types + Firestore room/assign services

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/firestore-service.ts`

- [ ] **Step 1:** Add `Room` interface; extend `Ticket` with room fields.
- [ ] **Step 2:** Implement room CRUD, `getRoomsByOwner`, `getUsersByRole`, `assignTicket`, `countActiveTicketsForRoom`; fix `getUnassignedTickets`.
- [ ] **Step 3:** Commit.

### Task 2: Admin Rooms UI

**Files:**
- Create: `app/admin/rooms/page.tsx`
- Modify: `app/admin/layout.tsx` (nav link)

- [ ] **Step 1:** Build list + create/edit form (name, building, floor, roomNumber, notes, owner select from complainers).
- [ ] **Step 2:** Delete with active-ticket guard.
- [ ] **Step 3:** Commit.

### Task 3: Complainer create ticket + room display

**Files:**
- Modify: `app/complainer/create/page.tsx`
- Modify: `components/ticket-card.tsx`
- Modify: `app/tickets/[ticketId]/page.tsx` (show room)

- [ ] **Step 1:** Load owner rooms; required select; block if empty.
- [ ] **Step 2:** Pass room snapshot into `createTicket` + notification payload.
- [ ] **Step 3:** Show room on card and detail.
- [ ] **Step 4:** Commit.

### Task 4: Admin assign on ticket detail

**Files:**
- Modify: `app/tickets/[ticketId]/page.tsx`

- [ ] **Step 1:** If admin: load technicians, dropdown + Assign/Reassign via `assignTicket` + notification.
- [ ] **Step 2:** Confirm technician assignee can still update status.
- [ ] **Step 3:** Commit.

### Task 5: Notifications verify/fix + PWA

**Files:**
- Modify: `app/layout.tsx` (manifest metadata)
- Create: `public/manifest.webmanifest`
- Create: `public/icon-192.png`, `public/icon-512.png` (and missing favicon PNGs if needed)
- Modify: `lib/notifications.ts` / SW / registration only if gaps found
- Modify: `components/service-worker-registration.tsx` if needed

- [ ] **Step 1:** Add manifest + icons; wire metadata.
- [ ] **Step 2:** Smoke-check notification helpers compile; ensure claim/admin assign both notify; document client-local fallback.
- [ ] **Step 3:** Commit.

### Task 6: Verification

- [ ] Run `npx tsc --noEmit` / build if env allows.
- [ ] Fix any type errors from Ticket room fields.
