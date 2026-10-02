package ast;
import environment.Environment;
import tokenizer.CalcException;

public class BinaryOpNode implements Expression {

    private final Expression left;
    private final String operator;
    private final Expression right;
    private final int line;

    public BinaryOpNode(Expression left, String operator, Expression right, int line) {
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.line = line;
    }

    @Override
    public Object evaluate(Environment env) {
        Object leftValue = left.evaluate(env);
        Object rightValue = right.evaluate(env);

        double l = toDouble(leftValue);
        double r = toDouble(rightValue);

        switch (operator) {
            case "+": return l + r;
            case "-": return l - r;
            case "*": return l * r;
            case "/": return l / r;
            case ">": return l > r;
            case "<": return l < r;
            case "==": return l == r;
            default:
                throw new CalcException(CalcException.Phase.EVALUATOR, line,
                        "Unknown operator '" + operator + "'");
        }
    }

    private double toDouble(Object value) {
        if (value instanceof Double) {
            return (Double) value;
        }
        String shown = (value instanceof String) ? "\"" + value + "\"" : String.valueOf(value);
        throw new CalcException(CalcException.Phase.EVALUATOR, line,
                "Operator '" + operator + "' needs numbers, but got " + shown);
    }

    @Override
    public String toString() {
        return "BinaryOpNode(" + left + " " + operator + " " + right + ")";
    }
}
