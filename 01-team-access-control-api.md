# Project 01 — Team Access Control API

| | |
|---|---|
| **Type** | Backend-only |
| **Difficulty** | Intermediate |
| **Database** | PostgreSQL + Redis |
| **Best for** | Strong beginners, college students, junior developers, or anyone with less than 3 years of experience who wants a practical SaaS foundation project |

## One-line summary

A backend that proves you understand authentication, authorization, team access, sessions, and secure API design — not just CRUD.

---

## What this project is

Build a small IAM-style (Identity and Access Management) backend for a SaaS product.

Your system should support:

- Users
- Organizations / workspaces
- Team memberships
- Roles
- Permissions
- Invitations
- Sessions
- Audit logs

Users can sign up, create an organization, invite teammates, assign roles, manage permissions, revoke sessions, and track sensitive actions through audit logs.

This is **not** a basic login/register tutorial project. It is the kind of backend foundation real SaaS products are built on.

---

## Why this project stands out

Most beginner portfolios stop at simple CRUD APIs. This project goes deeper into responsibilities that appear in almost every real product:

- Login and secure sessions
- Teams and workspaces
- Roles and permissions
- Invitations
- Session management
- Audit history
- Secure route protection

If you can build and explain this well, you have a strong base you can reuse in later projects.

---

## Recommended stack

- Node.js + TypeScript + Express or Fastify
- PostgreSQL for users, organizations, roles, permissions, sessions, audit logs
- Redis for rate limiting and session invalidation
- Prisma or Drizzle ORM
- JWT access token + refresh token rotation
- bcrypt or Argon2id password hashing
- Jest + Supertest for integration tests
- Swagger / OpenAPI documentation

## Alternative stacks

The backend framework is flexible. These also work well:

- NestJS + PostgreSQL
- Go + Chi/Fiber + PostgreSQL
- FastAPI + PostgreSQL
- Spring Boot + PostgreSQL

What matters most is proving auth, RBAC, permissions, sessions, audit logs, rate limiting, and secure API design — not the exact framework.

---

## Core requirements (MVP)

- [ ] User signup, login, logout
- [ ] Password hashing with bcrypt or Argon2
- [ ] JWT access token
- [ ] Refresh token rotation
- [ ] Store refresh token hashes, not raw tokens
- [ ] Organization / workspace creation
- [ ] Team membership
- [ ] Roles: owner, admin, member, viewer
- [ ] Permission table: `users.read`, `users.invite`, `projects.write`, `billing.read`
- [ ] Route-level permission guards
- [ ] Resource-level ownership checks
- [ ] Invite teammate with expiring invite token
- [ ] Accept invitation flow
- [ ] Session list
- [ ] Revoke session
- [ ] Audit log for login, invite, role change, permission change
- [ ] Rate limit auth routes
- [ ] Swagger / OpenAPI docs
- [ ] Integration tests for auth and permission failure cases

## Portfolio plus (optional)

- [ ] Password reset flow
- [ ] API keys for machine-to-machine access
- [ ] Soft delete users and organizations
- [ ] ABAC-style ownership rule
- [ ] Request ID middleware
- [ ] Structured errors
- [ ] Admin pagination and filtering
- [ ] Postman / Bruno collection

---

## Responsibilities you will learn

### Secure authentication

- Hash passwords
- Use short-lived access tokens
- Rotate refresh tokens
- Store refresh token hashes

### Authorization

- Role-based access control (RBAC)
- Permission guards
- Deny by default
- Resource ownership checks

### Multi-tenant data modeling

- Users
- Organizations
- Memberships
- Roles
- Permissions
- Sessions
- Invitations
- Audit logs

### Security and API discipline

- Rate limit auth routes
- Validate request DTOs with Zod or class-validator
- Never leak sensitive errors
- Use request IDs
- Log sensitive actions

### Testing and documentation

- Swagger / OpenAPI
- Integration tests
- Permission failure tests
- Postman / Bruno demo flow

### Frontend

No frontend is required for this project. Demo it with **Swagger**, **Postman**, or **Bruno**.

Suggested demo flow:

1. Signup
2. Create organization
3. Invite user
4. Assign role
5. Try protected endpoint → show allowed / blocked result
6. View audit logs

### DevOps (light)

- Docker Compose for PostgreSQL and Redis
- Environment variables
- Health check endpoint
- Local database migrations
- Seed demo roles and permissions

---

## Database choice

**PostgreSQL** is the right choice because this project is highly relational.

Expected tables:

- `users`
- `organizations`
- `memberships`
- `roles`
- `permissions`
- `role_permissions`
- `sessions`
- `invitations`
- `audit_logs`

PostgreSQL fits because roles, permissions, memberships, sessions, and audit logs need foreign keys, unique constraints, joins, indexes, and transactions.

**Redis** is used only for:

- Rate limiting
- Token / session invalidation
- Short-lived invite / session helper data (if needed)

---

## Key skills

Auth · RBAC · Permissions · Sessions · Audit Logs · Rate Limiting · API Docs · PostgreSQL

---

## What this proves to recruiters

If a recruiter sees this project, they know you understand the backend responsibilities behind real SaaS products: authentication, authorization, team access, secure sessions, audit trails, API design, and database modeling.

## Sample resume bullet

> Built a multi-tenant access-control API with JWT refresh rotation, RBAC permissions, invitation flow, Redis rate limiting, audit logs, Swagger docs, and integration tests.

---

## Portfolio checklist

Before calling this project done, aim to have:

- [ ] Deployed demo or clear local setup instructions
- [ ] README with architecture overview
- [ ] API documentation (Swagger or Postman collection)
- [ ] Integration tests
- [ ] Clear explanation of auth + permission flow
- [ ] At least one resume bullet you can defend in an interview
