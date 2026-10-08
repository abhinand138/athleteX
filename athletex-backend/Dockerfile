# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies (for layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package jar (skipping test execution during docker build)
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java Runtime environment for production
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security compliance
RUN addgroup -S athletex && adduser -S athletex -G athletex
USER athletex:athletex

# Copy compiled JAR artifact from builder stage
COPY --from=builder /app/target/athletex-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose backend port
EXPOSE 8080

# Environment defaults
ENV PORT=8080

# Launch Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
