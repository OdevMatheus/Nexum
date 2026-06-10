# Nexum Backend API

**The core engine of Nexum. A high-performance Java 25 + Spring Boot 4.0.6 REST API managing subscription lifecycles, metrics compilation, and transactional event streams.**

[![Java Version](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Cache-red?style=for-the-badge&logo=redis)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Messaging-black?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org)

---

## 🏗️ Architecture & Core Concepts

The backend acts as a modular monolith organized around clear domains, fully decoupled using an event-driven architecture with **Apache Kafka**.

```
com.matheushenrique.nexum/
├── config/             # Global configurations (CORS, Security, Flyway, Swagger)
├── controllers/        # REST Endpoints (Auth, Client, Plan, Subscription, Metrics)
├── dtos/               # Immutable Data Transfer Objects (using Java records)
│   ├── request/
│   └── response/
├── entities/           # JPA Entities (using standard classes and Lombok)
├── messaging/          # Kafka Event Producers, Consumers, and Event payloads
├── repositories/       # JpaRepository definitions and custom JPQL/SQL specifications
└── services/           # Business logic interfaces & implementation layers
```

### 1. Subscription Lifecycle Machine
The subscription core uses a deterministic state-machine handling transition phases:
- `TRIAL` ➜ `ACTIVE` (Trial finishes)
- `ACTIVE` ➜ `OVERDUE` (Unpaid invoice)
- `OVERDUE` ➜ `SUSPENDED` (Grace period expired)
- `SUSPENDED` ➜ `ACTIVE` (Manual/automatic payment received)
- `SUSPENDED` / `ACTIVE` ➜ `CANCELLED` (Subscription cancellation)
- `CANCELLED` ➜ `REACTIVATED` (Subscription reactivation)

*Note:* When a payment is processed (`/pay`), the next due date is recalculated from **today** (`LocalDate.now()`) to prevent accumulation of past overdue cycles.

### 2. Security & JWT Session Protocol
- **Library:** JJWT 0.12.6 (HS512 algorithm).
- **Subject:** Explicit user `id` (UUID) - never the email address, ensuring safety against email changes.
- **Refresh Token Rotation:** Refresh tokens are persisted in the PostgreSQL database for security revocation and rotated on every single use.

---

## 🚀 Setup & Execution

### Prerequisites
- **JDK 25** (Ensure `JAVA_HOME` points to a Java 25 SDK)
- **Maven** (Optional; the project includes a Maven wrapper `mvnw`)
- Running infrastructure services (PostgreSQL, Redis, Kafka) - See the [docker](../docker/README.md) module.

### 1. Environment Configuration
Create a `.env` file in this directory (`backend/.env`):
```env
JWT_SECRET=your_jwt_secret_key_minimum_512_bits_long
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
APP_BASE_URL=http://localhost:8080
```

### 2. Compilation and Run
To compile and start the development server:
```powershell
.\mvnw clean compile
.\mvnw spring-boot:run
```

Once running, the API is accessible at `http://localhost:8080`.
The OpenAPI/Swagger UI is accessible at `http://localhost:8080/swagger-ui/index.html`.

---

## 🧪 Testing Suite

Nexum values high-quality validation. The backend comprises unit tests and integration tests.

### Integration Tests with Testcontainers
Integration tests extend `IntegrationTestBase` and use **Testcontainers** to orchestrate ephemeral instances of **PostgreSQL 16** and **Apache Kafka**. This guarantees that tests execute in environments identical to production without polluting local development databases.

To run the test suite:
```powershell
.\mvnw test
```

---

## 📁 Database Schema & Flyway Migrations
Database schemas are managed incrementally via **Flyway**.
Due to custom autoconfiguration, migrations are orchestrated through `FlywayConfig.java`.
SQL files are located under `src/main/resources/db/migration/`:
- `V1__init.sql` — Inception base structure
- `V2__create_users.sql` — Users and credentials
- `V3__create_clients.sql` — B2B clients
- `V4__add_owner_to_clients.sql` — Client ownership relations
- `V5__create_plans.sql` — Subscription plans
- `V6__create_subscriptions.sql` — Subscriptions and cycles
- `V7__create_notifications.sql` — Audit/notification logs
