package instruction;

import environment.Environment;
import ast.Expression;
import ast.TreeNode;
import ast.Values;
import tokenizer.CalcException;

import java.util.Collections;
import java.util.List;

public final class IfInstruction implements Instruction {

    private final Expression condition;
    private final List<Instruction> body;
    private final int line;

    public IfInstruction(Expression condition, List<Instruction> body, int line){
        this.condition = condition;
        this.body = Collections.unmodifiableList(body);
        this.line = line;
    }

    @Override
    public void execute(Environment env){
        Object result = condition.evaluate(env);
        if (!(result instanceof Boolean)) {
            throw new CalcException(CalcException.Phase.EVALUATOR, line,
                    "Condition after '?' must be a comparison (>, <, ==), but got " + Values.format(result));
        }
        if ((Boolean) result) {
            for (Instruction instruction : body) {
                instruction.execute(env);
            }
        }
    }

    @Override
    public TreeNode toTree() {
        return new TreeNode("If",
                new TreeNode("Condition", condition.toTree()),
                new TreeNode("Then", Instruction.toTrees(body)));
    }

    @Override
    public String toString() {
        return "IfInstruction(condition=" + condition
                + ", body=" + body.size() + " instructions)";
    }
}
