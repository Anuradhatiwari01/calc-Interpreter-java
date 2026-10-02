package ast;
import environment.Environment;
import tokenizer.CalcException;

public class VariableNode implements Expression {

    private final String name;
    private final int line;

    public VariableNode(String name, int line) {
        this.name = name;
        this.line = line;
    }

    @Override
    public Object evaluate(Environment env) {
        return env.get(name).orElseThrow(() ->
                new CalcException(CalcException.Phase.EVALUATOR, line,
                        "Variable '" + name + "' is not defined")
        );
    }
    @Override
    public String toString() {
        return "VariableNode(" + name + ")";
    }

}
