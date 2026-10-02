package instruction;

import ast.TreeNode;
import environment.Environment;

import java.util.Collections;
import java.util.List;

public final class RepeatInstruction implements Instruction {

    private final int times;
    private final List<Instruction> body;
    private final int line;

    public RepeatInstruction(int times, List<Instruction> body, int line) {
        this.times = times;
        this.body = Collections.unmodifiableList(body);
        this.line = line;
    }
    @Override
    public void execute(Environment env) {
        for (int i = 0; i < times; i++) {
            env.countLoopStep(line);
            for (Instruction instruction : body) {
                instruction.execute(env);
            }
        }
    }

    @Override
    public TreeNode toTree() {
        return new TreeNode("Repeat " + times + (times == 1 ? " time" : " times"),
                Instruction.toTrees(body));
    }

    @Override
    public String toString() {
        return "RepeatInstruction(count=" + times
                + ", body=" + body.size() + " instructions)";
    }
}
