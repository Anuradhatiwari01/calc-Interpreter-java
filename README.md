# CALC Interpreter — Mini Scripting Engine

> A complete interpreter for **CALC**, a small programming language written in math-style notation. It's built from scratch in plain Java, without any parsing libraries.

![Java](https://img.shields.io/badge/Java-11%2B-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Concepts](https://img.shields.io/badge/Concepts-Lexer%20%7C%20AST%20%7C%20Interpreter-6366F1?style=flat-square)
![Status](https://img.shields.io/badge/Status-Complete-22c55e?style=flat-square)

---

## Why I Built This

Most programmers use languages — I wanted to understand what happens *before* the language even runs. Building CALC from scratch forced me to understand every layer of code execution: how raw text becomes tokens, how tokens form a tree, and how that tree becomes a running program. It's one of the most grounding CS projects I've done.

---

## What is CALC?

CALC (Concise Algorithmic Language for Computation) uses symbols in place of English keywords:

| Feature | CALC syntax | Python equivalent |
|---|---|---|
| Assign a variable | `x := 10` | `x = 10` |
| Arithmetic (with precedence) | `result := x + y * 2` | `result = x + y * 2` |
| Print a value | `>> result` | `print(result)` |
| Print a string | `>> "Hello"` | `print("Hello")` |
| If, one line | `? score > 50 => >> "Pass"` | `if score > 50: print("Pass")` |
| If, block | `? score > 50 =>` … `end` | `if score > 50:` + indented body |
| Loop, one line | `@ 3 => >> "hi"` | `for _ in range(3): print("hi")` |
| Loop, block | `@ 4 =>` … `end` | `for _ in range(4):` + indented body |
| Comment | `# note` | `# note` |

**Language rules:**
- Operators: `+ - * /` for arithmetic, and `> < ==` for comparisons. Comparisons can only be used as a `?` condition.
- All numbers are decimals internally. Whole numbers print without the `.0`, so `16.0` prints as `16`.
- A string sits between double quotes and must close on the same line.
- A loop count must be a whole-number literal, such as `@ 5 =>`.
- Put each statement on its own line.
- If `=>` is followed by a statement on the same line, the body is just that one statement. If `=>` ends the line, the body continues until a matching `end`. Blocks can be nested.
- `end` is a reserved word, so you can't use it as a variable name.

---

## Demo

**Input (`samples/program5.calc`):**
```
# Nested blocks, the one-line form, and code after a block
total := 0
n := 1
@ 5 =>
    total := total + n
    ? n == 3 => >> "halfway there"
    n := n + 1
end
>> total

? total > 10 =>
    >> "big total"
    @ 2 => >> "!"
end
? total < 10 => >> "small total"
>> "Done"
```

**Output:**
```
halfway there
15
big total
!
!
Done
```

Indentation is optional, but it makes blocks easier to read.

---

## Error Messages

Every error shows the stage where it was found and the line number:

```
[TOKENIZER ERROR] Line 1: Unexpected character '$'
[PARSER ERROR] Line 2: Missing 'end' for the '?' block started on line 2
[EVALUATOR ERROR] Line 3: Variable 'c' is not defined
```

| Stage | Catches |
|---|---|
| `TOKENIZER` | Unknown characters, unterminated strings, malformed numbers like `1.2.3`, a lone `:` or `=` |
| `PARSER` | A missing `:=`, `=>` or `end`, a stray `end`, two statements on one line, a missing value |
| `EVALUATOR` | Undefined variables, arithmetic on strings, a `?` condition that isn't a comparison |

---

## Core Architecture — Three-Stage Pipeline

```
Source Code (.calc)
      │
      ▼
 ┌───────────┐
 │ Tokenizer │  → reads char by char → produces flat list of Token objects
 └───────────┘
      │
      ▼
 ┌──────────┐
 │  Parser  │  → consumes tokens → builds Instructions + Expression trees (AST)
 └──────────┘
      │
      ▼
 ┌──────────┐
 │ Execute  │  → runs each Instruction, evaluating expressions against an Environment
 └──────────┘
      │
      ▼
   Output
```

### 1. Tokenizer: `src/tokenizer/`
Reads the `.calc` source one character at a time and turns it into a flat list of `Token` objects: numbers, strings, identifiers, operators (`:=`, `>>`, `=>`, `==`), the `end` keyword, and newlines. Each token records its line number for error messages.

### 2. Parser: `src/parser/`
A recursive-descent parser. It turns the token list into a list of `Instruction`s, and each instruction holds `Expression` trees. Each precedence level has its own method: `parseComparison → parseExpression (+ −) → parseTerm (* /) → parsePrimary`. Because of this, `*` and `/` end up deeper in the tree than `+` and `−`, and are evaluated first.

### 3. Execution: `src/instruction/` + `src/ast/`
`Interpreter` calls `execute()` on each `Instruction`. Each instruction evaluates its `Expression` nodes from the leaves upward. Variables live in a single `Environment` map.

---

## How to Run

**Prerequisites:** Java 11 or above (JDK, so you have `javac`)

```bash
git clone https://github.com/Anuradhatiwari01/calc-Interpreter-java.git
cd calc-Interpreter-java
```

**Compile and run (macOS / Linux / Git Bash):**
```bash
javac -d out $(find src -name "*.java")
java -cp out Main samples/program1.calc
```

**Compile and run (Windows PowerShell):**
```powershell
javac -d out (Get-ChildItem -Recurse src -Filter *.java).FullName
java -cp out Main samples/program1.calc
```

**Run the tests:**
```bash
javac -d out $(find src test -name "*.java")
java -cp out InterpreterTest
```
In PowerShell, use `(Get-ChildItem -Recurse src,test -Filter *.java).FullName` for the file list.

The test runner doesn't need any libraries. It checks every sample program, the block and one-line forms, and the exact text of each error message.

---

## Project Structure

```
calc-Interpreter-java/
├── src/
│   ├── Main.java              # CLI entry point: reads a .calc file and reports errors
│   ├── Interpreter.java       # Pipeline: tokenize → parse → execute
│   ├── tokenizer/             # Token, TokenType, Tokenizer, CalcException
│   ├── parser/                # Parser (recursive descent)
│   ├── ast/                   # Expression nodes: Number, String, Variable, BinaryOp
│   ├── instruction/           # Statements: Assign, Print, If, Repeat
│   └── environment/           # Environment: variable storage
├── test/
│   └── InterpreterTest.java   # Test runner (no libraries needed)
├── samples/
│   └── program1.calc … program5.calc
└── README.md
```

---

## Key Concepts Demonstrated

- **Lexical analysis**: turning source text into a stream of tokens
- **Recursive descent parsing**: building a tree whose shape encodes operator precedence
- **Tree-walk interpretation**: running a program by evaluating its AST directly
- **Symbol table**: keeping track of variable values while the program runs
- **Error reporting**: every stage reports errors with a line number
