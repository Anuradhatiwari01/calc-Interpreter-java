package instruction;

import environment.Environment;
import ast.Expression;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class IfInstruction implements Instruction {

    private final Expression condition;
    private final List<Instruction> body;

    public IfInstruction(Expression condition, List<Instruction> body){
        this.condition = condition;
        this.body = Collections.unmodifiableList(body);
    }

    @Override
    public void execute(Environment env){
        Object result = condition.evaluate(env);
        if (Boolean.TRUE.equals(result)) {
            for (Instruction instruction : body) {
                instruction.execute(env);
            }
        }
    }

    @Override
    public String toString() {
        return "IfInstruction(condition=" + condition
                + ", body=" + body.size() + " instructions)";
    }
}
