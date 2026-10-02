package server;

import ast.TreeNode;
import environment.Environment;
import instruction.Instruction;
import parser.Parser;
import tokenizer.CalcException;
import tokenizer.Token;
import tokenizer.Tokenizer;

import java.util.ArrayList;
import java.util.List;

/**
 * Runs a CALC program for the web UI and reports every pipeline stage as JSON:
 *
 *   { "output": [...], "truncated": false,
 *     "error":  { "phase": "PARSER", "line": 2, "message": "...", "text": "[PARSER ERROR] Line 2: ..." } | null,
 *     "tokens": [ { "type": "IDENTIFIER", "value": "x", "line": 1 }, ... ] | null,
 *     "tree":   { "label": "Program", "children": [...] } | null }
 *
 * Same pipeline as Interpreter, but each stage's result is kept so the UI can show it.
 */
public final class RunService {

    static final long MAX_LOOP_STEPS   = 1_000_000;
    static final int  MAX_OUTPUT_LINES = 5_000;

    private RunService() {}

    public static String run(String source) {
        List<String> output = new ArrayList<>();
        boolean[] truncated = { false };
        List<Token> tokens = null;
        List<Instruction> program = null;
        String error = null;

        try {
            tokens = new Tokenizer(source).tokenize();
            program = new Parser(tokens).parse();

            Environment env = new Environment(line -> {
                if (output.size() < MAX_OUTPUT_LINES) output.add(line);
                else truncated[0] = true;
            }, MAX_LOOP_STEPS);
            for (Instruction instruction : program) {
                instruction.execute(env);
            }
        } catch (CalcException e) {
            error = errorJson(e.getPhase().name(), e.getLine(), e.getMessage(), e.toString());
        } catch (StackOverflowError e) {
            error = errorJson("PARSER", 0, "Program is nested too deeply", "[PARSER ERROR] Program is nested too deeply");
        } catch (RuntimeException e) {
            error = errorJson("INTERNAL", 0, String.valueOf(e), "[INTERNAL ERROR] " + e);
        }

        StringBuilder json = new StringBuilder("{\"output\":[");
        for (int i = 0; i < output.size(); i++) {
            if (i > 0) json.append(',');
            json.append(Json.string(output.get(i)));
        }
        json.append("],\"truncated\":").append(truncated[0]);
        json.append(",\"error\":").append(error == null ? "null" : error);
        json.append(",\"tokens\":").append(tokens == null ? "null" : tokensJson(tokens));
        json.append(",\"tree\":");
        if (program == null) {
            json.append("null");
        } else {
            appendTree(json, new TreeNode("Program", Instruction.toTrees(program)));
        }
        return json.append('}').toString();
    }

    private static String errorJson(String phase, int line, String message, String text) {
        return "{\"phase\":" + Json.string(phase)
                + ",\"line\":" + line
                + ",\"message\":" + Json.string(message)
                + ",\"text\":" + Json.string(text) + "}";
    }

    private static String tokensJson(List<Token> tokens) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < tokens.size(); i++) {
            Token t = tokens.get(i);
            if (i > 0) sb.append(',');
            sb.append("{\"type\":").append(Json.string(t.getType().name()))
              .append(",\"value\":").append(Json.string(t.getValue()))
              .append(",\"line\":").append(t.getLine()).append('}');
        }
        return sb.append(']').toString();
    }

    private static void appendTree(StringBuilder sb, TreeNode node) {
        sb.append("{\"label\":").append(Json.string(node.getLabel())).append(",\"children\":[");
        List<TreeNode> children = node.getChildren();
        for (int i = 0; i < children.size(); i++) {
            if (i > 0) sb.append(',');
            appendTree(sb, children.get(i));
        }
        sb.append("]}");
    }
}
