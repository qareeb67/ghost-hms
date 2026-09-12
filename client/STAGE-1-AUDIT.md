# Stage 1A — Finalization Audit

Temporary presentation name: **Hospital Management System**

## Completed
- Removed user-facing `Ghost HMS` branding from the application source.
- Updated print-document default hospital names to `Hospital Management System`.
- Updated PWA name, short name, and description.
- Updated browser document title.
- Updated package name from `client` to `hospital-management-system`.
- Removed automatic execution of database/sync test utilities from `src/main.jsx`.
- Renamed the unused internal manual sync test helper from `testGhostHMSSync` to `testHMSSync`.
- Renamed the print-window root from `ghost-print-root` to `print-root`.
- Kept the IndexedDB database name `ghost_hms` intentionally so existing offline data is not orphaned by a branding-only change.
- Configured ESLint to ignore generated `dist` and `dev-dist` output.

## Findings for the next QA passes
- ESLint currently reports existing source-code issues that predate this cleanup. These will be handled systematically during the QA/code-quality pass rather than changing working behavior blindly.
- The bundled `node_modules` in the uploaded ZIP is not a reliable build environment here; Vite currently cannot load its native Rolldown optional binding. The production build will be verified after dependencies are freshly installed in the real development environment.
- `src/services/api.js` still uses `http://localhost:5000`; this is intentionally left for the deployment/configuration stage so we can configure the real production backend URL correctly.

## Branding rule
Do not rename the IndexedDB database identifier casually. If the permanent product name changes later, the database migration strategy must be considered separately.
