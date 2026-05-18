# 1. Aşama: Derleme (Build)
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Aşama: Çalıştırma (Run)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Sadece en alttaki ENTRYPOINT satırına -Xmx300m (Maksimum RAM) ayarını ekliyoruz:
ENTRYPOINT ["java", "-Xmx300m", "-Dspring.profiles.active=prod", "-jar", "app.jar"]