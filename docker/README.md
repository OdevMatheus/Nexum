# Nexum Local Infrastructure (Docker Compose)

**A containerized infrastructure suite tailored for local development. Orchestrates PostgreSQL as the primary database, Redis for active caching/token management, and Apache Kafka for event-driven message dispatching.**

[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-blue?style=for-the-badge&logo=docker)](https://www.docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Active-red?style=for-the-badge&logo=redis)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Messaging-black?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org)

---

## 📦 Services Breakdown

The infrastructure is defined inside `docker-compose.yml` and is pre-configured with the ports, users, and networks necessary to bind automatically with Nexum's backend.

| Service | Port | Internal Networking Alias | Purpose |
|---|---|---|---|
| **PostgreSQL 16** | `5432` | `nexum-postgres` | Primary relational database for user sessions, client cycles, and transactions. |
| **Redis** | `6379` | `nexum-redis` | Cache layer for JWT refresh tokens and high-frequency checks. |
| **Apache Kafka** | `9092` | `nexum-kafka` | Event-driven event bus dispatching messages for audit history, metrics, and billing state. |
| **Zookeeper** | `2181` | `nexum-zookeeper` | Internal coordination service required by the Apache Kafka container. |

---

## 🚀 Execution & Command Reference

### Starting Services
To spin up all containerized resources in background/detached mode, run the following command in your terminal from this folder (`docker/`):
```powershell
docker compose up -d
```

### Stopping Services
To stop running instances while retaining volume history:
```powershell
docker compose stop
```

To entirely tear down containers, networks, and ephemeral structures:
```powershell
docker compose down
```

To also delete local PostgreSQL/Kafka data volumes (performing a clean slate reset):
```powershell
docker compose down -v
```

---

## 🔒 Configuration Details

### Database Connection Parameters
- **Host:** `localhost` (Internal alias: `nexum-postgres`)
- **Port:** `5432`
- **Database:** `nexum_db`
- **Username:** `nexum_user`
- **Password:** `nexum_password`

### Conflict Resolution Warning
If you attempt to spin up multiple instances of Nexum on the same machine under different directories, or if other local services are running on ports `5432`, `6379`, or `9092`, port collisions will occur. 
*Note:* The unified local orchestrator (`run.cmd` at the root directory) automatically detects and resolves these collisions by preemptively removing any dead or colliding Docker containers before initiating.
