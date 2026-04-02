package ast;

import environment.Environment;

public class StringNode implements Expression {

    private final String value;

    public StringNode(String value) {
        this.value = value;
    }
    @Override
    public Object evaluate(Environment env) {
        return value;
    }
    @Override
    public String toString() {
        return "StringNode(\"" + value + "\")";
    }
}
