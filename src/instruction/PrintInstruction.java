package instruction;

import environment.Environment;
import ast.Expression;
import ast.TreeNode;
import ast.Values;

public final class PrintInstruction implements Instruction {

    private final Expression expression;

    public PrintInstruction(Expression expression) {
        this.expression = expression;
    }

    @Override
    public void execute(Environment env){
        Object value = expression.evaluate(env);
        env.print(Values.format(value));
    }

    @Override
    public TreeNode toTree() {
        return new TreeNode("Print", expression.toTree());
    }

    @Override
    public String toString() {
        return "PrintInstruction(" + expression + ")";
    }

}
