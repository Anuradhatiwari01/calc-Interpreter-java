package main.java.calc.instruction;
import main.java.calc.environment.Environment;


public interface Instruction {
    void execute(Environment env);
}
