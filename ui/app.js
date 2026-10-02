/*
 * CALC Learn — single-page app. Pages: Home, Tutorial lessons, Playground, Reference.
 * Code runs on the Java interpreter through POST /api/run (see src/server/WebServer.java).
 */
(function () {
  'use strict';

  const { createEditor, highlightCode } = window.CalcEditor;
  const { LESSONS, PLAYGROUND_EXAMPLES } = window.CalcContent;
  const main = document.getElementById('main');

  // ─── Storage (per-browser conveniences only) ──────────────────────────────

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
  };

  const progress = () => store.get('calc.progress', {});
  function markComplete(id) {
    const done = progress();
    if (!done[id]) { done[id] = true; store.set('calc.progress', done); }
  }

  // ─── DOM helpers ──────────────────────────────────────────────────────────

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value === null || value === undefined || value === false) continue;
        if (key === 'class') el.className = value;
        else if (key === 'html') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value === true ? '' : value);
      }
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      el.append(child instanceof Node ? child : String(child));
    }
    return el;
  }

  const ICONS = {
    play: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    tree: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-2.5h14V17"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.5"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8.5 3.2 3L13 4.5"/></svg>',
    cross: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
    tip: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  };
  const icon = (name) => h('span', { class: 'icon', 'aria-hidden': 'true', html: ICONS[name] });

  // ─── Running code ─────────────────────────────────────────────────────────

  const SERVER_HINT = 'Can\'t reach the CALC server. Start it from the project folder with:  java -cp out server.WebServer';

  async function runCalc(source) {
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: source,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return { networkError: body.message || `The server responded with status ${response.status}.` };
      }
      return await response.json();
    } catch (e) {
      return { networkError: SERVER_HINT };
    }
  }

  function renderResult(target, result) {
    target.replaceChildren();
    if (result.networkError) {
      target.append(h('div', { class: 'console-msg is-error' }, result.networkError));
      return;
    }
    if (result.output.length) {
      target.append(h('pre', { class: 'console-out' }, result.output.join('\n')));
    }
    if (result.truncated) {
      target.append(h('div', { class: 'console-msg is-warn' },
        `Output was cut off after ${result.output.length.toLocaleString()} lines.`));
    }
    if (result.error) {
      target.append(h('div', { class: 'console-msg is-error' }, result.error.text));
    } else {
      if (!result.output.length) target.append(h('div', { class: 'console-empty' }, '(no output)'));
      target.append(h('div', { class: 'console-status' }, icon('check'), 'Program finished'));
    }
  }

  function withBusy(button, task) {
    return async function () {
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add('is-busy');
      try { await task(); } finally {
        button.disabled = false;
        button.classList.remove('is-busy');
      }
    };
  }

  function openInPlayground(code) {
    store.set('calc.playground', code);
    location.hash = '#/playground';
  }

  // ─── Shared widgets ───────────────────────────────────────────────────────

  function exampleWidget(title, code) {
    const consoleBody = h('div', { class: 'console' });
    const output = h('div', { class: 'example-output', hidden: true, 'aria-live': 'polite' },
      h('div', { class: 'output-label' }, 'Output'), consoleBody);
    const host = h('div', { class: 'example-editor' });
    let editor;

    const runButton = h('button', { class: 'btn btn-run btn-sm', type: 'button' }, icon('play'), 'Run');
    const run = withBusy(runButton, async () => {
      const result = await runCalc(editor.getValue());
      output.hidden = false;
      renderResult(consoleBody, result);
      editor.setErrorLine(result.error && result.error.line);
    });
    runButton.addEventListener('click', run);

    const widget = h('figure', { class: 'example' },
      h('figcaption', { class: 'example-head' },
        h('span', { class: 'example-title' }, title),
        h('div', { class: 'example-actions' },
          h('button', {
            class: 'btn btn-ghost btn-sm', type: 'button',
            onclick: () => { editor.setValue(code); output.hidden = true; },
          }, 'Reset'),
          h('button', {
            class: 'btn btn-ghost btn-sm hide-sm', type: 'button',
            onclick: () => openInPlayground(editor.getValue()),
          }, 'Open in Playground'),
          runButton)),
      host,
      output);

    editor = createEditor(host, { value: code, autoHeight: true, minLines: 1, onRun: run, label: 'Example: ' + title });
    return widget;
  }

  function note(html, tone) {
    tone = tone || 'tip';
    return h('div', { class: 'note note-' + tone }, icon(tone), h('div', { html }));
  }

  function table(rows) {
    const [head, ...body] = rows;
    return h('div', { class: 'table-wrap' },
      h('table', null,
        h('thead', null, h('tr', null, head.map(cell => h('th', { html: cell })))),
        h('tbody', null, body.map(row => h('tr', null, row.map(cell => h('td', { html: cell })))))));
  }

  function snippet(code) {
    return h('pre', { class: 'snippet', html: highlightCode(code) });
  }

  // ─── Home ─────────────────────────────────────────────────────────────────

  function renderHome() {
    document.title = 'CALC — Learn how a programming language works';
    const done = progress();
    const next = LESSONS.find(l => !done[l.id]) || LESSONS[0];
    const started = LESSONS.some(l => done[l.id]);

    const features = [
      ['book', 'Short lessons', 'Ten bite-sized lessons, from your first print statement to nested loops.'],
      ['bolt', 'Run code instantly', 'Edit and run every example right on the page, on the real Java interpreter.'],
      ['tree', 'See inside', 'Watch your code turn into tokens and a syntax tree before it runs.'],
      ['alert', 'Helpful errors', 'Every error names the stage that found it and the line that caused it.'],
    ];

    main.replaceChildren(
      h('section', { class: 'hero' },
        h('div', { class: 'hero-text' },
          h('p', { class: 'eyebrow' }, 'Interactive tutorial'),
          h('h1', null, 'Learn to code with CALC, and see how a language really works'),
          h('p', { class: 'hero-lead' },
            'CALC is a tiny language that uses symbols instead of keywords. Learn it step by step, run code in your browser, and look inside the interpreter that runs it.'),
          h('div', { class: 'hero-actions' },
            h('a', { class: 'btn btn-primary btn-lg', href: '#/learn/' + next.id }, started ? 'Continue learning' : 'Start the tutorial'),
            h('a', { class: 'btn btn-secondary btn-lg', href: '#/playground' }, 'Open Playground'))),
        h('div', { class: 'hero-demo' },
          exampleWidget('Try it now', 'i := 1\n@ 3 =>\n    >> i * 10\n    i := i + 1\nend\n>> "Done!"'))),

      h('section', { class: 'features' },
        features.map(([ic, title, text]) =>
          h('div', { class: 'feature' }, h('div', { class: 'feature-icon' }, icon(ic)), h('h3', null, title), h('p', null, text)))),

      h('section', { class: 'course' },
        h('div', { class: 'section-head' },
          h('h2', null, 'CALC tutorial'),
          h('p', null, `${LESSONS.filter(l => done[l.id]).length} of ${LESSONS.length} lessons complete`)),
        h('ol', { class: 'course-grid' },
          LESSONS.map((lesson, i) =>
            h('li', null,
              h('a', { class: 'course-card' + (done[lesson.id] ? ' is-done' : ''), href: '#/learn/' + lesson.id },
                h('span', { class: 'course-num' }, done[lesson.id] ? icon('check') : String(i + 1)),
                h('span', { class: 'course-text' },
                  h('span', { class: 'course-title' }, lesson.title),
                  h('span', { class: 'course-summary' }, lesson.summary))))))),

      footer());
  }

  function footer() {
    return h('footer', { class: 'site-footer' },
      h('p', null, 'CALC interpreter: built from scratch in Java. Tokenizer → Parser → Evaluator.'),
      h('p', null, h('a', { href: 'https://github.com/Anuradhatiwari01/calc-Interpreter-java', target: '_blank', rel: 'noopener' }, 'Source on GitHub')));
  }

  // ─── Tutorial ─────────────────────────────────────────────────────────────

  function sidebar(currentId) {
    const done = progress();
    const count = LESSONS.filter(l => done[l.id]).length;
    const percent = Math.round((count / LESSONS.length) * 100);

    const aside = h('aside', { class: 'sidebar' });
    const toggle = h('button', {
      class: 'side-toggle', type: 'button', 'aria-expanded': 'false',
      onclick: () => {
        const open = aside.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      },
    }, icon('menu'), `Lessons · ${count}/${LESSONS.length} done`);

    aside.append(
      toggle,
      h('div', { class: 'side-inner' },
        h('div', { class: 'side-title' }, 'CALC Tutorial'),
        h('div', { class: 'side-progress' },
          h('div', {
            class: 'progress', role: 'progressbar', 'aria-label': 'Tutorial progress',
            'aria-valuemin': '0', 'aria-valuemax': String(LESSONS.length), 'aria-valuenow': String(count),
          }, h('div', { class: 'progress-fill', style: `width:${percent}%` })),
          h('span', null, `${count} of ${LESSONS.length} complete`)),
        h('ol', { class: 'side-list' },
          LESSONS.map((lesson, i) => {
            const current = lesson.id === currentId;
            return h('li', null,
              h('a', {
                href: '#/learn/' + lesson.id,
                class: current ? 'is-current' : null,
                'aria-current': current ? 'page' : null,
              },
                h('span', { class: 'side-num' + (done[lesson.id] ? ' is-done' : '') },
                  done[lesson.id] ? icon('check') : String(i + 1)),
                h('span', null, lesson.title)));
          }))));
    return aside;
  }

  function renderBlock(block) {
    if (block.p !== undefined)       return h('p', { html: block.p });
    if (block.h2 !== undefined)      return h('h2', null, block.h2);
    if (block.example !== undefined) return exampleWidget('Example: ' + block.example, block.code);
    if (block.note !== undefined)    return note(block.note, block.tone);
    if (block.table !== undefined)   return table(block.table);
    if (block.diagram !== undefined) return h('pre', { class: 'diagram' }, block.diagram);
    if (block.code !== undefined)    return snippet(block.code);
    return null;
  }

  function challengeWidget(lesson, onSolved) {
    const c = lesson.challenge;
    const draftKey = 'calc.challenge.' + lesson.id;
    const host = h('div', { class: 'challenge-editor' });
    const result = h('div', { class: 'challenge-result', 'aria-live': 'polite' });
    const hint = h('div', { hidden: true }, note('<strong>Hint:</strong> ' + c.hint));
    const solution = h('div', { class: 'challenge-solution', hidden: true },
      h('div', { class: 'output-label' }, 'One possible solution'), snippet(c.solution));
    const solvedBadge = h('span', { class: 'badge badge-success', hidden: !progress()[lesson.id] }, icon('check'), 'Solved');
    let editor;

    const checkButton = h('button', { class: 'btn btn-primary', type: 'button' }, icon('play'), 'Check answer');
    const check = withBusy(checkButton, async () => {
      const run = await runCalc(editor.getValue());
      result.replaceChildren();
      if (run.networkError) {
        result.append(h('div', { class: 'console-msg is-error' }, run.networkError));
        return;
      }
      editor.setErrorLine(run.error && run.error.line);
      const actual = run.output.join('\n');
      const expected = c.expected.join('\n');

      if (!run.error && actual === expected) {
        markComplete(lesson.id);
        solvedBadge.hidden = false;
        result.append(h('div', { class: 'verdict verdict-pass' },
          icon('check'), h('div', null, h('strong', null, 'Correct! '), 'Your output matches exactly.')));
        onSolved();
        return;
      }
      result.append(h('div', { class: 'verdict verdict-fail' },
        icon('cross'),
        h('div', null, h('strong', null, 'Not quite yet. '),
          run.error ? 'Your program stopped with an error:' : 'Your output is different from the expected output.')));
      if (run.error) result.append(h('div', { class: 'console-msg is-error' }, run.error.text));
      result.append(h('div', { class: 'compare' },
        h('div', null, h('div', { class: 'output-label' }, 'Expected'), h('pre', { class: 'console-out' }, expected)),
        h('div', null, h('div', { class: 'output-label' }, 'Your output'),
          h('pre', { class: 'console-out' }, actual || '(no output)'))));
    });
    checkButton.addEventListener('click', check);

    const section = h('section', { class: 'challenge', 'aria-labelledby': 'challenge-title' },
      h('div', { class: 'challenge-head' },
        h('span', { class: 'badge' }, 'Your turn'),
        solvedBadge),
      h('h2', { id: 'challenge-title' }, 'Challenge'),
      h('p', { html: c.prompt }),
      h('div', { class: 'expected' },
        h('div', { class: 'output-label' }, 'Expected output'),
        h('pre', { class: 'console-out' }, c.expected.join('\n'))),
      host,
      h('div', { class: 'challenge-actions' },
        checkButton,
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { hint.hidden = !hint.hidden; } }, 'Hint'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { solution.hidden = !solution.hidden; } }, 'Show solution'),
        h('button', {
          class: 'btn btn-ghost', type: 'button',
          onclick: () => { editor.setValue(c.starter); result.replaceChildren(); },
        }, 'Reset')),
      hint, solution, result);

    editor = createEditor(host, {
      value: store.get(draftKey, c.starter),
      autoHeight: true, minLines: 4, onRun: check, label: 'Challenge editor',
      onChange: value => store.set(draftKey, value),
    });
    return section;
  }

  function renderLesson(id) {
    const index = LESSONS.findIndex(l => l.id === id);
    if (index < 0) return renderNotFound();
    const lesson = LESSONS[index];
    if (!lesson.challenge) markComplete(lesson.id);
    document.title = `${lesson.title} · CALC Tutorial`;

    let side = sidebar(lesson.id);
    const refreshSidebar = () => {
      const fresh = sidebar(lesson.id);
      side.replaceWith(fresh);
      side = fresh;
    };

    const prev = LESSONS[index - 1];
    const next = LESSONS[index + 1];

    const article = h('article', { class: 'lesson' },
      h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
        h('a', { href: '#/learn' }, 'Tutorial'), h('span', { 'aria-hidden': 'true' }, '/'),
        h('span', null, `Lesson ${index + 1}`)),
      h('h1', null, lesson.title),
      lesson.blocks.map(renderBlock),
      lesson.challenge ? challengeWidget(lesson, refreshSidebar) : null,
      h('nav', { class: 'pager', 'aria-label': 'Lesson navigation' },
        prev ? h('a', { class: 'pager-link', href: '#/learn/' + prev.id },
          h('span', { class: 'pager-dir' }, '← Previous'), h('span', null, prev.title)) : h('span'),
        next ? h('a', { class: 'pager-link pager-next', href: '#/learn/' + next.id },
          h('span', { class: 'pager-dir' }, 'Next →'), h('span', null, next.title))
             : h('a', { class: 'pager-link pager-next', href: '#/playground' },
          h('span', { class: 'pager-dir' }, 'Finished! →'), h('span', null, 'Practise in the Playground'))));

    main.replaceChildren(h('div', { class: 'learn' }, side, article));
  }

  // ─── Playground ───────────────────────────────────────────────────────────

  const TOKEN_GROUPS = {
    PRINT: 'keyword', IF: 'keyword', LOOP: 'keyword', END: 'keyword', ARROW: 'keyword', ASSIGN: 'keyword',
    PLUS: 'op', MINUS: 'op', STAR: 'op', SLASH: 'op', GREATER: 'op', LESS: 'op', EQUAL_EQUAL: 'op',
    NUMBER: 'literal', STRING: 'literal', IDENTIFIER: 'ident', NEWLINE: 'structure', EOF: 'structure',
  };

  const TREE_GROUPS = {
    Program: 'program', Assign: 'stmt', Print: 'stmt', If: 'stmt', Repeat: 'stmt',
    Condition: 'group', Then: 'group', BinaryOp: 'op', Number: 'literal', String: 'literal', Variable: 'ident',
  };

  function placeholder(text) {
    return h('div', { class: 'panel-placeholder' }, text);
  }

  function stoppedMessage(result, what) {
    return h('div', { class: 'console-msg is-error' },
      `No ${what}: the ${result.error.phase.toLowerCase()} stopped with an error before this stage.\n${result.error.text}`);
  }

  function renderTokens(panel, result) {
    panel.replaceChildren();
    if (result.networkError) return panel.append(placeholder(result.networkError));
    if (!result.tokens) return panel.append(stoppedMessage(result, 'tokens'));

    panel.append(h('p', { class: 'panel-intro' },
      'The tokenizer read your code character by character and produced ',
      h('strong', null, String(result.tokens.length)), ' tokens. Each row shows one line of code.'));

    const byLine = new Map();
    for (const token of result.tokens) {
      if (!byLine.has(token.line)) byLine.set(token.line, []);
      byLine.get(token.line).push(token);
    }
    const rows = [];
    for (const [line, tokens] of byLine) {
      rows.push(h('div', { class: 'tok-row' },
        h('span', { class: 'tok-line' }, String(line)),
        h('div', { class: 'tok-chips' }, tokens.map(token => {
          const shown = token.type === 'NEWLINE' ? '↵' : token.type === 'EOF' ? '∎'
                      : token.type === 'STRING' ? `"${token.value}"` : token.value;
          return h('span', { class: 'tok tok-' + (TOKEN_GROUPS[token.type] || 'ident'), title: `${token.type} on line ${token.line}` },
            h('span', { class: 'tok-value' }, shown),
            h('span', { class: 'tok-type' }, token.type));
        }))));
    }
    panel.append(h('div', { class: 'tok-list' }, rows));
  }

  function treeItem(node) {
    const space = node.label.indexOf(' ');
    const kind = space < 0 ? node.label : node.label.slice(0, space);
    const detail = space < 0 ? '' : node.label.slice(space + 1);
    return h('li', null,
      h('span', { class: 'node node-' + (TREE_GROUPS[kind] || 'stmt') },
        h('span', { class: 'node-kind' }, kind),
        detail ? h('span', { class: 'node-detail' }, detail) : null),
      node.children.length ? h('ul', null, node.children.map(treeItem)) : null);
  }

  function renderTree(panel, result) {
    panel.replaceChildren();
    if (result.networkError) return panel.append(placeholder(result.networkError));
    if (!result.tree) return panel.append(stoppedMessage(result, 'syntax tree'));
    panel.append(
      h('p', { class: 'panel-intro' },
        'The parser arranged the tokens into this tree. To evaluate a node, the evaluator first works out its children, so the deepest operations happen first.'),
      h('ul', { class: 'tree' }, treeItem(result.tree)));
  }

  function renderStages(target, result) {
    target.replaceChildren();
    if (!result || result.networkError) return;
    const order = ['TOKENIZER', 'PARSER', 'EVALUATOR'];
    const names = ['Tokenizer', 'Parser', 'Evaluator'];
    let failAt = -1;
    if (result.error) {
      const i = order.indexOf(result.error.phase);
      failAt = i < 0 ? 2 : i; // INTERNAL errors happen while running
    }
    names.forEach((name, i) => {
      const state = failAt === -1 || i < failAt ? 'ok' : i === failAt ? 'fail' : 'skip';
      if (i > 0) target.append(h('span', { class: 'stage-sep', 'aria-hidden': 'true' }, '›'));
      target.append(h('span', {
        class: 'stage stage-' + state,
        title: { ok: 'Completed', fail: 'Stopped with an error', skip: 'Did not run' }[state],
      }, state === 'ok' ? icon('check') : state === 'fail' ? icon('cross') : null, name));
    });
  }

  function renderPlayground() {
    document.title = 'Playground · CALC';
    const initial = store.get('calc.playground', PLAYGROUND_EXAMPLES[5].code);

    const editorHost = h('div', { class: 'pg-editor-host' });
    const consoleBody = h('div', { class: 'console console-panel' }, placeholder('Click Run (or press Ctrl + Enter) to see the output.'));
    const tokensPanel = h('div', { class: 'panel-scroll' }, placeholder('Run your code to see its tokens.'));
    const treePanel = h('div', { class: 'panel-scroll' }, placeholder('Run your code to see its syntax tree.'));
    const stages = h('div', { class: 'stages', 'aria-label': 'Pipeline stages' });

    const tabs = [
      { id: 'output', label: 'Output', panel: consoleBody },
      { id: 'tokens', label: 'Tokens', panel: tokensPanel },
      { id: 'tree', label: 'Syntax tree', panel: treePanel },
    ];
    let activeTab = store.get('calc.playground.tab', 'output');
    if (!tabs.some(t => t.id === activeTab)) activeTab = 'output';

    const tabButtons = tabs.map(tab => h('button', {
      class: 'tab', type: 'button', role: 'tab', id: 'tab-' + tab.id,
      'aria-controls': 'panel-' + tab.id,
      onclick: () => selectTab(tab.id),
      onkeydown: (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = tabs.findIndex(t => t.id === activeTab);
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(next.id);
        document.getElementById('tab-' + next.id).focus();
      },
    }, tab.label));

    const panels = tabs.map(tab => h('div', {
      class: 'tab-panel', role: 'tabpanel', id: 'panel-' + tab.id, 'aria-labelledby': 'tab-' + tab.id,
    }, tab.panel));

    function selectTab(id) {
      activeTab = id;
      store.set('calc.playground.tab', id);
      tabs.forEach((tab, i) => {
        const selected = tab.id === id;
        tabButtons[i].setAttribute('aria-selected', String(selected));
        tabButtons[i].tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
    }

    let editor;
    const runButton = h('button', { class: 'btn btn-run', type: 'button' },
      icon('play'), 'Run', h('kbd', { class: 'kbd-hint' }, 'Ctrl ↵'));
    const run = withBusy(runButton, async () => {
      const result = await runCalc(editor.getValue());
      renderResult(consoleBody, result);
      renderTokens(tokensPanel, result);
      renderTree(treePanel, result);
      renderStages(stages, result);
      editor.setErrorLine(result.error && result.error.line);
    });
    runButton.addEventListener('click', run);

    const examples = h('select', {
      class: 'select', 'aria-label': 'Load an example',
      onchange: (e) => {
        const example = PLAYGROUND_EXAMPLES[Number(e.target.value)];
        if (example) { editor.setValue(example.code); editor.focus(); }
        e.target.value = '';
      },
    }, h('option', { value: '' }, 'Load an example…'),
       PLAYGROUND_EXAMPLES.map((ex, i) => h('option', { value: String(i) }, ex.name)));

    main.replaceChildren(
      h('div', { class: 'pg' },
        h('div', { class: 'pg-toolbar' },
          h('div', { class: 'pg-file' }, h('span', { class: 'pg-dot' }), 'main.calc'),
          examples,
          h('span', { class: 'pg-spacer' }),
          h('button', {
            class: 'btn btn-ghost', type: 'button',
            onclick: () => {
              consoleBody.replaceChildren(placeholder('Output cleared.'));
              stages.replaceChildren();
            },
          }, 'Clear output'),
          runButton),
        h('div', { class: 'pg-split' },
          h('section', { class: 'pg-pane pg-editor', 'aria-label': 'Code editor' }, editorHost),
          h('section', { class: 'pg-pane pg-panel', 'aria-label': 'Results' },
            h('div', { class: 'pg-panel-head' },
              h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Result views' }, tabButtons),
              stages),
            panels))));

    editor = createEditor(editorHost, {
      value: initial, onRun: run, label: 'Playground code editor',
      onChange: debounce(value => store.set('calc.playground', value), 300),
    });
    selectTab(activeTab);
    editor.focus();
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  // ─── Reference ────────────────────────────────────────────────────────────

  function renderReference() {
    document.title = 'Reference · CALC';
    main.replaceChildren(
      h('div', { class: 'page' },
        h('h1', null, 'CALC reference'),
        h('p', { class: 'lead' }, 'Everything in the language, on one page.'),

        h('h2', null, 'Syntax at a glance'),
        table([
          ['Feature', 'Syntax', 'Example'],
          ['Print', '<code>&gt;&gt; value</code>', '<code>&gt;&gt; "Hi"</code>'],
          ['Assign', '<code>name := value</code>', '<code>x := 10</code>'],
          ['If, one line', '<code>? condition =&gt; statement</code>', '<code>? x &gt; 5 =&gt; &gt;&gt; "big"</code>'],
          ['If, block', '<code>? condition =&gt;</code> … <code>end</code>', 'see below'],
          ['Loop, one line', '<code>@ count =&gt; statement</code>', '<code>@ 3 =&gt; &gt;&gt; "hi"</code>'],
          ['Loop, block', '<code>@ count =&gt;</code> … <code>end</code>', 'see below'],
          ['Comment', '<code># text</code>', '<code># a note</code>'],
        ]),
        snippet('score := 85\n? score > 50 =>\n    >> "Pass"\nend\n\ni := 1\n@ 3 =>\n    >> i\n    i := i + 1\nend'),

        h('h2', null, 'Operators and precedence'),
        table([
          ['Precedence', 'Operators', 'Notes'],
          ['Highest', '<code>*</code> <code>/</code>', 'Left to right'],
          ['', '<code>+</code> <code>-</code>', 'Left to right'],
          ['Lowest', '<code>&gt;</code> <code>&lt;</code> <code>==</code>', 'Only allowed as a <code>?</code> condition'],
        ]),

        h('h2', null, 'Values'),
        h('ul', { class: 'list' },
          h('li', { html: '<strong>Numbers</strong> are stored as decimals. Whole results print without <code>.0</code>, so <code>10 / 2</code> prints <code>5</code>. Dividing by zero gives <code>Infinity</code>.' }),
          h('li', { html: '<strong>Strings</strong> go between double quotes and must close on the same line. They can be printed and stored, but not used in arithmetic.' }),
          h('li', { html: '<strong>Variable names</strong> start with a letter or <code>_</code> and can contain letters, digits and <code>_</code>. <code>end</code> is reserved.' })),

        h('h2', null, 'Rules'),
        h('ul', { class: 'list' },
          h('li', null, 'Each statement goes on its own line.'),
          h('li', { html: 'A block starts when <code>=&gt;</code> ends the line, and runs until its matching <code>end</code>. Blocks can be nested.' }),
          h('li', { html: 'A loop count must be a whole number written in the code, such as <code>@ 5</code>.' }),
          h('li', { html: 'Not supported yet: <code>else</code>, parentheses, negative literals (write <code>0 - 5</code>), joining strings.' })),

        h('h2', null, 'Error messages'),
        h('p', { html: 'Every error has the form <code>[STAGE ERROR] Line N: message</code>.' }),
        table([
          ['Stage', 'Message', 'How to fix it'],
          ['Tokenizer', 'Unexpected character \'$\'', 'Remove the symbol. CALC variables have no <code>$</code> prefix.'],
          ['Tokenizer', 'Unterminated string', 'Add the closing <code>"</code> on the same line.'],
          ['Tokenizer', 'Invalid number \'1.2.\'', 'A number can have only one decimal point.'],
          ['Parser', 'Missing \'end\' for the \'@\' block…', 'Add <code>end</code> after the last line of the block.'],
          ['Parser', '\'end\' without a matching \'?\' or \'@\' block', 'Remove the extra <code>end</code>.'],
          ['Parser', 'Each statement must be on its own line', 'Split the line in two.'],
          ['Parser', 'Expected \':=\' after variable name', 'Assign with <code>:=</code>, not <code>=</code>.'],
          ['Evaluator', 'Variable \'x\' is not defined', 'Assign the variable before you use it, and check the spelling.'],
          ['Evaluator', 'Operator \'+\' needs numbers', 'Arithmetic only works on numbers, not strings.'],
          ['Evaluator', 'Condition after \'?\' must be a comparison', 'Compare with <code>&gt;</code>, <code>&lt;</code> or <code>==</code>.'],
        ]),

        h('h2', null, 'Editor shortcuts'),
        table([
          ['Keys', 'Action'],
          ['<kbd>Ctrl</kbd> + <kbd>Enter</kbd>', 'Run the code'],
          ['<kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>', 'Indent / unindent'],
          ['<kbd>Ctrl</kbd> + <kbd>/</kbd>', 'Comment or uncomment the selected lines'],
          ['<kbd>Enter</kbd> after <code>=&gt;</code>', 'Starts an indented block'],
          ['<kbd>Esc</kbd>, then <kbd>Tab</kbd>', 'Move focus out of the editor'],
        ]),

        h('h2', null, 'Playground limits'),
        h('ul', { class: 'list' },
          h('li', null, 'Programs stop after 1,000,000 loop iterations.'),
          h('li', null, 'Output is cut off after 5,000 lines.'),
          h('li', null, 'Programs can be up to 64 KB.'))),
      footer());
  }

  function renderNotFound() {
    document.title = 'Not found · CALC';
    main.replaceChildren(h('div', { class: 'page' },
      h('h1', null, 'Page not found'),
      h('p', null, 'That page doesn\'t exist. ', h('a', { href: '#/' }, 'Go to the home page'), '.')));
  }

  // ─── Router ───────────────────────────────────────────────────────────────

  const routes = [
    [/^#?\/?$/, renderHome],
    [/^#\/learn\/?$/, () => renderLesson(LESSONS[0].id)],
    [/^#\/learn\/([\w-]+)$/, m => renderLesson(m[1])],
    [/^#\/playground$/, renderPlayground],
    [/^#\/reference$/, renderReference],
  ];

  function route() {
    const hash = location.hash || '#/';
    const section = (hash.match(/^#\/(\w+)/) || [])[1] || 'home';
    document.body.dataset.page = section;
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    for (const [pattern, render] of routes) {
      const match = hash.match(pattern);
      if (match) { render(match); window.scrollTo(0, 0); return; }
    }
    renderNotFound();
  }

  // ─── Theme ────────────────────────────────────────────────────────────────

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('calc.theme', next);
  });

  window.addEventListener('hashchange', route);
  route();
})();
