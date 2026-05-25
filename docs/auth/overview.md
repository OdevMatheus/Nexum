# Auth Module — Overview

## Stack

- Java 25 + Spring Boot 4.0.6
- Spring Security + JWT (JJWT 0.12.6)
- BCrypt (strength 12)
- Flyway + PostgreSQL
- Resend (email verification)

---

## Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/v1/auth/register` | Public | Register new user |
| `GET` | `/v1/auth/verify-email?token=` | Public | Verify email token |
| `POST` | `/v1/auth/login` | Public | Login and receive tokens |
| `POST` | `/v1/auth/refresh` | Public | Rotate refresh token |
| `POST` | `/v1/auth/logout` | Bearer | Invalidate refresh token |

---

## Flows

### Register
```
POST /v1/auth/register
  → validate input (Bean Validation)
  → email already verified? → 409 Conflict
  → email exists but unverified? → resend verification email
  → new user? → hash password (BCrypt) → save → send verification email
  → 201 Created
```

### Verify Email
```
GET /v1/auth/verify-email?token=
  → find user by token
  → token expired? → 403 Forbidden
  → mark email_verified = true → clear token
  → 200 OK
```

### Login
```
POST /v1/auth/login
  → find user by email
  → wrong password or user not found? → 401 Unauthorized (same message)
  → email not verified? → 403 Forbidden
  → generate accessToken (1h) + refreshToken (7d)
  → save refreshToken in database
  → 200 OK
```

### Refresh Token
```
POST /v1/auth/refresh
  → validate JWT signature
  → find user by userId from token
  → token mismatch or expired? → 403 Forbidden
  → rotate: generate new accessToken + refreshToken
  → save new refreshToken in database
  → 200 OK
```

### Logout
```
POST /v1/auth/logout (Bearer required)
  → extract userId from JWT
  → clear refreshToken from database
  → 200 OK
```

---

## Database Schema

```sql
users
  id                          UUID PRIMARY KEY
  name                        VARCHAR(255)
  email                       VARCHAR(255) UNIQUE
  password_hash               VARCHAR(255)
  email_verified              BOOLEAN DEFAULT FALSE
  email_verification_token    VARCHAR(255)
  email_token_expires_at      TIMESTAMPTZ
  refresh_token               VARCHAR(512)
  refresh_token_expires_at    TIMESTAMPTZ
  created_at                  TIMESTAMPTZ
  updated_at                  TIMESTAMPTZ
```

---

## Error Responses

| Status | When |
|--------|------|
| `400` | Validation error (missing/invalid fields) |
| `401` | Invalid credentials |
| `403` | Email not verified / invalid or expired token |
| `409` | Email already registered |
| `500` | Unexpected server error |

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Please verify your email before logging in",
  "timestamp": "2026-05-25T20:51:06.710Z"
}
```