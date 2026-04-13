import java.util.List;
import environment.*;
import instruction.*;
import tokenizer.*;
import parser.*;

/**
 * Runs source code through the three-step pipeline:
 * Source → Tokenizer → Parser → Execute
 */
public class Interpreter {

    public void run(String sourceCode) {

        // Step 1 — Tokenize
        List<Token> tokens = new Tokenizer(sourceCode).tokenize();

        // Step 2 — Parse
        List<Instruction> instructions = new Parser(tokens).parse();

        // Step 3 — Execute
        Environment env = new Environment();
        for (Instruction instruction : instructions) {
            instruction.execute(env);
        }
    }
}