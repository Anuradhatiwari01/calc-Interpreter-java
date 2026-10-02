/*
 * Tutorial content. Each lesson is a list of blocks:
 *   { p: html }                       paragraph
 *   { h2: text }                      sub-heading
 *   { example: title, code }          runnable, editable example
 *   { code }                          read-only highlighted snippet
 *   { note: html, tone }              callout — tone is 'tip' (default) or 'warn'
 *   { table: [[head...], [row...]] }  table; cells are html
 *   { diagram: text }                 monospace diagram
 * A lesson may end with a `challenge` whose output is checked line by line.
 */
(function () {
  'use strict';

  const LESSONS = [
    {
      id: 'introduction',
      title: 'Introduction to CALC',
      summary: 'What CALC is and your first program.',
      blocks: [
        { p: 'CALC is a tiny programming language. Where most languages use English words like <code>print</code>, <code>if</code> and <code>for</code>, CALC uses short symbols instead.' },
        { p: 'This tutorial teaches you CALC. Along the way, it also shows you what an <strong>interpreter</strong> does: how the text you type becomes a program that actually runs.' },
        { h2: 'Your first program' },
        { example: 'Print a message', code: '>> "Hello, World!"' },
        { p: 'Click <strong>Run</strong>. The symbol <code>&gt;&gt;</code> means <em>print</em>: it shows whatever comes after it.' },
        { p: 'You can edit any example on this site. Change the message and run it again.' },
        { h2: 'How CALC runs your code' },
        { p: 'A CALC program runs from top to bottom, one line at a time. Each statement goes on its own line.' },
        { example: 'Three statements', code: '>> "Line one"\n>> "Line two"\n>> "Line three"' },
        { note: 'Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>⌘</kbd> + <kbd>Enter</kbd> on a Mac) inside any editor to run it.' },
      ],
      challenge: {
        prompt: 'Write a program that prints <code>Hello, CALC!</code>',
        starter: '# Write your code below\n',
        expected: ['Hello, CALC!'],
        hint: 'Use <code>&gt;&gt;</code> followed by the text in double quotes.',
        solution: '>> "Hello, CALC!"',
      },
    },

    {
      id: 'printing',
      title: 'Printing Output',
      summary: 'Show numbers and text with >>.',
      blocks: [
        { p: 'The print statement is <code>&gt;&gt;</code> followed by a <strong>value</strong>. A value can be a number, a piece of text (a <em>string</em>), or a variable, which you\'ll meet in the next lesson.' },
        { example: 'Print numbers and strings', code: '>> 42\n>> 3.5\n>> "CALC is fun"' },
        { h2: 'Whole numbers and decimals' },
        { p: 'CALC stores every number as a decimal internally. When a result is a whole number, it prints without the <code>.0</code>.' },
        { example: 'Division results', code: '>> 10 / 2\n>> 7 / 2' },
        { h2: 'Strings' },
        { p: 'A string is text between double quotes: <code>"like this"</code>. It must start and end on the same line.' },
        { note: 'CALC can\'t join strings with <code>+</code>. To show several pieces of text, print them on separate lines.', tone: 'warn' },
      ],
      challenge: {
        prompt: 'Print these three lines, in this order: <code>1</code>, <code>2</code>, then <code>Go!</code>',
        starter: '',
        expected: ['1', '2', 'Go!'],
        hint: 'You need three <code>&gt;&gt;</code> statements. Numbers don\'t need quotes, but text does.',
        solution: '>> 1\n>> 2\n>> "Go!"',
      },
    },

    {
      id: 'variables',
      title: 'Variables',
      summary: 'Store values with :=.',
      blocks: [
        { p: 'A <strong>variable</strong> is a name that holds a value. Create one, or change it later, with <code>:=</code> (read it as "becomes").' },
        { example: 'Create and update a variable', code: 'age := 20\n>> age\nage := age + 1\n>> age' },
        { p: 'On line 3, CALC works out <code>age + 1</code> first, using the old value <code>20</code>, and then stores the result back in <code>age</code>.' },
        { h2: 'Naming rules' },
        { table: [
          ['Rule', 'Valid', 'Invalid'],
          ['Start with a letter or <code>_</code>', '<code>total</code>, <code>_tmp</code>', '<code>2nd</code>'],
          ['Then letters, digits or <code>_</code>', '<code>score_1</code>', '<code>my-score</code>'],
          ['Case matters', '<code>Total</code> and <code>total</code> are different', ''],
          ['<code>end</code> is reserved', '', '<code>end := 5</code>'],
        ] },
        { p: 'Variables can hold numbers or strings.' },
        { example: 'A string variable', code: 'city := "Delhi"\n>> city' },
        { h2: 'Using a variable before creating it' },
        { p: 'If you read a variable that doesn\'t exist yet, CALC stops and tells you which line caused the problem.' },
        { example: 'An undefined variable', code: '>> score' },
      ],
      challenge: {
        prompt: 'Create <code>width := 8</code> and <code>height := 5</code>. Store their product in <code>area</code>, then print <code>area</code>.',
        starter: 'width := 8\nheight := 5\n',
        expected: ['40'],
        hint: 'Multiplication uses <code>*</code>. The line you need is <code>area := width * height</code>, and then you print it.',
        solution: 'width := 8\nheight := 5\narea := width * height\n>> area',
      },
    },

    {
      id: 'arithmetic',
      title: 'Arithmetic and Precedence',
      summary: 'How + - * / are evaluated.',
      blocks: [
        { p: 'CALC has four arithmetic operators:' },
        { table: [
          ['Operator', 'Meaning', 'Example', 'Result'],
          ['<code>+</code>', 'add', '<code>7 + 2</code>', '9'],
          ['<code>-</code>', 'subtract', '<code>7 - 2</code>', '5'],
          ['<code>*</code>', 'multiply', '<code>7 * 2</code>', '14'],
          ['<code>/</code>', 'divide', '<code>7 / 2</code>', '3.5'],
        ] },
        { h2: 'Operator precedence' },
        { p: '<code>*</code> and <code>/</code> are worked out <strong>before</strong> <code>+</code> and <code>-</code>. Operators at the same level run from left to right.' },
        { example: 'Precedence in action', code: '>> 2 + 3 * 4\n>> 10 - 4 - 3\n>> 20 / 4 * 2' },
        { p: '<code>2 + 3 * 4</code> is <code>2 + 12</code>, so it prints 14, not 20. Inside the interpreter, the multiplication sits deeper in the syntax tree, which is why it gets evaluated first. The <a href="#/learn/behind-the-scenes">Behind the Scenes</a> lesson shows this in detail.' },
        { h2: 'Controlling the order' },
        { p: 'CALC doesn\'t support parentheses yet. To make something happen first, calculate it in its own variable:' },
        { example: 'Add first, then multiply', code: 'sum := 2 + 3\n>> sum * 4' },
        { note: 'There are no negative number literals either. Write <code>0 - 5</code> to get −5.', tone: 'warn' },
      ],
      challenge: {
        prompt: 'Convert 25 °C to Fahrenheit using <code>F = C * 9 / 5 + 32</code>, and print the result.',
        starter: 'c := 25\n',
        expected: ['77'],
        hint: 'Precedence works in your favour here: <code>c * 9 / 5 + 32</code> runs the multiplication and division first.',
        solution: 'c := 25\nf := c * 9 / 5 + 32\n>> f',
      },
    },

    {
      id: 'comments',
      title: 'Comments',
      summary: 'Notes that CALC ignores.',
      blocks: [
        { p: 'A <strong>comment</strong> starts with <code>#</code> and runs to the end of the line. CALC skips comments completely, so you can use them to explain your code.' },
        { example: 'Comments on their own line and after code', code: '# Price of one notebook\nprice := 100   # in rupees\n>> price' },
        { p: 'Comments are also handy for switching a line off without deleting it.' },
        { note: 'Shortcut: press <kbd>Ctrl</kbd> + <kbd>/</kbd> in any editor to comment or uncomment the selected lines.' },
      ],
      challenge: {
        prompt: 'This program prints a debug message. Turn the first line into a comment so that only <code>ready</code> is printed.',
        starter: '>> "debug"\n>> "ready"',
        expected: ['ready'],
        hint: 'Put <code>#</code> at the start of line 1.',
        solution: '# >> "debug"\n>> "ready"',
      },
    },

    {
      id: 'conditions',
      title: 'Conditions with ?',
      summary: 'Run code only when something is true.',
      blocks: [
        { p: 'The <code>?</code> statement runs code only when a <strong>condition</strong> is true. A condition compares two values:' },
        { table: [
          ['Operator', 'Meaning', 'Example'],
          ['<code>&gt;</code>', 'greater than', '<code>score &gt; 50</code>'],
          ['<code>&lt;</code>', 'less than', '<code>temp &lt; 0</code>'],
          ['<code>==</code>', 'equal to', '<code>n == 3</code>'],
        ] },
        { h2: 'One-line form' },
        { p: 'Write the condition, then <code>=&gt;</code>, then a single statement on the same line:' },
        { example: 'Pass or fail', code: 'score := 72\n? score > 50 => >> "Pass"\n? score < 50 => >> "Fail"' },
        { h2: 'Block form' },
        { p: 'To run several statements, end the line with <code>=&gt;</code> and close the block with <code>end</code>. Everything between them belongs to the condition.' },
        { example: 'A block with end', code: 'temp := 35\n? temp > 30 =>\n    >> "It\'s hot"\n    >> "Drink water"\nend\n>> "Have a nice day"' },
        { p: 'Indenting the lines inside a block is optional, but it makes your code much easier to read.' },
        { note: 'CALC has no <code>else</code>. Write a second <code>?</code> with the opposite condition instead. There\'s also no <code>&gt;=</code>; for whole numbers, <code>x &gt; 49</code> works the same as <code>x &gt;= 50</code>.', tone: 'warn' },
      ],
      challenge: {
        prompt: 'Print <code>adult</code> if <code>age</code> is greater than 17. Otherwise print <code>minor</code>.',
        starter: 'age := 20\n',
        expected: ['adult'],
        hint: 'Use two one-line conditions: one for <code>age &gt; 17</code> and one for <code>age &lt; 18</code>.',
        solution: 'age := 20\n? age > 17 => >> "adult"\n? age < 18 => >> "minor"',
      },
    },

    {
      id: 'loops',
      title: 'Loops with @',
      summary: 'Repeat code a fixed number of times.',
      blocks: [
        { p: 'The <code>@</code> statement repeats code. Write the number of times, then <code>=&gt;</code>.' },
        { example: 'One-line loop', code: '@ 3 => >> "Hip hip hooray!"' },
        { h2: 'Loop blocks' },
        { p: 'Loops have a block form too, closed with <code>end</code>. A common pattern is a <strong>counter</strong> variable that changes each time round:' },
        { example: 'Count from 1 to 5', code: 'i := 1\n@ 5 =>\n    >> i\n    i := i + 1\nend' },
        { example: 'Add up 1 to 10', code: 'total := 0\nn := 1\n@ 10 =>\n    total := total + n\n    n := n + 1\nend\n>> total' },
        { note: 'The count has to be a whole number written directly in the code, like <code>@ 5</code>. Variables aren\'t allowed there yet. <code>@ 0</code> runs zero times.', tone: 'warn' },
        { note: 'To keep things safe, this site stops any program after 1,000,000 loop iterations.' },
      ],
      challenge: {
        prompt: 'Print the first five multiples of 5: <code>5</code>, <code>10</code>, <code>15</code>, <code>20</code>, <code>25</code>, each on its own line.',
        starter: 'n := 5\n',
        expected: ['5', '10', '15', '20', '25'],
        hint: 'Loop 5 times. Print <code>n</code>, then increase it with <code>n := n + 5</code>.',
        solution: 'n := 5\n@ 5 =>\n    >> n\n    n := n + 5\nend',
      },
    },

    {
      id: 'nesting',
      title: 'Nesting Blocks',
      summary: 'Blocks inside blocks.',
      blocks: [
        { p: 'You can put a block inside another block. Each <code>end</code> closes the <strong>nearest</strong> block that is still open.' },
        { example: 'A condition inside a loop', code: 'i := 1\n@ 6 =>\n    >> i\n    ? i == 3 => >> "three!"\n    i := i + 1\nend' },
        { example: 'A loop inside a loop', code: 'row := 1\n@ 3 =>\n    col := 1\n    @ 3 =>\n        >> row * col\n        col := col + 1\n    end\n    row := row + 1\nend' },
        { p: 'The inner loop runs 3 times for each of the 3 rounds of the outer loop, so it prints 9 values in total.' },
        { h2: 'Forgetting end' },
        { p: 'If a block is never closed, CALC tells you which block is missing its <code>end</code>:' },
        { example: 'A missing end', code: '@ 2 =>\n    >> "hi"' },
      ],
      challenge: {
        prompt: 'Loop through the numbers 1 to 10, but print only the ones greater than 7.',
        starter: 'n := 1\n@ 10 =>\n    # your code here\n    n := n + 1\nend',
        expected: ['8', '9', '10'],
        hint: 'Inside the loop, add <code>? n &gt; 7 =&gt; &gt;&gt; n</code> before the line that increases <code>n</code>.',
        solution: 'n := 1\n@ 10 =>\n    ? n > 7 => >> n\n    n := n + 1\nend',
      },
    },

    {
      id: 'errors',
      title: 'Understanding Errors',
      summary: 'Read error messages like a pro.',
      blocks: [
        { p: 'When something goes wrong, CALC says <strong>which stage</strong> of the interpreter found the problem and <strong>which line</strong> caused it:' },
        { code: '[PARSER ERROR] Line 2: Missing \'end\' for the \'?\' block started on line 2' },
        { table: [
          ['Stage', 'What it checks', 'Typical mistakes'],
          ['<code>TOKENIZER</code>', 'Are these valid characters and symbols?', 'An unknown symbol like <code>$</code>, a string without its closing <code>"</code>, <code>1.2.3</code>'],
          ['<code>PARSER</code>', 'Do the symbols form valid statements?', 'A missing <code>:=</code>, <code>=&gt;</code> or <code>end</code>; two statements on one line'],
          ['<code>EVALUATOR</code>', 'Does the program make sense while it runs?', 'An undefined variable, maths on text'],
        ] },
        { p: 'Run each example to see the error it produces:' },
        { example: 'Tokenizer error', code: '$x := 5' },
        { example: 'Parser error', code: 'x := 1 >> x' },
        { example: 'Evaluator error', code: 'price := 50\n>> price * quantity' },
        { p: 'Each stage only runs if the one before it succeeded. So if your program has a tokenizer error, the parser never even sees it.' },
      ],
      challenge: {
        prompt: 'This program is meant to print <code>hello</code> three times, but it has two bugs. Fix them.',
        starter: 'count := 3\n@ count =>\n    >> "hello"',
        expected: ['hello', 'hello', 'hello'],
        hint: 'Run it and read the first error. A loop count must be a number, not a variable. Then check how the block ends.',
        solution: '@ 3 =>\n    >> "hello"\nend',
      },
    },

    {
      id: 'behind-the-scenes',
      title: 'Behind the Scenes: How CALC Runs',
      summary: 'Tokens, syntax trees and evaluation.',
      blocks: [
        { p: 'Every time you click Run, your code goes through three stages inside the Java interpreter:' },
        { diagram: 'source code ──▶ Tokenizer ──▶ tokens ──▶ Parser ──▶ syntax tree ──▶ Evaluator ──▶ output' },
        { h2: '1. Tokenizer' },
        { p: 'The tokenizer reads your code one character at a time and groups the characters into <strong>tokens</strong>, the "words" of the language. For example, <code>total := price * 2</code> becomes:' },
        { table: [
          ['Token type', 'Value'],
          ['<code>IDENTIFIER</code>', '<code>total</code>'],
          ['<code>ASSIGN</code>', '<code>:=</code>'],
          ['<code>IDENTIFIER</code>', '<code>price</code>'],
          ['<code>STAR</code>', '<code>*</code>'],
          ['<code>NUMBER</code>', '<code>2</code>'],
        ] },
        { h2: '2. Parser' },
        { p: 'The parser reads the tokens and builds a <strong>syntax tree</strong> that shows how the pieces fit together. For <code>&gt;&gt; x + y * 2</code>:' },
        { diagram: 'Print\n└── BinaryOp +\n    ├── Variable x\n    └── BinaryOp *\n        ├── Variable y\n        └── Number 2' },
        { p: 'The <code>*</code> sits <em>below</em> the <code>+</code>. To work out the <code>+</code>, the evaluator first needs both of its children, so the multiplication happens first. This is how operator precedence works without any extra rules.' },
        { h2: '3. Evaluator' },
        { p: 'The evaluator walks the tree, works out each value, stores variables in an <strong>environment</strong> (a table of names and values), and prints output.' },
        { h2: 'See it yourself' },
        { p: 'Open any program in the Playground, run it, and switch to the <strong>Tokens</strong> and <strong>Syntax tree</strong> tabs.' },
        { example: 'Try it in the Playground', code: 'x := 4\ny := 3\n>> x + y * 2' },
      ],
    },
  ];

  const PLAYGROUND_EXAMPLES = [
    { name: 'Hello, World!', code: '>> "Hello, World!"' },
    { name: 'Arithmetic (program1)', code: 'x := 10\ny := 3\nresult := x + y * 2\n>> result' },
    { name: 'Strings (program2)', code: 'name := "Sitare"\n>> name\n>> "Hello from CALC"' },
    { name: 'Condition (program3)', code: 'score := 85\n? score > 50 =>\n>> "Pass"\nend' },
    { name: 'Loop (program4)', code: 'i := 1\n@ 4 =>\n>> i\ni := i + 1\nend' },
    { name: 'Nested blocks (program5)', code: '# Nested blocks, the one-line form, and code after a block\ntotal := 0\nn := 1\n@ 5 =>\n    total := total + n\n    ? n == 3 => >> "halfway there"\n    n := n + 1\nend\n>> total\n\n? total > 10 =>\n    >> "big total"\n    @ 2 => >> "!"\nend\n? total < 10 => >> "small total"\n>> "Done"' },
    { name: 'Times table', code: '# The 7 times table\nn := 7\ni := 1\n@ 10 =>\n    >> n * i\n    i := i + 1\nend' },
    { name: 'Countdown', code: 'n := 5\n@ 5 =>\n    >> n\n    n := n - 1\nend\n>> "Liftoff!"' },
    { name: 'An error to explore', code: 'price := 50\n? price > 20 =>\n    >> "expensive"\n>> price * quantity' },
  ];

  const api = { LESSONS, PLAYGROUND_EXAMPLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.CalcContent = api;
})();
