import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import tokenizer.CalcException;

// Entry point — reads .calc file and runs it through the interpreter
public class Main {

    public static void main(String[] args) {

        if (args.length != 1) {
            System.err.println("Usage: java Main <file.calc>");
            System.exit(1);
        }

        String sourceCode;
        try {
            sourceCode = new String(Files.readAllBytes(Paths.get(args[0])));
        } catch (IOException e) {
            System.err.println("Could not read file: " + args[0]);
            System.exit(1);
            return;
        }

        try {
            new Interpreter().run(sourceCode);
        } catch (CalcException e) {
            System.err.println(e); // [PHASE ERROR] Line N: message
            System.exit(1);
        }
    }
}