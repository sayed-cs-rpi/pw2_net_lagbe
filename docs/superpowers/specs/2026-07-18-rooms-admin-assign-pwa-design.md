# Rooms, Admin Assignment, Notifications & PWA — Design

**Date:** 2026-07-18  
**Status:** Approved  
**Approach:** Extend existing Firestore client patterns (Approach 1)

## Summary

Add admin-managed rooms bound to complainer accounts (required on ticket create), admin technician assignment alongside existing technician self-claim, verify/fix FCM notifications, and add an installable PWA manifest.

## Data model

### Room (`rooms` collection)

| Field | Type | Notes |
|-------|------|--------|
| id | string | Firestore doc id |
| name | string | Display name |
| building | string | |
| floor | string | |
| roomNumber | string | |
| notes | string? | Optional |
| ownerId | string | Complainer uid |
| ownerName | string | Denormalized |
| ownerEmail | string | Denormalized |
| createdBy | string | Admin uid |
| createdAt | Date | |
| updatedAt | Date | |

### Ticket (extend)

Required room snapshot fields on every new ticket:

- `roomId`, `roomName`, `roomBuilding`, `roomFloor`, `roomNumber`

Existing assignment fields remain: `assignedToId`, `assignedToName`. Statuses unchanged: `open | assigned | in_progress | resolved | closed`.

### Assignment rules

1. **Admin** can assign or reassign any ticket to any technician → sets `assignedToId`/`assignedToName`, status `assigned`, sends assignment notification.
2. **Technician** can still **claim** unassigned tickets (queue).
3. Assigned technician and admin can update ticket status; status change notifies complainer / assignee / admins (existing helpers).

## UI & flows

### Admin

- **Rooms** page (`/admin/rooms`): list, create, edit, delete. On create/edit, select complainer account to bind as owner.
- Soft-block delete if any open/assigned/in_progress tickets reference the room.
- **Ticket detail**: technician dropdown + Assign/Reassign for admins.
- Nav link to Rooms in admin layout.

### Complainer

- Create ticket: required Room dropdown (only rooms where `ownerId === user.uid`).
- If user has zero rooms: block submit with message to contact admin.
- Ticket detail/card shows room summary.

### Technician

- Keep Queue (claim) + Assigned list.
- Ticket detail: status updates for assignee (and admin).

## Services

In `lib/firestore-service.ts`:

- `createRoom`, `updateRoom`, `deleteRoom`, `getRoom`, `getRooms`, `getRoomsByOwner`
- `assignTicket(ticketId, technicianId, technicianName)` — shared by admin assign and claim
- `getUnassignedTickets` — fix broken Firestore `assignedToId == undefined` query (use `status == 'open'` and/or client filter for missing assignee)
- `getUsersByRole(role)` helper for complainers/technicians lists
- Ticket create requires room snapshot fields
- `countOpenTicketsForRoom(roomId)` for delete guard

## Notifications

- Keep existing helpers in `lib/notifications.ts`.
- On login: permission + persist `fcmToken` (already in auth context) — verify end-to-end.
- Admin assign and tech claim both call `sendTicketAssignmentNotification`.
- Client-side local Notification remains the delivery path when Admin SDK is unavailable (document this limitation).
- Ensure SW env inject runs on build; foreground path remains usable.

## PWA

- Add `public/manifest.webmanifest` (name, short_name, start_url `/`, display `standalone`, theme/background, icons 192 + 512).
- Link manifest in root layout metadata.
- Keep `firebase-messaging-sw.js` for FCM; registration must not break installability.
- Out of scope: full offline ticket CRUD cache.

## Error handling

- No rooms for complainer → clear toast/UI, no create.
- Claim only when ticket has no `assignedToId`.
- Room delete blocked when active tickets reference room.

## Manual test plan

1. Admin creates room for complainer A.
2. A creates ticket → must pick room → ticket shows room.
3. Admin assigns tech B → B sees Assigned + notification path fires (if permission granted).
4. B claims another open ticket; B updates status → A notified (local/FCM path).
5. Browser shows Install / Add to Home Screen; FCM SW still registered.

## Non-goals

- Server-side FCM via Firebase Admin SDK
- Full offline-first sync
- Removing technician claim
