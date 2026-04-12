package tokenizer;

public class CalcException extends RuntimeException {

    public enum Phase {
        TOKENIZER,
        PARSER,
        EVALUATOR
    }

    private final Phase phase;
    private final int line;

    public CalcException(Phase phase, int line, String message) {
        super(message);
        this.phase = phase;
        this.line = line;
    }

    public Phase getPhase() {
        return phase;
    }

    public int getLine() {
        return line;
    }

    @Override
    public String toString() {
        return "[" + phase + " ERROR] Line " + line + ": " + getMessage();
    }
}
