#!/usr/bin/env sh
# Compiles CALC and starts the learning UI.  Usage: ./run-ui.sh [port]
cd "$(dirname "$0")" || exit 1
javac -d out $(find src -name "*.java") || exit 1
echo "Open http://localhost:${1:-8080} in your browser"
java -cp out server.WebServer "${1:-8080}"
