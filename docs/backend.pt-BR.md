# Nexum Backend API (Português)

**O motor principal do Nexum. Uma API REST de alta performance desenvolvida em Java 25 + Spring Boot 4.0.6 que gerencia os ciclos de vida de assinaturas, compilação de métricas e fluxos transacionais de eventos.**

[![Java Version](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Cache-red?style=for-the-badge&logo=redis)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Mensageria-black?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org)

---

## 🏗️ Arquitetura e Conceitos Principais

O backend funciona como um monólito modular organizado em torno de domínios claros, totalmente desacoplado usando uma arquitetura orientada a eventos através do **Apache Kafka**.

```
com.matheushenrique.nexum/
├── config/             # Configurações globais (CORS, Segurança, Flyway, Swagger)
├── controllers/        # Endpoints REST (Auth, Client, Plan, Subscription, Metrics)
├── dtos/               # Objetos de Transferência de Dados Imutáveis (Java records)
│   ├── request/
│   └── response/
├── entities/           # Entidades JPA (utilizando classes padrão e Lombok)
├── messaging/          # Produtores, Consumidores e payloads de eventos do Kafka
├── repositories/       # Definições de JpaRepository e queries JPQL/SQL customizadas
└── services/           # Interfaces de lógica de negócios e camadas de implementação
```

### 1. Máquina de Estados do Ciclo de Vida de Assinaturas
O núcleo do faturamento usa uma máquina de estados determinística para lidar com as fases de transição:
- `TRIAL` ➜ `ACTIVE` (Fim do período de avaliação)
- `ACTIVE` ➜ `OVERDUE` (Fatura não paga no vencimento)
- `OVERDUE` ➜ `SUSPENDED` (Excedido o prazo de tolerância)
- `SUSPENDED` ➜ `ACTIVE` (Pagamento manual ou automático recebido)
- `SUSPENDED` / `ACTIVE` ➜ `CANCELLED` (Assinatura cancelada)
- `CANCELLED` ➜ `REACTIVATED` (Assinatura reativada)

*Nota:* Quando um pagamento é processado (`/pay`), o próximo vencimento é recalculado a partir de **hoje** (`LocalDate.now()`) para evitar o acúmulo de cobranças passadas atrasadas.

### 2. Segurança e Protocolo de Sessão JWT
- **Biblioteca:** JJWT 0.12.6 (algoritmo HS512).
- **Assunto (Subject):** `id` (UUID) do usuário de forma explícita — nunca o e-mail, protegendo o sistema contra alterações de e-mail do usuário.
- **Rotação de Refresh Tokens:** Os refresh tokens são salvos no banco de dados PostgreSQL para revogação de segurança e são rotacionados a cada uso único.

---

## 🚀 Configuração e Execução

### Pré-requisitos
- **JDK 25** (Garanta que a variável `JAVA_HOME` aponte para o SDK do Java 25)
- **Maven** (Opcional; o projeto inclui o wrapper do Maven `mvnw`)
- Serviços de infraestrutura rodando (PostgreSQL, Redis, Kafka) — Veja o módulo [docker](../docker/README.md).

### 1. Configuração do Ambiente
Crie um arquivo `.env` dentro do diretório `backend/` (`backend/.env`):
```env
JWT_SECRET=your_jwt_secret_key_minimum_512_bits_long
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
APP_BASE_URL=http://localhost:8080
```

### 2. Compilação e Execução
Para compilar e iniciar o servidor de desenvolvimento:
```powershell
.\mvnw clean compile
.\mvnw spring-boot:run
```

Depois de iniciado, a API REST estará disponível em `http://localhost:8080`.
O console OpenAPI/Swagger UI estará disponível em `http://localhost:8080/swagger-ui/index.html`.

---

## 🧪 Suíte de Testes

O Nexum preza pela qualidade e consistência. O backend é composto por testes unitários e testes de integração.

### Testes de Integração com Testcontainers
Os testes de integração estendem a classe `IntegrationTestBase` e usam o **Testcontainers** para subir e gerenciar instâncias efêmeras e reais de **PostgreSQL 16** e **Apache Kafka**. Isso garante que os testes sejam executados em ambientes idênticos aos de produção, sem poluir os bancos de dados locais.

Para executar toda a suíte de testes:
```powershell
.\mvnw test
```

---

## 📁 Esquema do Banco de Dados e Migrações Flyway
O esquema de banco de dados é gerenciado incrementalmente via **Flyway**.
Devido a autoconfigurações manuais, as migrações são orquestradas por `FlywayConfig.java`.
Os scripts SQL de migração ficam sob `src/main/resources/db/migration/`:
- `V1__init.sql` — Estrutura base de criação
- `V2__create_users.sql` — Usuários e credenciais
- `V3__create_clients.sql` — Clientes corporativos B2B
- `V4__add_owner_to_clients.sql` — Relação de proprietário (owner) de clientes
- `V5__create_plans.sql` — Planos de assinatura
- `V6__create_subscriptions.sql` — Assinaturas e ciclos de faturamento
- `V7__create_notifications.sql` — Logs de auditoria e notificações
