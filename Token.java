import java.util.Objects;

public final class Token {
    private final TokenType type;
    private final String    value;
    private final int       line;

    public Token(TokenType type, String value, int line) {
        this.type  = Objects.requireNonNull(type,  "TokenType must not be null");
        this.value = Objects.requireNonNull(value, "Token value must not be null");
        this.line  = line;
    }


    public TokenType getType()  { return type;  }
    public String    getValue() { return value; }
    public int       getLine()  { return line;  }
    public boolean isType(TokenType t) {
        return this.type == t;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj==null)  return false;
        if (this == obj) return true;
        if (!(obj instanceof Token)) return false;
        Token other = (Token) obj;
        return type == other.type
            && value.equals(other.value)
            && line == other.line;
    }
    @Override
    public int hashCode() {
        return Objects.hash(type, value, line);
    }

    @Override
    public String toString() {
        return String.format("Token(%-14s %-10s line=%d)",
            type, "\"" + value + "\"", line);
    }
}
