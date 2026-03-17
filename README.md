# CALC Interpreter: Mini Scripting Engine

## Overview
This project is a fully functional interpreter for **CALC (Concise Algorithmic Language for Computation)**, a custom, math-notation-based programming language built entirely from scratch in pure Java.

It does not rely on external parsing libraries; instead, it implements a custom pipeline to read, structure, and execute source code natively.

---

## The CALC Language

CALC relies on concise, symbolic notation rather than verbose English keywords. The interpreter currently supports:

- **Variable Assignment:**  
  `$x := 10`

- **Arithmetic Operations:**  
  Operator precedence is handled natively via an Abstract Syntax Tree (AST)  
  Example:  
  `result := x + y * 2`

- **Standard Output:**  
  `>> result`  
  `>> "String output"`

- **Conditional Logic:**  
  `? score > 50 => >> "Pass"`

- **Looping Constructs:**  
  `@ 4 =>`

---

## Core Architecture & Execution Pipeline

The interpreter operates through a strict three-step pipeline to process and execute raw source files:

### 1. Tokenizer
Reads the raw `.calc` source code character by character and groups them into a flat list of identifiable `Token` objects (e.g., numbers, strings, operators like `:=` or `>>`).

### 2. Parser
Consumes the token list and constructs an **Expression Tree (Abstract Syntax Tree)**.  
This tree structure inherently resolves operator precedence without additional passes (e.g., multiplication nodes sit deeper in the tree than addition nodes).

### 3. Evaluator / Interpreter
Traverses the parsed tree from the bottom up.  
It executes `Instruction` interfaces and evaluates `Expression` nodes while maintaining state and tracking active variables within an `Environment` map.
