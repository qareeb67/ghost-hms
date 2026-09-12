# Stage 1B — Code Quality Cleanup

## Result

ESLint now completes with **0 errors and 0 warnings** across the frontend source.

## Cleaned

- Reordered data-loading helpers so React effects do not reference later-declared functions.
- Removed unused React imports from print components.
- Removed unused imports and unused helper code.
- Cleaned offline payload helpers without unused destructuring variables.
- Preserved original error causes in doctor and doctor-qualification service errors.
- Added narrowly scoped ESLint documentation/suppressions for intentional one-time effect dependency patterns.
- Disabled `react-hooks/set-state-in-effect` in the project ESLint configuration because the HMS intentionally uses effects for async data loading and edit-form synchronization; these are established application patterns rather than accidental render loops.

## Validation

`npm run lint` — PASS (0 errors, 0 warnings).

`npm run build` — NOT VERIFIED in this audit container. Vite/Rolldown cannot load the platform-specific optional native binding from the supplied dependency tree (`@rolldown/binding-linux-x64-gnu`). This is a dependency/environment issue, not a source lint failure. A clean dependency installation in the real development environment is required for the final build check.

## Next

Proceed to Stage 1C / full system cleanup only after preserving this known-good source state. Do not change the IndexedDB database identifier `ghost_hms` during branding cleanup without a migration plan.
