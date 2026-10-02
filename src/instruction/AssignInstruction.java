package instruction;

import environment.Environment;
import ast.Expression;
import ast.TreeNode;

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
    public TreeNode toTree() {
        return new TreeNode("Assign " + name, expression.toTree());
    }

    @Override
    public String toString() {
        return "AssignInstruction(" + name + " := " + expression + ")";
    }
}
