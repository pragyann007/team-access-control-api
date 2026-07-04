# Project 01 --- Team Access Control API

## Goal

Build a production-style backend for a multi-tenant SaaS platform
demonstrating authentication, authorization, session management,
invitations, audit logs, and secure API design.

## Tech Stack

-   Backend: NestJS
-   Database: PostgreSQL
-   ORM: Prisma
-   Cache: Redis
-   Queue: BullMQ
-   Auth: JWT (Access + Refresh)
-   Docs: Swagger

------------------------------------------------------------------------

# High Level Flow

1.  User registers.
2.  Password is hashed and stored.
3.  User logs in.
4.  Server issues:
    -   Short-lived Access Token
    -   Long-lived Refresh Token
5.  Access token is stored in frontend memory (Redux/Zustand/Application
    state).
6.  Refresh token is stored in an HttpOnly Secure Cookie.
7.  Refresh token hash is stored in PostgreSQL.
8.  Session metadata is stored.
9.  Redis stores active refresh/session data for fast validation and
    rotation.
10. User creates an Organization.
11. Creator automatically becomes Owner.
12. Owner invites users by email.
13. BullMQ queues email jobs.
14. Worker sends invitation email.
15. Invited user signs in (or signs up first).
16. User joins organization.
17. Owner/Admin assigns roles.
18. Permissions are checked on every protected request.
19. Audit logs record sensitive actions.

------------------------------------------------------------------------

# Authentication

## Register

-   Create user
-   Hash password (bcrypt/Argon2)
-   Store user

## Login

-   Verify password
-   Generate Access Token
-   Generate Refresh Token
-   Store refresh token hash
-   Create session
-   Save refresh token cookie

## Token Strategy

Access Token - 15 minutes - Stored in frontend memory

Refresh Token - 30 days - HttpOnly Cookie - Rotated on refresh - Hash
stored in DB

Redis - Active refresh token cache - Session lookup - Token blacklist -
Rate limiting

------------------------------------------------------------------------

# Organization Flow

User → Create Organization → Automatically becomes Owner → Invite
Members → Members Join → Assign Roles → Use Protected APIs

------------------------------------------------------------------------

# Invitation Flow

Owner → Create invitation → Save invitation → Push BullMQ job → Worker
sends email → User opens invite → Existing account? Join → New user?
Register then Join

------------------------------------------------------------------------

# RBAC Model

User → Membership → Role → Permissions → Allowed Actions

Permissions examples

-   users.read
-   users.invite
-   users.update
-   users.delete
-   projects.read
-   projects.create
-   projects.delete
-   billing.read
-   billing.update

------------------------------------------------------------------------

# Session Features

-   Multiple devices
-   Logout current device
-   Logout all devices
-   Session revoke
-   Refresh token rotation
-   Blacklist compromised sessions

------------------------------------------------------------------------

# Password Reset

Forgot Password → Generate token → Queue email → Send reset link →
Verify token → Update password → Invalidate sessions

------------------------------------------------------------------------

# Database Tables

## users

  Field
  -----------------
  id
  name
  email
  passwordHash
  isEmailVerified
  createdAt
  updatedAt

## organizations

  Field
  -----------
  id
  name
  slug
  ownerId
  createdAt

## memberships

  Field
  ----------------
  id
  userId
  organizationId
  roleId
  joinedAt

## roles

  Field
  -------------
  id
  name
  description

## permissions

  Field
  -------------
  id
  name
  description

## role_permissions

  Field
  --------------
  roleId
  permissionId

## sessions

  Field
  ------------------
  id
  userId
  refreshTokenHash
  device
  ipAddress
  userAgent
  expiresAt
  revokedAt

## invitations

  Field
  ----------------
  id
  organizationId
  email
  roleId
  tokenHash
  expiresAt
  acceptedAt

## password_reset_tokens

  Field
  -----------
  id
  userId
  tokenHash
  expiresAt

## audit_logs

  Field
  ----------------
  id
  userId
  organizationId
  action
  resource
  ipAddress
  userAgent
  createdAt

------------------------------------------------------------------------

# Modules

-   Auth
-   Users
-   Organizations
-   Invitations
-   Roles
-   Permissions
-   Sessions
-   Audit Logs
-   Mail
-   BullMQ

------------------------------------------------------------------------

# Build Order

1.  Auth
2.  JWT
3.  Sessions
4.  Organizations
5.  Invitations
6.  RBAC
7.  Password Reset
8.  Audit Logs
9.  BullMQ
10. Swagger
11. Tests
12. Deployment
