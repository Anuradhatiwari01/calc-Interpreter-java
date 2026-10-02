# CALC learning UI — container image for deployment (e.g. Render).
#
#   docker build -t calc-learn .
#   docker run --rm -p 8080:10000 calc-learn     → http://localhost:8080

# ─── Stage 1: compile and test ───────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY src ./src
COPY test ./test
COPY samples ./samples

# Run the test suite first; a failing test stops the deploy
RUN javac --release 11 -d test-build $(find src test -name "*.java") \
 && java -cp test-build InterpreterTest

# Compile the application on its own, without the test classes
RUN javac --release 11 -d out $(find src -name "*.java")

# ─── Stage 2: small runtime image ────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/out ./out
COPY ui ./ui

# Run as an unprivileged user
RUN useradd --system --no-create-home calc
USER calc

# Listen on all interfaces inside the container; hosts like Render set PORT themselves
ENV BIND_ADDRESS=0.0.0.0 \
    PORT=10000
EXPOSE 10000

# Keep the heap well inside a 512 MB free-tier instance
CMD ["java", "-XX:MaxRAMPercentage=60", "-XX:+UseSerialGC", "-cp", "out", "server.WebServer"]
