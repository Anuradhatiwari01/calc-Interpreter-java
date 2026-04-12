package ast;

import environment.Environment;

public interface Expression {
    Object evaluate(Environment env);

}
