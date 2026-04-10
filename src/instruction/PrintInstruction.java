package instruction;

import environment.Environment;
import ast.Expression;

public final class PrintInstruction implements Instruction {

    private final Expression expression;

    public PrintInstruction(Expression expression) {
        this.expression = expression;
    }

    @Override
    public void execute(Environment env){
        Object value = expression.evaluate(env);
        System.out.println(formatValue(value));
    }

    private String formatValue(Object value) {
        if (value instanceof Double) {
            double d = (Double) value;
            if (d == Math.floor(d) && !Double.isInfinite(d)) {
                return String.valueOf((long) d); // 16.0 → "16"
            }
            return String.valueOf(d);            // 3.14 → "3.14"
        }
        return String.valueOf(value); // strings print as-is
    }

    @Override
    public String toString() {
        return "PrintInstruction(" + expression + ")";
    }

}
