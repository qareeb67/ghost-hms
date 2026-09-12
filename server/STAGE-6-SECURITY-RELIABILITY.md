# Stage 6 — Security + Reliability Audit

## Completed hardening

- Removed the shipped `.env`; added `.env.example` with required configuration keys.
- Added production startup validation for required database/JWT configuration.
- Added production-ready CORS allowlisting via `CORS_ORIGINS`.
- Disabled Express `X-Powered-By` fingerprinting.
- Added security response headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and production HSTS when HTTPS is active.
- Limited JSON/urlencoded request bodies to 1 MB.
- Hardened Bearer-token parsing and invalid-token responses.
- Added authentication rate limiting for login and registration endpoints.
- Added request validation for login, profile updates, password changes, and admin user updates.
- Standardized the minimum password length to 8 characters.
- Reduced default JWT lifetime from 24 hours to 12 hours, configurable with `JWT_EXPIRES_IN`.
- Disabled `/test-db` in production.
- Disabled Swagger UI in production unless `ENABLE_API_DOCS=true`.
- Added a JSON 404 response for unknown API routes.
- Prevented production 500 responses from exposing internal error messages.
- Added safe handling for PostgreSQL duplicate-key errors (`409 Conflict`).
- Removed remaining old codename references from backend source comments/messages.
- Fixed the appointment Swagger YAML syntax issue found during startup testing.

## Verification

- Full backend JavaScript syntax check: PASS.
- Startup smoke test: PASS.
- Protected route without token: 401.
- Invalid CORS origin: 403.
- Login request validation: 400 for invalid payload.
- Authentication rate limit: 429 after repeated attempts.
- Production `/api-docs`: 404 by default.
- Production `/test-db`: 404.
- Root endpoint returns a clean JSON API health response.
- No `.env`, private key, or certificate artifacts are included in the hardened snapshot.
- No obvious dynamic SQL concatenation was found in `pool.query` calls during the static scan.

## Remaining operational verification

Real database-backed authorization and financial workflows still need to be exercised against the user's actual PostgreSQL instance because the sandbox has no access to that database.
