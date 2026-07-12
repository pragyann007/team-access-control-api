# Todo

_Skipped per request: unit tests, e2e tests, CI/CD, Docker image push, staging/prod pipelines_

# Doing

- [ ] Nothing in progress

# Done

## Core Fixes (P0)
- [x] Fix invite link URL mismatch
- [x] Fix `createInvitation()` storing inviter email instead of invitee email
- [x] Validate invite JWT signature and expiry on acceptance
- [x] Reject already-accepted invitations
- [x] Set `Invitations.acceptedAt` on acceptance
- [x] Prevent duplicate membership on invite accept
- [x] Write audit log on invite acceptance
- [x] Hash invitation tokens before storing in DB
- [x] Add invitation expiry (`expiresAt`) when creating invitations
- [x] Fix `createOrganizationsAndMemberships()` returning `{}`
- [x] Handle missing `OWNER` role gracefully on org creation
- [x] Add unique constraint on `Organizations.slug`
- [x] Fix BullMQ queue name mismatch (`emailQuee` vs `mailQueue`)
- [x] Fix mail template using `data.name` instead of `orgName`
- [x] Remove `console.log` debug statements from services and guards
- [x] Mark `Sessions.revoked = true` in DB on logout
- [x] Hash password in `updateUserPassword()` and `forgotPasswordResetWithOtp()`
- [x] Fix logout endpoint response handling with `@Res()`
- [x] Set consistent cookie options on refresh (`httpOnly`, `secure`, `maxAge`, `sameSite`)
- [x] Remove orphan `prisma` model from schema
- [x] Add unique constraint on `Memberships(userId, organizationId)`
- [x] Make `Invitations.expiresAt` and `acceptedAt` nullable
- [x] Register global `ValidationPipe` in `main.ts`
- [x] Externalize Redis config to env vars
- [x] Externalize BullMQ config to env vars
- [x] Add `.env.example` with all required variables
- [x] Ensure `.env` is in `.gitignore`

## Auth Endpoints (P1)
- [x] `POST /auth/forgot-password` — OTP generation + email queue
- [x] `POST /auth/verify-otp` — verify OTP from Redis
- [x] `POST /auth/reset-password` — reset password after OTP
- [x] `POST /auth/change-password` — change password with old password
- [x] Queue forgot-password email via BullMQ
- [x] `POST /auth/logout-all` — revoke all sessions
- [x] `GET /auth/sessions` — list active sessions
- [x] `DELETE /auth/sessions/:id` — revoke specific session

## User Module (P1)
- [x] `GET /users/me` — user profile (exclude password)
- [x] `PATCH /users/me` — update name/email
- [x] `GET /users/me/organizations` — list user's orgs

## Organization Module (P1)
- [x] `GET /organization/:id` — org details (`VIEW_ORGANIZATION`)
- [x] `PATCH /organization/:id` — update org (`UPDATE_ORGANIZATION`)
- [x] `DELETE /organization/:id` — delete org (`DELETE_ORGANIZATION`)
- [x] `GET /organization/:id/members` — list members (`VIEW_MEMBERS`)
- [x] `DELETE /organization/:id/members/:userId` — remove member (`REMOVE_MEMBER`)
- [x] `PATCH /organization/:id/members/:userId/role` — change role (`UPDATE_MEMBER_ROLE`)
- [x] `GET /organization/:id/invitations` — list pending invitations
- [x] `DELETE /organization/:id/invitations/:inviteId` — revoke invitation
- [x] `GET /organization/:id/audit-logs` — paginated audit logs (`VIEW_AUDIT_LOGS`)
- [x] Expand audit logging (login, logout, role changes, member removal)
- [x] Swagger API docs on all organization endpoints

## Security & Infrastructure (P1)
- [x] Enable `secure` + `sameSite` on refresh cookies (env-driven)
- [x] Configure CORS from `CORS_ORIGINS` env var
- [x] Add Helmet middleware
- [x] Add rate limiting on auth endpoints (`@nestjs/throttler`)
- [x] Use `ForbiddenException` (403) in `PermissionGuard` and `MembershipGuard`
- [x] Add request body size limits
- [x] `GET /health` — DB + Redis connectivity check
- [x] `GET /ready` — readiness probe endpoint

## API Quality (P1)
- [x] Global exception filter with consistent error response shape
- [x] Global logging interceptor with request/correlation ID
- [x] Replace soft-error 200 responses with proper HTTP exceptions
- [x] Standardize `DbService` return types
- [x] Add `@ApiResponse` / `@ApiBearerAuth()` on protected routes in Swagger

## Roles (P2)
- [x] `GET /roles` — list available roles
- [x] `GET /roles/:id/permissions` — list role permissions

## Previously Done
- [x] Register controller
- [x] Login controller
- [x] Access + refresh token rotation
- [x] Configure BullMQ and Redis
- [x] Swagger API docs at `/api`
- [x] Refresh route with cookie-based token lookup
- [x] Refresh token hash validation against Redis
- [x] Session activeness check on refresh
- [x] Invite member endpoint
- [x] Check if invitee exists in DB before inviting
- [x] JWT-based invitation link generation
- [x] Invitation email via BullMQ + Nodemailer
- [x] RBAC guard pipeline (AccessToken → Membership → Permission)
- [x] Roles + permissions seed data
- [x] Organization creation with OWNER membership
- [x] Audit log on invitation sent
- [x] Invitations table in Prisma schema
- [x] Production README.md with architecture docs
