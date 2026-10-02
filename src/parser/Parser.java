package parser;

import ast.*;
import instruction.*;
import tokenizer.CalcException;
import tokenizer.Token;
import tokenizer.TokenType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Parser — Step 2 of pipeline.
 *
 * Converts List<Token> into List<Instruction>.
 *
 * DESIGN PRINCIPLE: SRP
 *   Only responsible for syntactic analysis — turning a flat
 *   token stream into a structured instruction list.
 *
 * DESIGN PRINCIPLE: Dependency Inversion
 *   Returns List<Instruction> (interface) — the interpreter
 *   doesn't need to know which concrete instruction types exist.
 *
 * Blocks (body of ? and @):
 *   ? cond => >> "x"          one-line form — body is that single statement
 *   ? cond =>                 block form — body runs until a matching 'end'
 *       ...
 *   end
 *
 * Expression precedence (lowest → highest):
 *   parseComparison → parseExpression → parseTerm → parsePrimary
 */
public class Parser {

    private final List<Token> tokens;
    private int current;

    public Parser(List<Token> tokens) {
        this.tokens  = tokens;
        this.current = 0;
    }

    /** Returns an unmodifiable instruction list. */
    public List<Instruction> parse() {
        List<Instruction> instructions = new ArrayList<>();
        skipNewlines();
        while (!check(TokenType.EOF)) {
            if (check(TokenType.END)) {
                throw error(peek(), "'end' without a matching '?' or '@' block");
            }
            instructions.add(parseInstruction());
            expectEndOfStatement();
            skipNewlines();
        }
        return Collections.unmodifiableList(instructions);
    }

    // ─── Token navigation helpers ─────────────────────────────────────────────

    private Token   peek()                  { return tokens.get(current);   }
    private Token   advance()               { return tokens.get(current++); }
    private boolean check(TokenType type)   { return peek().isType(type);   }

    private Token expect(TokenType type, String message) {
        if (check(type)) return advance();
        throw error(peek(), message + ", but got " + describe(peek()));
    }

    private void skipNewlines() {
        while (check(TokenType.NEWLINE)) advance();
    }

    /** Every statement must be followed by a line break (or the end of the file). */
    private void expectEndOfStatement() {
        if (check(TokenType.NEWLINE)) { advance(); return; }
        if (check(TokenType.EOF)) return;
        throw error(peek(), "Unexpected " + describe(peek())
                + " — each statement must be on its own line");
    }

    private CalcException error(Token at, String message) {
        return new CalcException(CalcException.Phase.PARSER, at.getLine(), message);
    }

    private String describe(Token t) {
        switch (t.getType()) {
            case NEWLINE: return "end of line";
            case EOF:     return "end of file";
            case STRING:  return "\"" + t.getValue() + "\"";
            default:      return "'" + t.getValue() + "'";
        }
    }

    // ─── Instruction parsers ──────────────────────────────────────────────────

    private Instruction parseInstruction() {
        Token t = peek();
        switch (t.getType()) {
            case IDENTIFIER: return parseAssign();
            case PRINT:      return parsePrint();
            case IF:         return parseIf();
            case LOOP:       return parseLoop();
            default:
                throw error(t, "Unexpected " + describe(t)
                        + " — expected a variable name, >>, ?, or @");
        }
    }

    /** x := &lt;expression&gt; */
    private Instruction parseAssign() {
        Token nameToken = advance();
        expect(TokenType.ASSIGN, "Expected ':=' after variable name '" + nameToken.getValue() + "'");
        return new AssignInstruction(nameToken.getValue(), parseExpression());
    }

    /** &gt;&gt; &lt;expression&gt; */
    private Instruction parsePrint() {
        advance();
        return new PrintInstruction(parseExpression());
    }

    /** ? &lt;condition&gt; =&gt; &lt;body&gt; */
    private Instruction parseIf() {
        Token ifToken = advance();
        Expression condition = parseComparison();
        expect(TokenType.ARROW, "Expected '=>' after condition");
        return new IfInstruction(condition, parseBody(ifToken), ifToken.getLine());
    }

    /** @ &lt;number&gt; =&gt; &lt;body&gt; */
    private Instruction parseLoop() {
        Token loopToken = advance();
        Token countToken = expect(TokenType.NUMBER, "Expected a number after '@'");
        double rawCount = Double.parseDouble(countToken.getValue());
        if (rawCount != Math.floor(rawCount)) {
            throw error(countToken, "Loop count must be a whole number, but got " + countToken.getValue());
        }
        expect(TokenType.ARROW, "Expected '=>' after loop count");
        return new RepeatInstruction((int) rawCount, parseBody(loopToken), loopToken.getLine());
    }

    /** Body after '=>' — a one-line statement, or a multi-line block closed by 'end'. */
    private List<Instruction> parseBody(Token opener) {
        if (check(TokenType.NEWLINE)) {
            return parseBlock(opener);
        }
        if (check(TokenType.EOF)) {
            throw error(peek(), "Expected a statement after '=>'");
        }
        List<Instruction> body = new ArrayList<>();
        body.add(parseInstruction());
        return body;
    }

    private List<Instruction> parseBlock(Token opener) {
        List<Instruction> body = new ArrayList<>();
        skipNewlines();
        while (!check(TokenType.END)) {
            if (check(TokenType.EOF)) {
                throw error(opener, "Missing 'end' for the '" + opener.getValue()
                        + "' block started on line " + opener.getLine());
            }
            body.add(parseInstruction());
            expectEndOfStatement();
            skipNewlines();
        }
        advance(); // consume 'end'
        return body;
    }

    // ─── Expression parsers (precedence chain) ────────────────────────────────

    private Expression parseComparison() {
        Expression left = parseExpression();
        if (check(TokenType.GREATER) || check(TokenType.LESS) || check(TokenType.EQUAL_EQUAL)) {
            Token op = advance();
            return new BinaryOpNode(left, op.getValue(), parseExpression(), op.getLine());
        }
        return left;
    }

    /** Handles + and - (lowest precedence among arithmetic). */
    private Expression parseExpression() {
        Expression left = parseTerm();
        while (check(TokenType.PLUS) || check(TokenType.MINUS)) {
            Token op = advance();
            left = new BinaryOpNode(left, op.getValue(), parseTerm(), op.getLine());
        }
        return left;
    }

    /** Handles * and / (higher precedence than + and -). */
    private Expression parseTerm() {
        Expression left = parsePrimary();
        while (check(TokenType.STAR) || check(TokenType.SLASH)) {
            Token op = advance();
            left = new BinaryOpNode(left, op.getValue(), parsePrimary(), op.getLine());
        }
        return left;
    }

    /** Base case — returns a single leaf node. */
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
                return new VariableNode(t.getValue(), t.getLine());
            default:
                throw error(t, "Expected a value (number, string, or variable name), but got "
                        + describe(t));
        }
    }
}
