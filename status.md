# Project Status — CALC Interpreter (Java)

_Last updated: 2026-10-02_

## 1. What the project does

A tree-walk interpreter, written in plain Java with no libraries, for **CALC**, a small scripting language that uses symbols instead of keywords. It reads a `.calc` file, turns it into tokens, parses the tokens into instructions and expression trees (an AST), and runs them, printing output to the console. On the `ui-development` branch, it also has a Programiz-style learning website (section 6).

```
.calc source ──► Tokenizer ──► List<Token> ──► Parser ──► List<Instruction> ──► execute(Environment) ──► stdout
```

It was a group project (Sitare University, "class-project-calc-19-team"). Contributors in the git history: Anuradha Tiwari, Anand Kumar Pandey, Arun Kumar.

## 2. Project structure

```
calc-Interpreter-java/
├── src/
│   ├── Main.java                 # CLI entry point: reads the file, prints CalcException as "[PHASE ERROR] Line N: …"
│   ├── Interpreter.java          # Runs the pipeline: tokenize → parse → execute
│   ├── tokenizer/
│   │   ├── TokenType.java        # Enum of token kinds (includes END for the 'end' keyword)
│   │   ├── Token.java            # Immutable (type, value, line)
│   │   ├── Tokenizer.java        # Lexer that reads one character at a time
│   │   └── CalcException.java    # The only error type: records a phase (TOKENIZER/PARSER/EVALUATOR) and a line
│   ├── parser/
│   │   └── Parser.java           # Recursive-descent parser
│   ├── ast/                      # Expression nodes (evaluate → Object)
│   │   ├── Expression.java
│   │   ├── NumberNode.java
│   │   ├── StringNode.java
│   │   ├── VariableNode.java     # Stores its line for "not defined" errors
│   │   ├── BinaryOpNode.java     # + - * /  > < ==  (stores the operator's line)
│   │   ├── TreeNode.java         # Display-only tree used by the UI's Syntax tree view
│   │   └── Values.java           # Formats values for printing (16.0 → 16)
│   ├── instruction/              # Statement nodes (execute → void)
│   │   ├── Instruction.java
│   │   ├── AssignInstruction.java
│   │   ├── PrintInstruction.java # Sends output through Environment.print()
│   │   ├── IfInstruction.java    # Stores its line; rejects conditions that aren't comparisons
│   │   └── RepeatInstruction.java # Counts each iteration toward the loop limit
│   ├── environment/
│   │   └── Environment.java      # Variables (one global scope), the output sink, and an optional loop limit
│   └── server/
│       ├── WebServer.java        # JDK built-in HTTP server: serves ui/ and POST /api/run (127.0.0.1 only)
│       ├── RunService.java       # Runs a program and returns output, error, tokens and tree as JSON
│       └── Json.java             # JSON string escaping
├── test/
│   └── InterpreterTest.java      # 50 tests, including the web API; no libraries needed
├── ui/                           # Learning site (plain HTML/CSS/JS, no libraries)
│   ├── index.html, styles.css    # Page shell; light/dark theme; mobile layout
│   ├── editor.js                 # Code editor: textarea over a highlighted layer
│   ├── lessons.js                # 10 lessons, challenges, and Playground examples
│   └── app.js                    # Router + pages: Home, Tutorial, Playground, Reference
├── samples/
│   └── program1.calc … program5.calc
├── run-ui.cmd / run-ui.sh        # Compile and start the UI
├── README.md
└── .gitignore                    # ignores .idea/, .github/, *.class, out/
```

Local-only folders that git ignores: `.idea/` (IntelliJ project files), `.github/` (only contains `.keep`), and `out/` (compiled classes).

## 3. Language features

| Feature | Syntax |
|---|---|
| Assignment | `x := 10` |
| Arithmetic | `x + y * 2` (`* /` bind tighter than `+ -`; operators are left-associative) |
| Print | `>> expr` |
| String literal | `"Hello"` (must close on the same line) |
| Comparison | `> < ==` (only allowed in `?` conditions) |
| If, one line | `? cond => statement` |
| If, block | `? cond =>` (newline) … `end` |
| Loop | `@ 4 => statement` or `@ 4 =>` … `end` (count must be a whole-number literal) |
| Comment | `# …` |

Blocks can be nested. `end` is reserved. Each statement must be on its own line.

## 4. How to build and test

```bash
javac -d out $(find src test -name "*.java")
java -cp out Main samples/program5.calc
java -cp out InterpreterTest        # expect: 50 passed, 0 failed
```
README.md has the PowerShell versions of these commands.

To start the learning UI, run `.\run-ui.cmd` (Windows) or `./run-ui.sh`, then open http://localhost:8080.

## 5. Fixes made on 2026-10-02

1. **Blocks end with `end`.** Before this, a `?` or `@` block swallowed every line after it until EOF. Now:
   - `=>` followed by a newline starts a block, and the block runs until a matching `end`.
   - `=>` followed by a statement on the same line gives a one-line body.
   - Leaving out `end` is an error (`Missing 'end' for the '?' block started on line N`), and so is a stray `end`.
   - `samples/program3.calc` and `samples/program4.calc` now use `end`.
   - The new `samples/program5.calc` shows nested blocks and the one-line form.
2. **Error messages are consistent.** Every stage throws `CalcException`, and `Main` prints it as `[PHASE ERROR] Line N: message`. New checks that came with this:
   - **Tokenizer:** `1.2.3` is now a clear error. It used to crash with a raw `NumberFormatException`. An unterminated string is reported on its own line instead of at EOF.
   - **Parser:** two statements on one line, a fractional loop count, and nothing after `=>` are all reported.
   - **Evaluator:** a `?` condition that isn't a comparison is an error. It used to be silently treated as false.
   - `Environment.getOrThrow()` was removed. `VariableNode` now raises the error itself, with a line number.
3. **README rewritten.** It now matches the real syntax (no `$` prefix), shows `end` and the one-line forms, has compile commands that work in bash and PowerShell, uses the real folder names, includes the clone URL and the test command, and documents the error format.
4. **IntelliJ merge conflicts resolved** (`.idea/` is ignored by git, so these changes stay on your machine).
   - Conflict markers were removed from `misc.xml`, `modules.xml` and `.idea/.gitignore`.
   - The project now uses JDK 21 with language level 11.
   - The duplicate module file `class-project-calc-19-team.iml` was deleted. `calc-Interpreter-java.iml` is the only module now.
5. **Tests added** in `test/InterpreterTest.java`. The project had no tests before.

## 6. Interactive learning UI (branch `ui-development`)

A Programiz-style site. Every run goes to the real Java interpreter through `POST /api/run`.

- **Tutorial**: 10 lessons with editable, runnable examples. Each lesson ends with a challenge, and the Check answer button compares output line by line. It also has a hint, a solution, and progress saved in `localStorage`.
- **Playground**: an editor with highlighting, line numbers, auto-indent after `=>`, Tab/Shift+Tab, Ctrl+/ to comment, and Ctrl+Enter to run. You can load examples from a dropdown. There are three tabs: Output, Tokens and Syntax tree. A Tokenizer → Parser → Evaluator stage indicator shows how far the program got, and the error line is highlighted.
- **Reference**: syntax, precedence, error messages with fixes, shortcuts and limits.
- **Safety limits per run**: 1,000,000 loop iterations, 5,000 output lines, and 64 KB of source. The server only listens on `127.0.0.1`.
- **Interpreter changes made for the UI:**
  - `Environment` takes an output sink and a loop limit. The CLI keeps `System.out` and no limit.
  - Every node has a `toTree()`.
  - `Values.format()` is shared by printing and the tree view.
- **Verified:**
  - Every lesson example and challenge solution was run through the API.
  - No starter program already passes its challenge.
  - Headless Chrome checks at desktop and phone widths, in light and dark themes, found no JS errors and no horizontal overflow.
  - Font ligatures are turned off, so `=>` and `>>` look exactly as you type them.

## 7. Remaining limitations (not bugs, just not built yet)

- No `else`, no parentheses, no unary minus or negative literals, and no string concatenation.
- A loop count can't be a variable. Comparisons can't be stored in variables.
- Division by zero prints `Infinity` or `NaN` instead of raising an error.
- There's no build tool (Maven or Gradle). The commands in section 4 are the build.

## 8. Git setup (fixed on 2026-10-02)

There is one remote, `origin` → `https://github.com/Anuradhatiwari01/calc-Interpreter-java.git` (the personal repo). `main` and `Tokeniser` both track it. Use it for every pull and push.

Branches: `main` is the stable team-assignment version. UI and personal work happen on `ui-development`, which was branched from `main` at `59d1320`. Push it for the first time with `git push -u origin ui-development`.

What was done:
- Pointed `origin` back at the personal repo. It had been pointing at the Sitare-University classroom repo.
- Removed a duplicate `[branch "main"]` section in `.git/config`. It had pointed `main` at `refs/heads/evaluator`.
- Pushed local `main` to the personal repo.
- Removed the GitHub Classroom remote (`Sitare-University/class-project-calc-19-team`) from the local project entirely. The classroom repo still exists on GitHub. Only the local link to it is gone.

## 9. Current status

- **Core interpreter:** complete. All 50 tests pass on Java 21, compiled with `--release 11`.
- **Git remote:** fixed. `origin` is the only remote.
- **Interactive UI:** first version complete on `ui-development` (not committed yet).
