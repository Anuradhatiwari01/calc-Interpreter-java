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

    private Instruction parseAssign() {
        Token nameToken = advance(); // consume variable name (IDENTIFIER)

        // ensure assignment operator is present
        expect(TokenType.ASSIGN,
                "Expected ':=' after variable name '" + nameToken.getValue() + "'");

        Expression expr = parseExpression(); // parse right-hand expression

        return new AssignInstruction(nameToken.getValue(), expr);
    }

    private Instruction parsePrint() {
        advance(); // consume PRINT token (>>)

        Expression expr = parseExpression(); // expression to print

        return new PrintInstruction(expr);
    }

    private Instruction parseIf() {
        advance(); // consume IF token (?)

        Expression condition = parseComparison(); // parse condition

        expect(TokenType.ARROW, "Expected '=>' after condition in '?'");

        // skip optional newlines before block starts
        while (check(TokenType.NEWLINE)) advance();

        List<Instruction> body = parseBlock(); // parse body instructions

        return new IfInstruction(condition, body);
    }

    private Instruction parseLoop() {
        advance(); // consume LOOP token (@)

        // get loop count
        Token countToken = expect(TokenType.NUMBER,
                "Expected a number after '@'");
        int count = (int) Double.parseDouble(countToken.getValue());

        expect(TokenType.ARROW, "Expected '=>' after loop count");

        // skip optional newlines before block
        while (check(TokenType.NEWLINE)) advance();

        List<Instruction> body = parseBlock(); // loop body

        return new RepeatInstruction(count, body);
    }

    private List<Instruction> parseBlock() {
        List<Instruction> body = new ArrayList<>();

        // keep parsing instructions until block ends
        while (!check(TokenType.EOF) && isStartOfInstruction()) {
            body.add(parseInstruction());

            // skip extra newlines between instructions
            while (check(TokenType.NEWLINE)) advance();
        }

        return body;
    }

    private boolean isStartOfInstruction() {
        // checks if current token can begin a valid instruction
        switch (peek().getType()) {
            case IDENTIFIER: // assignment
            case PRINT:      // >>
            case IF:         // ?
            case LOOP:       // @
                return true;
            default:
                return false;
        }
    }
}