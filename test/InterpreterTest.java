import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import tokenizer.CalcException;

/**
 * Dependency-free test runner for the CALC interpreter.
 *
 *   javac -d out $(find src test -name "*.java")
 *   java -cp out InterpreterTest
 *
 * Each test runs a CALC program and compares either its printed output
 * or the CalcException it raises ("[PHASE ERROR] Line N: message").
 */
public class InterpreterTest {

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) throws IOException {

        // ─── Sample programs ─────────────────────────────────────────────────
        output("sample 1", sample("program1"), "16");
        output("sample 2", sample("program2"), "Sitare", "Hello from CALC");
        output("sample 3", sample("program3"), "Pass");
        output("sample 4", sample("program4"), "1", "2", "3", "4");
        output("sample 5", sample("program5"),
                "halfway there", "15", "big total", "!", "!", "Done");

        // ─── Arithmetic ──────────────────────────────────────────────────────
        output("precedence",         ">> 2 + 3 * 4 - 6 / 2", "11");
        output("left associativity", ">> 10 - 3 - 2", "5");
        output("decimals",           ">> 7 / 2", "3.5");
        output("variables",          "a := 4\nb := a * a\n>> b", "16");
        output("comments and blanks", "# header\n\nx := 1 # trailing\n\n>> x", "1");

        // ─── Blocks end at 'end' ─────────────────────────────────────────────
        output("false if skips only its block",
                "s := 10\n? s > 50 =>\n>> \"Pass\"\nend\n>> \"after\"", "after");
        output("true if then continues",
                "s := 90\n? s > 50 =>\n>> \"Pass\"\nend\n>> \"after\"", "Pass", "after");
        output("loop then continues",
                "@ 2 =>\n>> \"hi\"\nend\n>> \"after\"", "hi", "hi", "after");
        output("nested loops",
                "c := 0\n@ 2 =>\n  @ 3 =>\n    c := c + 1\n  end\nend\n>> c", "6");
        output("if inside loop",
                "i := 1\n@ 4 =>\n  ? i == 2 =>\n    >> \"two\"\n  end\n  i := i + 1\nend\n>> i",
                "two", "5");
        output("blank lines and comments inside block",
                "@ 2 =>\n\n  # comment\n  >> \"x\"\n\nend", "x", "x");
        output("== comparison", "? 3 == 3 =>\n>> \"eq\"\nend", "eq");

        // ─── One-line form ───────────────────────────────────────────────────
        output("inline if true",  "? 2 > 1 => >> \"yes\"\n>> \"next\"", "yes", "next");
        output("inline if false", "? 2 < 1 => >> \"yes\"\n>> \"next\"", "next");
        output("inline loop",     "@ 3 => >> \"*\"", "*", "*", "*");
        output("inline nested",   "? 1 < 2 => @ 2 => >> \"x\"", "x", "x");
        output("zero-times loop", "@ 0 => >> \"never\"\n>> \"done\"", "done");

        // ─── Tokenizer errors ────────────────────────────────────────────────
        error("unexpected character", "$x := 5",
                "[TOKENIZER ERROR] Line 1: Unexpected character '$'");
        error("unterminated string", "a := 1\n>> \"hello\n>> a",
                "[TOKENIZER ERROR] Line 2: Unterminated string — missing closing '\"'");
        error("double decimal point", "x := 1.2.3",
                "[TOKENIZER ERROR] Line 1: Invalid number '1.2.' — a number can have only one decimal point");
        error("lone colon", "x : 5",
                "[TOKENIZER ERROR] Line 1: Expected '=' after ':' — did you mean ':='?");

        // ─── Parser errors ───────────────────────────────────────────────────
        error("missing end for ?", "x := 1\n? x > 0 =>\n>> x",
                "[PARSER ERROR] Line 2: Missing 'end' for the '?' block started on line 2");
        error("missing end for inner @", "@ 2 =>\n@ 3 =>\n>> 1\nend",
                "[PARSER ERROR] Line 1: Missing 'end' for the '@' block started on line 1");
        error("end without block", ">> 1\nend",
                "[PARSER ERROR] Line 2: 'end' without a matching '?' or '@' block");
        error("extra end", "@ 1 =>\n>> 1\nend\nend",
                "[PARSER ERROR] Line 4: 'end' without a matching '?' or '@' block");
        error("two statements on one line", "x := 1 >> x",
                "[PARSER ERROR] Line 1: Unexpected '>>' — each statement must be on its own line");
        error("missing :=", "x 5",
                "[PARSER ERROR] Line 1: Expected ':=' after variable name 'x', but got '5'");
        error("missing value", ">> \n",
                "[PARSER ERROR] Line 1: Expected a value (number, string, or variable name), but got end of line");
        error("missing =>", "? 1 > 0 >> 1",
                "[PARSER ERROR] Line 1: Expected '=>' after condition, but got '>>'");
        error("nothing after =>", "? 1 > 0 =>",
                "[PARSER ERROR] Line 1: Expected a statement after '=>'");
        error("fractional loop count", "@ 2.5 => >> 1",
                "[PARSER ERROR] Line 1: Loop count must be a whole number, but got 2.5");
        error("end is reserved", "end := 3",
                "[PARSER ERROR] Line 1: 'end' without a matching '?' or '@' block");

        // ─── Evaluator errors ────────────────────────────────────────────────
        error("undefined variable", "a := 1\nb := 2\n>> c",
                "[EVALUATOR ERROR] Line 3: Variable 'c' is not defined");
        error("string in arithmetic", ">> \"a\" + 1",
                "[EVALUATOR ERROR] Line 1: Operator '+' needs numbers, but got \"a\"");
        error("non-comparison condition", "x := 5\n? x =>\n>> x\nend",
                "[EVALUATOR ERROR] Line 2: Condition after '?' must be a comparison (>, <, ==), but got 5.0");
        error("error inside loop body", "@ 2 =>\n>> 1\n>> missing\nend",
                "[EVALUATOR ERROR] Line 3: Variable 'missing' is not defined");

        System.out.println();
        System.out.println(passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static String sample(String name) throws IOException {
        return new String(Files.readAllBytes(Paths.get("samples", name + ".calc")));
    }

    /** Runs source and returns stdout, or the CalcException as "[PHASE ERROR] ..." text. */
    private static String run(String source) {
        PrintStream original = System.out;
        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        System.setOut(new PrintStream(captured, true));
        try {
            new Interpreter().run(source);
            return captured.toString().replace("\r\n", "\n").trim();
        } catch (CalcException e) {
            return e.toString();
        } finally {
            System.setOut(original);
        }
    }

    private static void output(String name, String source, String... expectedLines) {
        check(name, run(source), String.join("\n", expectedLines));
    }

    private static void error(String name, String source, String expected) {
        check(name, run(source), expected);
    }

    private static void check(String name, String actual, String expected) {
        if (actual.equals(expected)) {
            passed++;
            System.out.println("PASS  " + name);
        } else {
            failed++;
            System.out.println("FAIL  " + name);
            System.out.println("      expected: " + expected.replace("\n", "\\n"));
            System.out.println("      actual:   " + actual.replace("\n", "\\n"));
        }
    }
}
