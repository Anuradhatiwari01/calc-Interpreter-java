package instruction;
import environment.Environment;


public interface Instruction {
    void execute(Environment env);
}
