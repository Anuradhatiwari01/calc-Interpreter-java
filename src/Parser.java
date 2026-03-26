import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Parser {

    private final List<Token> tokens;
    private int current;

    public Parser(List<Token> tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    /** @throws RuntimeException if the token stream is syntactically invalid */
    public List<Instruction> parse() {
        List<Instruction> instructions = new ArrayList<>();
        skipNewlines();
        while (!check(TokenType.EOF)) {
            instructions.add(parseInstruction());
            while (check(TokenType.NEWLINE)) advance();
        }
        return Collections.unmodifiableList(instructions);
    }

    // Check current token without consuming it
    private Token peek() {
        return tokens.get(current);
    }

    // Consume and return current token
    private Token advance() {
        return tokens.get(current++);
    }

    private boolean check(TokenType type) {
        return peek().getType() == type;
    }

    // Consume if matches, otherwise return false (use for optional tokens)
    private boolean match(TokenType type) {
        if (check(type)) { advance(); return true; }
        return false;
    }

    // Consume if matches, otherwise throw (use for required tokens)
    private Token expect(TokenType type, String message) {
        if (check(type)) return advance();
        Token bad = peek();
        throw new RuntimeException(
                "PARSER error on line " + bad.getLine()
                        + ": " + message
                        + " — got '" + bad.getValue()
                        + "' (" + bad.getType() + ")"
        );
    }

    private void skipNewlines() {
        while (check(TokenType.NEWLINE)) advance();
    }


    // Dispatch to correct instruction parser based on current token
    private Instruction parseInstruction() {
        Token t = peek();
        switch (t.getType()) {
            case IDENTIFIER: return parseAssign();
            case PRINT:      return parsePrint();
            case IF:         return parseIf();
            case LOOP:       return parseLoop();
            default:
                throw new RuntimeException(
                        "PARSER error on line " + t.getLine()
                                + ": Unexpected token '" + t.getValue() + "'"
                                + " — expected a variable name, >>, ?, or @"
                );
        }
    }
}