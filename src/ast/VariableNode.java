package ast;
import environment.Environment;

public class VariableNode implements Expression {

    private final String name;

    public VariableNode(String name) {
        this.name = name;
    }

    @Override
    public Object evaluate(Environment env) {
        return env.getOrThrow(name);
    }
    @Override
    public String toString() {
        return "VariableNode(" + name + ")";
    }

}
