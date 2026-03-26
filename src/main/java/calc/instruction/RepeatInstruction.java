package main.java.calc.instruction;

import main.java.calc.environment.Environment;

import java.util.Collections;
import java.util.List;

public final class RepeatInstruction implements Instruction {

    private final int times;
    private final List<Instruction> body;

    public RepeatInstruction(int times, List<Instruction> body) {
        this.times = times;
        this.body = Collections.unmodifiableList(body);
    }
    @Override
    public void execute(Environment env) {
        for (int i = 0; i < times; i++) {
            for (Instruction instruction : body) {
                instruction.execute(env);
            }
        }
    }

    @Override
    public String toString() {
        return "RepeatInstruction(count=" + times
                + ", body=" + body.size() + " instructions)";
    }
}
