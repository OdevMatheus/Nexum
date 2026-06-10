# Infraestrutura Local Nexum (Docker Compose)

**Uma suíte de infraestrutura conteinerizada sob medida para o desenvolvimento local. Orquestra o PostgreSQL como banco de dados principal, Redis para cache/gerenciamento ativo de tokens e Apache Kafka para envio de mensagens orientadas a eventos.**

[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-blue?style=for-the-badge&logo=docker)](https://www.docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Active-red?style=for-the-badge&logo=redis)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Mensageria-black?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org)

---

## 📦 Detalhamento de Serviços

A infraestrutura está definida em `docker-compose.yml` e está pré-configurada com as portas, usuários e redes necessárias para se integrar automaticamente com o backend do Nexum.

| Serviço | Porta | Alias de Rede Interno | Objetivo |
|---|---|---|---|
| **PostgreSQL 16** | `5432` | `nexum-postgres` | Banco de dados relacional principal para sessões de usuário, ciclos de faturamento e transações. |
| **Redis** | `6379` | `nexum-redis` | Camada de cache para refresh tokens JWT e validações de alta frequência. |
| **Apache Kafka** | `9092` | `nexum-kafka` | Barramento de mensageria orientado a eventos, despachando mensagens para histórico de auditoria, métricas e estado de cobranças. |
| **Zookeeper** | `2181` | `nexum-zookeeper` | Serviço interno de coordenação exigido pelo container do Apache Kafka. |

---

## 🚀 Execução & Referência de Comandos

### Iniciando os Serviços
Para subir todos os recursos conteinerizados em segundo plano (detached), execute o seguinte comando no terminal dentro desta pasta (`docker/`):
```powershell
docker compose up -d
```

### Parando os Serviços
Para pausar os containers mantendo os volumes de dados salvos:
```powershell
docker compose stop
```

### Removendo os Serviços
Para remover completamente os containers, redes e estruturas efêmeras criadas:
```powershell
docker compose down
```

Para remover os containers e também apagar os volumes de dados do PostgreSQL/Kafka (realizando um reset completo do zero):
```powershell
docker compose down -v
```

---

## 🔒 Detalhes de Configuração

### Parâmetros de Conexão com o Banco de Dados
- **Host:** `localhost` (Alias interno: `nexum-postgres`)
- **Porta:** `5432`
- **Banco de Dados:** `nexum_db`
- **Usuário:** `nexum_user`
- **Senha:** `nexum_password`

### Alerta sobre Conflito de Portas
Se você tentar iniciar várias instâncias do Nexum na mesma máquina em diretórios diferentes, ou se tiver outros serviços locais rodando nas portas `5432`, `6379` ou `9092`, ocorrerão colisões de portas.
*Nota:* O script orquestrador unificado local (`run.cmd` localizado na raiz do projeto) detecta e resolve automaticamente essas colisões removendo preventivamente quaisquer containers Docker órfãos ou em conflito antes de iniciar.
