# Phase 4 Recovery Record

Recovery branch: `phase/04-auth-rbac-tenancy-recovery`

Base main SHA: `bcf90df07bb411d3611d0fbbc7c852d6ffb125b2`

Reason: PR #11 was merged before the Phase 3 stabilization gate and Auth.js/RBAC cutover were complete.

Rules for this recovery:
- do not rewrite or directly modify `main`;
- do not mutate production databases;
- keep customer QR ordering public;
- do not cut over FoodFlow business persistence;
- do not start Phase 5;
- do not merge the recovery PR until all required application and database quality gates are green and the Phase 4 auth cutover is complete.

Verified inherited blockers at recovery start:
- Next Flow Quality fails because `package.json` includes `next-auth@5.0.0-beta.32` while `package-lock.json` is not synchronized;
- Supabase Database Quality stops at the same `npm ci` failure before DB bootstrap can execute;
- Vercel status on the recovery base commit is failing.

This file is an implementation-status record, not proof that any gate has passed.
