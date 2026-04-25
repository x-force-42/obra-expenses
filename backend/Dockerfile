FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw -B -Dmaven.test.skip=true dependency:go-offline

COPY src/ src/

RUN ./mvnw -B -Dmaven.test.skip=true package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /workspace/target/obra-expenses-*.jar /app/app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:-} -jar /app/app.jar"]
