package environment;

import tokenizer.CalcException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * Runtime state: variables, where printed output goes, and an optional
 * limit on loop iterations so runaway programs stop instead of hanging.
 */
public class Environment {
    private final Map<String, Object> variables;
    private final Consumer<String> output;
    private final long maxLoopSteps;
    private long loopSteps;

    /** Prints to System.out with no loop limit — used by the command line. */
    public Environment(){
        this(text -> System.out.println(text), Long.MAX_VALUE);
    }

    public Environment(Consumer<String> output, long maxLoopSteps) {
        this.variables = new HashMap<>();
        this.output = output;
        this.maxLoopSteps = maxLoopSteps;
    }

    public void set(String name, Object value) {
        variables.put(name, value);
    }
    public Optional<Object> get(String name) {
        return Optional.ofNullable(variables.get(name));
    }

    public void print(String text) {
        output.accept(text);
    }

    /** Called once per loop iteration; throws when the limit is exceeded. */
    public void countLoopStep(int line) {
        if (++loopSteps > maxLoopSteps) {
            throw new CalcException(CalcException.Phase.EVALUATOR, line,
                    "Stopped after " + maxLoopSteps + " loop iterations — the program is running too long");
        }
    }
}
