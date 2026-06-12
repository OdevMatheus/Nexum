gemini --resume "98646a45-385d-42a9-928a-b7daa27b6a38"# Guia de Produção — Execução Unificada e Implantação (SaaS Nexum)

Este guia explica detalhadamente o funcionamento, a compilação e a execução do Nexum utilizando a **Abordagem de Empacotamento Unificado**. 

Nesta abordagem, todo o frontend React (SPA compilado estaticamente) é hospedado e servido de forma nativa pela instância do servidor Spring Boot no backend, unificando todo o sistema em um **único container de produção** ou **único arquivo `.jar` executável**.

---

## 🚀 Vantagens do Empacotamento Unificado

*   **Zero Complicações de CORS:** Como o frontend e os endpoints da API (`/v1/**`) compartilham exatamente o mesmo domínio e porta (`8080`), não há risco de bloqueio de CORS.
*   **Hospedagem Econômica:** Perfeito para portfólios, pois você só precisa subir um único container em plataformas de nuvem (como Render, Railway, fly.io ou VPS).
*   **Roteamento SPA Seguro:** O backend gerencia o roteamento de forma que se um usuário der F5/recarregar a tela em `/dashboard` ou `/settings`, o Spring Boot serve o `/index.html` e deixa o React Router assumir o fluxo, evitando erros 404.

---

## 🛠️ Pré-requisitos

Para rodar o projeto de forma completa, certifique-se de ter instalado:
*   [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
*   *Opcional (para compilação manual):* Java 25 JDK, Node.js (v20 ou superior) e Maven.

---

## 🐳 Método 1: Rodando via Docker (Recomendado e Rápido)

Este é o fluxo mais rápido e limpo para rodar o ecossistema completo em produção local ou em servidores de VPS.

### Passo 1: Compilar a Imagem Docker Unificada
Execute o comando abaixo na raiz do projeto para iniciar o pipeline multi-stage. O Docker compilará o React, injetará os arquivos estáticos dentro do Spring Boot e gerará uma imagem de produção enxuta baseada em **JRE 25 Alpine** com apenas **~172MB**:

```bash
docker build -t nexum:latest .
```

### Passo 2: Subir a Infraestrutura com Docker Compose
Para rodar o Nexum com seus serviços de banco, cache e mensageria integrados, certifique-se de que a infraestrutura local está ativa. Acesse o diretório `docker/` e execute:

```bash
cd docker
docker compose up -d
```

### Passo 3: Executar o Container Unificado
Para rodar o container unificado do Nexum conectado aos serviços locais criados pelo Docker Compose (usando a rede de rede padrão criada pelo Compose), execute:

```bash
docker run -d --name nexum-app \
  --network docker_default \
  -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://postgres:5432/nexum_db \
  -e DATABASE_USERNAME=nexum_user \
  -e DATABASE_PASSWORD=nexum_password \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:29092 \
  -e JWT_SECRET=sua_chave_secreta_jwt_de_pelo_menos_512_bits_de_comprimento_para_producao_segura \
  -e RESEND_API_KEY=re_sua_chave_resend \
  -e RESEND_FROM_EMAIL=onboarding@resend.dev \
  -e APP_BASE_URL=http://localhost:8080 \
  -e SEEDER_ENABLED=true \
  nexum:latest
```

*Nota: O parâmetro `--network docker_default` permite que o container do aplicativo se comunique diretamente com os containers de banco e mensageria usando os nomes dos serviços (`postgres`, `redis`, `kafka`) como hosts.*

---

## 💻 Método 2: Compilando e Rodando Manualmente (Sem Docker)

Se preferir rodar diretamente na sua máquina de desenvolvimento usando os binários locais instalados:

### Passo 1: Compilar o Frontend React
Navegue até a pasta do frontend, instale as dependências e gere o build de produção:
```bash
cd frontend
npm install
npm run build
```
Isso criará os arquivos estáticos compilados em `frontend/dist/`.

### Passo 2: Copiar os Ativos para o Backend
Crie a pasta de recursos estáticos no Spring Boot (caso não exista) e copie o build do React para lá:
```bash
mkdir -p ../backend/src/main/resources/static
cp -r dist/* ../backend/src/main/resources/static/
```

### Passo 3: Gerar o JAR Único do Backend
Volte à pasta raiz do monorepo, acesse a pasta do backend e execute o Maven para empacotar o projeto em um executável auto-contido:
```bash
cd ../backend
./mvnw clean package -DskipTests
```
Isso gerará o arquivo JAR sob `backend/target/nexum-0.0.1-SNAPSHOT.jar`.

### Passo 4: Executar a Aplicação
Certifique-se de preencher as variáveis de ambiente necessárias (como `JWT_SECRET`) e rode o executável:
```bash
# No Windows PowerShell:
$env:JWT_SECRET="sua_chave_secreta_jwt_de_pelo_menos_512_bits_de_comprimento_para_producao_segura"
$env:RESEND_API_KEY="re_sua_chave"
java -jar target/nexum-0.0.1-SNAPSHOT.jar
```

Acesse no seu navegador: **`http://localhost:8080`**. Todo o sistema estará ativo, unificado e respondendo nessa única URL!

---

## ⚙️ Variáveis de Ambiente Suportadas

O arquivo de configuração `application.yaml` do backend foi projetado para ler de forma dinâmica as seguintes chaves de ambiente:

| Variável | Descrição | Valor Padrão (Fallback Local) |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL JDBC de conexão com o PostgreSQL | `jdbc:postgresql://localhost:5432/nexum_db` |
| `DATABASE_USERNAME` | Usuário do banco de dados | `nexum_user` |
| `DATABASE_PASSWORD` | Senha do banco de dados | `nexum_password` |
| `REDIS_HOST` | Host do servidor Redis Cache | `localhost` |
| `REDIS_PORT` | Porta do servidor Redis Cache | `6379` |
| `REDIS_PASSWORD` | Senha de autenticação do Redis | *(Sem senha/vazio)* |
| `KAFKA_BOOTSTRAP_SERVERS` | Endereço do broker do Apache Kafka | `localhost:9092` |
| `JWT_SECRET` | Chave secreta de assinatura JWT (HS512) | *(Obrigatório em produção)* |
| `RESEND_API_KEY` | Chave de API para envio de e-mails via Resend | *(Obrigatório para e-mails)* |
| `RESEND_FROM_EMAIL` | Remetente dos e-mails disparados pelo sistema | `noreply@seudominio.com` |
| `APP_BASE_URL` | URL base do app para links de ativação | `http://localhost:8080` |
| `SEEDER_ENABLED` | Ativa a população de dados de teste ao iniciar | `false` (Segurança padrão) |
| `LOG_LEVEL` | Nível de logging da web e do Spring doc | `INFO` |
| `SHOW_SQL` | Imprime as queries SQL traduzidas no terminal | `false` (Otimização de performance) |
