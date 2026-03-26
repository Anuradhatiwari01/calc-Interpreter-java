package main.java.calc.ast;

import main.java.calc.environment.Environment;
import java.util.Objects;

public interface Expression {
    Objects evaluate(Environment env);

}
