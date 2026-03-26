package main.java.calc.instruction;

import main.java.calc.environment.Environment;
import main.java.calc.ast.Expression;

public final class AssignInstruction implements Instruction {
    private final String name;
    private final Expression expression;

    public AssignInstruction(String name, Expression expression){
        this.name = name;
        this.expression = expression;
    }

    @Override
    public void execute(Environment env){
        Object value = expression.evaluate(env);
        env.set(name, value);
    }

    @Override
    public String toString() {
        return "AssignInstruction(" + name + " := " + expression + ")";
    }
}
