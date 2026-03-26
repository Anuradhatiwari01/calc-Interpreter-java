import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Tokenizer {
    private final String source;    
    private int pos;              
    private int line;               

    public Tokenizer(String source) {
        this.source = source;
        this.pos    = 0;
        this.line   = 1;
    }

    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();

        while (!isAtEnd()) {
            char c = advance();
            if (c == ' ' || c == '\t' || c == '\r') {
                continue;
            }

            if (c == '\n') {
                tokens.add(makeToken(TokenType.NEWLINE, "\\n"));
                line++;
                continue;
            }

            if (c == '#') {
                skipToEndOfLine();
                continue;
            }
            if (c == ':') { tokens.add(readAssign());      continue; }
            if (c == '>') { tokens.add(readGreaterOrPrint()); continue; }
            if (c == '=') { tokens.add(readArrowOrEquals()); continue; }

            if (c == '+') { tokens.add(makeToken(TokenType.PLUS,  "+")); continue; }
            if (c == '-') { tokens.add(makeToken(TokenType.MINUS, "-")); continue; }
            if (c == '*') { tokens.add(makeToken(TokenType.STAR,  "*")); continue; }
            if (c == '/') { tokens.add(makeToken(TokenType.SLASH, "/")); continue; }
            if (c == '<') { tokens.add(makeToken(TokenType.LESS,  "<")); continue; }
            if (c == '?') { tokens.add(makeToken(TokenType.IF,    "?")); continue; }
            if (c == '@') { tokens.add(makeToken(TokenType.LOOP,  "@")); continue; }

            if (c == '"') { tokens.add(readString()); continue; }
            if (Character.isDigit(c)) { tokens.add(readNumber(c)); continue; }
            if (Character.isLetter(c) || c == '_') {
                tokens.add(readIdentifier(c));
                continue;
            }
            throw new CalcException(
                CalcException.Phase.TOKENIZER, line,
                "Unexpected character '" + c + "'"
            );
        }
        tokens.add(makeToken(TokenType.EOF, ""));
        return Collections.unmodifiableList(tokens);
    }

    private boolean isAtEnd() {
        return pos >= source.length();
    }

    private char peek() {
        if (isAtEnd()) return '\0';
        return source.charAt(pos);
    }

    private char peekNext() {
        if (pos + 1 >= source.length()) return '\0';
        return source.charAt(pos + 1);
    }
    private char advance() {
        return source.charAt(pos++);
    }

    private void skipToEndOfLine() {
        while (!isAtEnd() && peek() != '\n') advance();
    }

    private Token makeToken(TokenType type, String value) {
        return new Token(type, value, line);
    }

    private Token readAssign() {
        if (!isAtEnd() && peek() == '=') {
            advance(); // consume '='
            return makeToken(TokenType.ASSIGN, ":=");
        }
        throw new CalcException(
            CalcException.Phase.TOKENIZER, line,
            "Expected '=' after ':' — did you mean ':='?"
        );
    }
    private Token readGreaterOrPrint() {
        if (!isAtEnd() && peek() == '>') {
            advance(); 
            return makeToken(TokenType.PRINT, ">>");
        }
        return makeToken(TokenType.GREATER, ">");
    }
    private Token readArrowOrEquals() {
        if (!isAtEnd() && peek() == '>') {
            advance(); // consume '>'
            return makeToken(TokenType.ARROW, "=>");
        }
        if (!isAtEnd() && peek() == '=') {
            advance(); // consume second '='
            return makeToken(TokenType.EQUAL_EQUAL, "==");
        }
        throw new CalcException(
            CalcException.Phase.TOKENIZER, line,
            "Unexpected '=' — use ':=' to assign, '=>' for blocks, '==' for equality"
        );
    }
    private Token readString() {
        StringBuilder sb = new StringBuilder();
        while (!isAtEnd() && peek() != '"') {
            if (peek() == '\n') line++; 
            sb.append(advance());
        }
        if (isAtEnd()) {
            throw new CalcException(
                CalcException.Phase.TOKENIZER, line,
                "Unterminated string — missing closing '\"'"
            );
        }
        advance(); 
        return makeToken(TokenType.STRING, sb.toString());
    }
    private Token readNumber(char firstDigit) {
        StringBuilder sb = new StringBuilder();
        sb.append(firstDigit);
        while (!isAtEnd() && (Character.isDigit(peek()) || peek() == '.')) {
            sb.append(advance());
        }
        return makeToken(TokenType.NUMBER, sb.toString());
    }

    private Token readIdentifier(char firstChar) {
        StringBuilder sb = new StringBuilder();
        sb.append(firstChar);
        while (!isAtEnd() && (Character.isLetterOrDigit(peek()) || peek() == '_')) {
            sb.append(advance());
        }
        return makeToken(TokenType.IDENTIFIER, sb.toString());
    }
}
