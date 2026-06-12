# Estagio 1 - Build do Frontend (React)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Estagio 2 - Build do Spring Boot
FROM eclipse-temurin:25-jdk-alpine AS backend-builder
WORKDIR /app
COPY backend/mvnw ./
COPY backend/.mvn/ ./.mvn/
COPY backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY backend/src/ ./src/
# Injeta o static do React nos recursos do Spring
COPY --from=frontend-builder /app/dist/ ./src/main/resources/static/
# Empacota o JAR unificado
RUN ./mvnw clean package -DskipTests -B

# Estagio 3 - Imagem de execucao (JRE 25)
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app
COPY --from=backend-builder /app/target/nexum-*.jar ./nexum.jar
EXPOSE 8080
ENV PORT=8080
# Executa o JAR unificado
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "nexum.jar"]