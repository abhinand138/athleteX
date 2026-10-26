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

# Create athletex group/user and pre-create uploads directory with proper ownership
RUN addgroup -S athletex && adduser -S athletex -G athletex && \
    mkdir -p /app/uploads && \
    chown -R athletex:athletex /app

# Copy compiled JAR artifact from builder stage with athletex ownership
COPY --from=builder --chown=athletex:athletex /app/target/athletex-backend-0.0.1-SNAPSHOT.jar app.jar

USER athletex:athletex

# Expose backend port
EXPOSE 8080

# Environment defaults
ENV PORT=8080

# Launch Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
