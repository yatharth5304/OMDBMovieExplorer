# ─── Stage 1: Build ─────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and POM first (layer cache: deps only re-downloaded when pom.xml changes)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Fix line endings on the Maven wrapper (Windows CRLF → LF for Linux build)
RUN sed -i 's/\r//' mvnw && chmod +x mvnw

# Download dependencies in a separate layer for better caching
RUN ./mvnw dependency:go-offline -B -q

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests -B -q

# ─── Stage 2: Runtime ───────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

# Render injects PORT at runtime; default 8080 for local runs
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
