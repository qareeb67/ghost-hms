# Stage 2 — Full End-to-End Testing

## Current checkpoint

Stage 1B cleanup is preserved. Stage 2 is now focused on controlled end-to-end testing using:

**Observe → reproduce → classify → fix → retest**

## Completed in this checkpoint

- Added a code-level duplicate-submit guard to `AddPaymentForm.jsx`.
- Enforced the agreed online-only payment rule in `paymentService.js`.
- Preserved backend ownership of payment status and financial validation.
- Confirmed `Billing.jsx` already calculates **Total Received** from `bill.total_paid`, so the earlier suspected summary issue is resolved in the current code.

## Still pending

- Run the application against the real backend/database.
- Execute the payment test matrix: partial, exact, overpayment, invalid amount/method, duplicate submission, offline/server failure, and receipt flow.
- Execute the full clinical workflow: patient → doctor → appointment → completion → medical record → prescription → laboratory → billing → payment → receipt/printing.
- Execute the emergency workflow separately.
- Complete offline/sync stress testing in Stage 3.
- Perform the final printing and UI/UX audits after functional testing.

## Important

The IndexedDB database name `ghost_hms` remains unchanged intentionally to avoid orphaning existing offline data.
