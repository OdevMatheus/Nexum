# Auth Module — Technical Decisions

## JWT

| Decision | Choice | Reason |
|----------|--------|--------|
| Library | JJWT 0.12.6 | Modern API — avoid 0.9.x found in outdated tutorials |
| Algorithm | HS512 | Strong symmetric signing, sufficient for single-service auth |
| Subject | `userId` (UUID) | Immutable identifier — email can change, UUID cannot |
| Access token expiration | 1 hour | Short-lived to limit exposure if leaked |
| Refresh token expiration | 7 days | Balances UX and security |
| Refresh token storage | Database | Enables server-side invalidation on logout |
| Refresh token rotation | Yes, every use | Prevents replay attacks — a stolen token works only once |

---

## Password

| Decision | Choice | Reason |
|----------|--------|--------|
| Algorithm | BCrypt | Native Spring Security support, industry standard |
| Strength | 12 | More secure than default (10), still fast enough (~300ms) |

---

## Security

| Decision | Choice | Reason |
|----------|--------|--------|
| Login error message | Same for wrong password and unknown email | Prevents user enumeration |
| Login before verification | Blocked with 403 | Standard SaaS behavior |
| Email verification expiration | 24 hours | Common industry standard |
| Re-register unverified email | Resend verification token | Better UX than returning error |

---

## Email

| Decision | Choice | Reason |
|----------|--------|--------|
| Provider | Resend | Simple REST API, generous free tier, great DX |
| Sending | Synchronous HTTP call | Simplified for current scope — `@Async` can be added later |
| From address | `onboarding@resend.dev` | Development only — replace with own domain in production |

---

## Infrastructure

| Decision | Choice | Reason |
|----------|--------|--------|
| Schema management | Flyway | Versioned, trackable migrations — Hibernate only validates |
| Flyway config | Manual bean (`FlywayConfig`) | Spring Boot 4 autoconfigure limitation |
| Environment variables | `springboot4-dotenv` + `.env` | Standard local development workflow |
| DTO format | Java `record` | Immutable, idiomatic modern Java — no Lombok needed |
| Entity format | Lombok `@Builder` class | JPA requires mutable class — records don't work with JPA |