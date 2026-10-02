package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

/**
 * Local web server for the CALC learning UI — uses only the JDK's built-in HTTP server.
 *
 *   java -cp out server.WebServer [port] [ui-folder]
 *
 *   GET  /          → static files from the ui/ folder
 *   POST /api/run   → body is CALC source, response is RunService JSON
 *
 * Environment variables (used when deployed, e.g. on Render):
 *   PORT          port to listen on when no [port] argument is given (default 8080)
 *   BIND_ADDRESS  address to listen on (default 127.0.0.1 — this machine only)
 */
public class WebServer {

    private static final int MAX_SOURCE_BYTES = 64 * 1024;

    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();
    static {
        CONTENT_TYPES.put("html", "text/html; charset=utf-8");
        CONTENT_TYPES.put("css",  "text/css; charset=utf-8");
        CONTENT_TYPES.put("js",   "text/javascript; charset=utf-8");
        CONTENT_TYPES.put("json", "application/json; charset=utf-8");
        CONTENT_TYPES.put("svg",  "image/svg+xml");
        CONTENT_TYPES.put("png",  "image/png");
        CONTENT_TYPES.put("ico",  "image/x-icon");
    }

    public static void main(String[] args) throws IOException {
        String portText = args.length > 0 ? args[0] : System.getenv().getOrDefault("PORT", "8080");
        int port = 8080;
        try {
            port = Integer.parseInt(portText.trim());
        } catch (NumberFormatException e) {
            System.err.println("Port must be a number, but got '" + portText + "'");
            System.exit(1);
        }
        String bindAddress = System.getenv().getOrDefault("BIND_ADDRESS", "127.0.0.1");
        Path root = Paths.get(args.length > 1 ? args[1] : "ui").toAbsolutePath().normalize();

        if (!Files.isDirectory(root)) {
            System.err.println("UI folder not found: " + root);
            System.err.println("Run this command from the project root folder.");
            System.exit(1);
        }

        // Localhost only by default. CALC programs can't touch files or the network, and every run is
        // capped (loop iterations, output, source size), so listening publicly is safe when deployed.
        HttpServer server;
        try {
            server = HttpServer.create(new InetSocketAddress(bindAddress, port), 0);
        } catch (BindException e) {
            System.err.println("Port " + port + " is already in use. Try another one, e.g. 8081.");
            System.exit(1);
            return;
        }
        server.createContext("/api/run", WebServer::handleRun);
        server.createContext("/", exchange -> serveStatic(exchange, root));
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();

        if (bindAddress.equals("127.0.0.1") || bindAddress.equals("localhost")) {
            System.out.println("CALC UI running at http://localhost:" + port);
            System.out.println("Press Ctrl+C to stop.");
        } else {
            System.out.println("CALC UI listening on " + bindAddress + ":" + port);
        }
    }

    private static void handleRun(HttpExchange exchange) throws IOException {
        try {
            if (!"POST".equals(exchange.getRequestMethod())) {
                send(exchange, 405, "application/json; charset=utf-8", "{\"message\":\"Use POST\"}");
                return;
            }
            byte[] body = readLimited(exchange.getRequestBody(), MAX_SOURCE_BYTES);
            if (body == null) {
                send(exchange, 413, "application/json; charset=utf-8",
                        "{\"message\":\"Program is too large (limit is 64 KB)\"}");
                return;
            }
            String source = new String(body, StandardCharsets.UTF_8);
            send(exchange, 200, "application/json; charset=utf-8", RunService.run(source));
        } finally {
            exchange.close();
        }
    }

    private static void serveStatic(HttpExchange exchange, Path root) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            if (!"GET".equals(method) && !"HEAD".equals(method)) {
                send(exchange, 405, "text/plain; charset=utf-8", "Method not allowed");
                return;
            }
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";

            Path file = root.resolve(path.substring(1)).normalize();
            if (!file.startsWith(root) || !Files.isRegularFile(file)) {
                send(exchange, 404, "text/plain; charset=utf-8", "Not found");
                return;
            }

            String name = file.getFileName().toString();
            String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1) : "";
            byte[] bytes = Files.readAllBytes(file);

            exchange.getResponseHeaders().set("Content-Type",
                    CONTENT_TYPES.getOrDefault(ext, "application/octet-stream"));
            exchange.getResponseHeaders().set("Cache-Control", "no-store");
            if ("HEAD".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
            } else {
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(bytes);
                }
            }
        } finally {
            exchange.close();
        }
    }

    /** Reads at most {@code limit} bytes; returns null if the body is larger. */
    private static byte[] readLimited(InputStream in, int limit) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int read;
        while ((read = in.read(chunk)) != -1) {
            buffer.write(chunk, 0, read);
            if (buffer.size() > limit) return null;
        }
        return buffer.toByteArray();
    }

    private static void send(HttpExchange exchange, int status, String contentType, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }
}
