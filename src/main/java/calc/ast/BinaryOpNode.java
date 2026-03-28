package main.java.calc.ast;
import main.java.calc.environment.Environment;

public class BinaryOpNode implements Expression{

    private final Expression left;
    private final String operator;
    private final Expression right;

    public BinaryOpNode(Expression left, String operator, Expression right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
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
            default: throw new RuntimeException("Unknown operator: " + operator);
        }
    }

    private double toDouble(Object value) {
        if (value instanceof Double) {
            return (Double) value;
        }
        throw new RuntimeException("Expected a number but got: " + value);
    }

    @Override
    public String toString() {
        return "BinaryOpNode(" + left + " " + operator + " " + right + ")";
    }
}
