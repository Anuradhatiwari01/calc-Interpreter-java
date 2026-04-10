package main.java.calc.interpreter.parser;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Step 2 of pipeline: converts List<Token> into List<Instruction>
public class Parser {

    private final List<Token> tokens;
    private int current;

    public Parser(List<Token> tokens) {
        this.tokens  = tokens;
        this.current = 0;
    }

    // Returns unmodifiable instruction list
    public List<Instruction> parse() {
        List<Instruction> instructions = new ArrayList<>();

        skipNewlines();

        while (!check(TokenType.EOF)) {
            instructions.add(parseInstruction());
            while (check(TokenType.NEWLINE)) advance();
        }

        return Collections.unmodifiableList(instructions);
    }

    private Token peek()                  { return tokens.get(current);   }
    private Token advance()               { return tokens.get(current++); }
    private boolean check(TokenType type) { return peek().isType(type);   }


    // Consumes required token or throws with clear error
    private Token expect(TokenType type, String message) {
        if (check(type)) return advance();
        Token bad = peek();
        throw new CalcException(
                CalcException.Phase.PARSER,
                bad.getLine(),
                message + " — got '" + bad.getValue() + "' (" + bad.getType() + ")"
        );
    }

    private void skipNewlines() {
        while (check(TokenType.NEWLINE)) advance();
    }

    // Dispatches to correct instruction parser based on current token
    private Instruction parseInstruction() {
        Token t = peek();

        switch (t.getType()) {
            case IDENTIFIER: return parseAssign();
            case PRINT:      return parsePrint();
            case IF:         return parseIf();
            case LOOP:       return parseLoop();
            default:
                throw new CalcException(
                        CalcException.Phase.PARSER,
                        t.getLine(),
                        "Unexpected token '" + t.getValue() + "'"
                                + " — expected a variable name, >>, ?, or @"
                );
        }
    }

    // x := <expression>
    private Instruction parseAssign() {
        Token nameToken = advance();
        expect(TokenType.ASSIGN,
                "Expected ':=' after variable name '" + nameToken.getValue() + "'");
        return new AssignInstruction(nameToken.getValue(), parseExpression());
    }

    // >> <expression>
    private Instruction parsePrint() {
        advance();
        return new PrintInstruction(parseExpression());
    }

    // ? <condition> => <body>
    private Instruction parseIf() {
        advance();
        Expression condition = parseComparison();
        expect(TokenType.ARROW, "Expected '=>' after condition");
        while (check(TokenType.NEWLINE)) advance();
        return new IfInstruction(condition, parseBlock());
    }

    // @ <number> => <body>
    private Instruction parseLoop() {
        advance();
        Token countToken = expect(TokenType.NUMBER, "Expected a number after '@'");
        int count = (int) Double.parseDouble(countToken.getValue());
        expect(TokenType.ARROW, "Expected '=>' after loop count");
        while (check(TokenType.NEWLINE)) advance();
        return new RepeatInstruction(count, parseBlock());
    }

    // Reads instructions until EOF or non-instruction token (end of block)
    private List<Instruction> parseBlock() {
        List<Instruction> body = new ArrayList<>();
        while (!check(TokenType.EOF) && isStartOfInstruction()) {
            body.add(parseInstruction());
            while (check(TokenType.NEWLINE)) advance();
        }
        return body;
    }

    private boolean isStartOfInstruction() {
        switch (peek().getType()) {
            case IDENTIFIER: case PRINT: case IF: case LOOP: return true;
            default: return false;
        }
    }

    // Expression precedence chain: parseComparison → parseExpression → parseTerm → parsePrimary

    private Expression parseComparison() {
        Expression left = parseExpression();
        if (check(TokenType.GREATER) || check(TokenType.LESS) || check(TokenType.EQUAL_EQUAL)) {
            String op = advance().getValue();
            return new BinaryOpNode(left, op, parseExpression());
        }
        return left;
    }

    // Handles + and - (lowest precedence)
    private Expression parseExpression() {
        Expression left = parseTerm();
        while (check(TokenType.PLUS) || check(TokenType.MINUS)) {
            String op = advance().getValue();
            left = new BinaryOpNode(left, op, parseTerm());
        }
        return left;
    }

    // Handles * and / (higher precedence than + and -)
    private Expression parseTerm() {
        Expression left = parsePrimary();
        while (check(TokenType.STAR) || check(TokenType.SLASH)) {
            String op = advance().getValue();
            left = new BinaryOpNode(left, op, parsePrimary());
        }
        return left;
    }

    // Base case — returns a single leaf node
    private Expression parsePrimary() {
        Token t = peek();
        switch (t.getType()) {
            case NUMBER:
                advance();
                return new NumberNode(Double.parseDouble(t.getValue()));
            case STRING:
                advance();
                return new StringNode(t.getValue());
            case IDENTIFIER:
                advance();
                return new VariableNode(t.getValue());
            default:
                throw new CalcException(
                        CalcException.Phase.PARSER,
                        t.getLine(),
                        "Expected a value (number, string, or variable name)"
                                + " but got '" + t.getValue() + "' (" + t.getType() + ")"
                );
        }
    }
}