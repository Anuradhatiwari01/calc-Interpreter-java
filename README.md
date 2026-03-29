# CALC Interpreter — Mini Scripting Engine

> A fully functional interpreter for **CALC**, a custom math-notation-based programming language — built entirely from scratch in pure Java, with no external parsing libraries.

![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Concepts](https://img.shields.io/badge/Concepts-Lexer%20%7C%20AST%20%7C%20Interpreter-6366F1?style=flat-square)
![Status](https://img.shields.io/badge/Status-Complete-22c55e?style=flat-square)

---

## Why I Built This

Most programmers use languages — I wanted to understand what happens *before* the language even runs. Building CALC from scratch forced me to understand every layer of code execution: how raw text becomes tokens, how tokens form a tree, and how that tree becomes a running program. It's one of the most grounding CS projects I've done.

---

## What is CALC?

CALC (Concise Algorithmic Language for Computation) uses symbolic, math-style notation instead of verbose English keywords. It supports:

| Feature | CALC Syntax | Equivalent in Python |
|---|---|---|
| Variable assignment | `$x := 10` | `x = 10` |
| Arithmetic (with precedence) | `result := x + y * 2` | `result = x + y * 2` |
| Print output | `>> result` | `print(result)` |
| String output | `>> "Hello"` | `print("Hello")` |
| Conditional | `? score > 50 => >> "Pass"` | `if score > 50: print("Pass")` |
| Loop | `@ 4 =>` | `for _ in range(4):` |

---

## Demo

**Input (`program.calc`):**
```
$x := 5
$y := 3
result := x + y * 2
>> result
>> "Done"
```

**Output:**
```
11
Done
```

Operator precedence is handled natively — `y * 2` evaluates before `x +` because the multiplication node sits deeper in the AST than the addition node.

---

## Core Architecture — Three-Stage Pipeline

The interpreter processes source code through a strict, sequential pipeline:

```
Source Code (.calc)
      │
      ▼
 ┌──────────┐
 │ Tokenizer │  → reads char by char → produces flat list of Token objects
 └──────────┘
      │
      ▼
 ┌─────────┐
 │  Parser  │  → consumes tokens → builds Abstract Syntax Tree (AST)
 └─────────┘
      │
      ▼
 ┌───────────┐
 │ Evaluator │  → traverses AST bottom-up → executes with Environment map
 └───────────┘
      │
      ▼
   Output
```

### 1. Tokenizer
Reads the raw `.calc` source file character by character and groups characters into a flat list of identifiable `Token` objects — numbers, strings, operators (`:=`, `>>`), and keywords.

### 2. Parser
Consumes the token list and constructs an **Abstract Syntax Tree (AST)**. The tree structure inherently resolves operator precedence without additional passes — multiplication nodes sit deeper in the tree than addition nodes, so they evaluate first automatically.

### 3. Evaluator / Interpreter
Traverses the parsed AST from the bottom up. Executes `Instruction` interfaces and evaluates `Expression` nodes while maintaining program state via an `Environment` map that tracks all active variables.

---

## How to Run

**Prerequisites:** Java 11 or above

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/calc-interpreter.git
cd calc-interpreter

# Compile
javac -d out src/**/*.java

# Run with a .calc source file
java -cp out Main programs/example.calc
```

A sample `example.calc` file is included in the `programs/` directory to test immediately.

---

## Project Structure

```
calc-interpreter/
├── src/
│   ├── Main.java           # Entry point
│   ├── tokenizer/          # Lexer — char → Token
│   ├── parser/             # Token → AST nodes
│   ├── evaluator/          # AST → execution
│   └── environment/        # Variable state management
├── programs/
│   └── example.calc        # Sample CALC source file
└── README.md
```

---

## Key Concepts Demonstrated

- **Lexical analysis** — converting raw source text into a structured token stream
- **Recursive descent parsing** — building a tree that encodes operator precedence naturally
- **Tree-walk interpretation** — evaluating an AST via bottom-up traversal
- **Environment / symbol table** — managing variable scope and state at runtime
