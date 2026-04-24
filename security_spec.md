# Security Specification

## Data Invariants
1. A ticket must have a unique numeric ticket number.
2. A ticket status must be one of the allowed enums.
3. CreatedAt and UpdatedAt must be server timestamps.
4. Only authenticated helpdesk staff (verified emails) should access tickets.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a ticket with a fake `callerName` that looks like an admin.
2. **Resource Poisoning**: Large string (1MB) in `incidentSummary`.
3. **ID Poisoning**: Inject characters into `ticketId`.
4. **State Shortcutting**: Change ticket status from `NEW` directly to `CLOSED` without intermediate steps (if applicable).
5. **PII Leak**: A guest trying to read all tickets.
6. **Shadow Field**: Adding `isVerified: true` to a user profile (not in this app, but relevant).
7. **Recursive Cost Attack**: Deeply nested list queries.
8. **Impersonation**: Setting `ownerId` to another user's UID.
9. **Timestamp Manipulation**: Sending a client-side date for `createdAt`.
10. **Orphaned Record**: Creating a ticket that references a non-existent company (if relational checks existed).
11. **Massive Payload**: A ticket with 100 extra fields.
12. **Status Lock Bypass**: Updating a `CLOSED` ticket.

## Test Runner (firestore.rules.test.ts)
(To be implemented if environment allows running vitest/jest)
