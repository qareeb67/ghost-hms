# Ghost HMS Doctor Offline Hardening

Replace these two frontend files in the current project:

- `src/services/doctorService.js`
- `src/pages/Doctors.jsx` (use the existing Doctors page path in the project; this file preserves the current page implementation and adds sync/network refresh handling)

Changes:

1. Online doctor responses are cached with `offlineUpsert("doctors", ...)`.
2. Pending/local-only doctors are merged into the online response so they do not disappear before synchronization.
3. Doctor queue operations use `syncQueueService` for consistency with the hardened patient service.
4. The Doctors page refreshes after `ghost-hms-sync-complete` and when the browser comes back online.
5. Existing doctor CRUD behavior and the doctor UI are preserved.

Important test:

- Warm the doctor cache while ONLINE.
- Switch Network to Offline without clearing IndexedDB.
- Open Doctors and verify cached doctors remain visible.
- Create/edit/delete as appropriate.
- Return online and verify the doctor list refreshes after synchronization.

Do not clear IndexedDB immediately before an ordinary offline test; that intentionally removes the cached reference data the offline UI depends on.
