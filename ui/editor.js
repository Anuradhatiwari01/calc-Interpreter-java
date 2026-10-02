/*
 * CALC code editor — a <textarea> layered over a syntax-highlighted <pre>.
 * No libraries. The textarea handles typing, selection and undo; the <pre>
 * underneath shows the colours. Both scroll together.
 */
(function () {
  'use strict';

  const INDENT = '    ';

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Mirrors the Java tokenizer closely enough for colouring. Strings never span
  // lines in CALC, so each line can be highlighted on its own.
  const TOKEN_RE = /(#.*$)|("[^"]*"?)|(\d[\d.]*)|(:=|>>|=>|==|[+\-*\/<>?@])|([\p{L}_][\p{L}\p{Nd}_]*)|(\s+)|(.)/gu;

  function highlightLine(line) {
    let html = '';
    TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = TOKEN_RE.exec(line)) !== null) {
      const text = escapeHtml(m[0]);
      if (m[1])      html += `<span class="tk-comment">${text}</span>`;
      else if (m[2]) html += `<span class="${m[2].length > 1 && m[2].endsWith('"') ? 'tk-string' : 'tk-invalid'}">${text}</span>`;
      else if (m[3]) html += `<span class="${(m[3].match(/\./g) || []).length > 1 ? 'tk-invalid' : 'tk-number'}">${text}</span>`;
      else if (m[4]) html += `<span class="${/^(>>|\?|@|=>)$/.test(m[4]) ? 'tk-keyword' : 'tk-op'}">${text}</span>`;
      else if (m[5]) html += `<span class="${m[5] === 'end' ? 'tk-keyword' : 'tk-ident'}">${text}</span>`;
      else if (m[6]) html += text;
      else           html += `<span class="tk-invalid">${text}</span>`;
      if (m[0].length === 0) TOKEN_RE.lastIndex++;
    }
    return html;
  }

  function highlightCode(code) {
    return code.split('\n').map(highlightLine).join('\n');
  }

  /**
   * createEditor(host, { value, onRun, onChange, autoHeight, minLines, label })
   * Returns { getValue, setValue, setErrorLine, focus, element }.
   */
  function createEditor(host, opts) {
    opts = opts || {};
    const root = document.createElement('div');
    root.className = 'editor' + (opts.autoHeight ? ' editor-auto' : '');

    const gutter = document.createElement('div');
    gutter.className = 'editor-gutter';
    gutter.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'editor-body';

    const pre = document.createElement('pre');
    pre.className = 'editor-highlight';
    pre.setAttribute('aria-hidden', 'true');

    const ta = document.createElement('textarea');
    ta.className = 'editor-input';
    ta.spellcheck = false;
    ta.setAttribute('autocapitalize', 'off');
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('autocorrect', 'off');
    ta.setAttribute('wrap', 'off');
    ta.setAttribute('aria-label', opts.label || 'CALC code editor');
    ta.value = opts.value || '';

    body.append(pre, ta);
    root.append(gutter, body);
    host.appendChild(root);

    let errorLine = 0;
    let tabEscapes = false; // after Escape, Tab moves focus instead of indenting

    function render() {
      const lines = ta.value.split('\n');
      pre.innerHTML = lines.map((line, i) =>
        `<div class="hl-line${i + 1 === errorLine ? ' is-error' : ''}">${highlightLine(line) || ' '}</div>`
      ).join('');
      gutter.innerHTML = lines.map((_, i) =>
        `<div${i + 1 === errorLine ? ' class="is-error"' : ''}>${i + 1}</div>`
      ).join('');
      if (opts.autoHeight) {
        const count = Math.max(lines.length, opts.minLines || 1);
        root.style.setProperty('--lines', count);
      }
      sync();
    }

    function sync() {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
      gutter.scrollTop = ta.scrollTop;
    }

    // Insert text at the selection, keeping the browser's undo history where possible.
    function insert(text) {
      ta.focus();
      const ok = document.execCommand && document.execCommand('insertText', false, text);
      if (!ok) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    }

    // Replace whole lines [startLine..endLine] covering the selection.
    function transformLines(fn) {
      const value = ta.value;
      const start = value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
      let end = value.indexOf('\n', ta.selectionEnd);
      if (end === -1) end = value.length;
      const original = value.slice(start, end);
      const replaced = fn(original.split('\n')).join('\n');
      ta.setSelectionRange(start, end);
      insert(replaced);
      ta.setSelectionRange(start, start + replaced.length);
    }

    ta.addEventListener('input', () => {
      if (errorLine) errorLine = 0;
      render();
      if (opts.onChange) opts.onChange(ta.value);
    });
    ta.addEventListener('scroll', sync);

    ta.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'Enter') {
        e.preventDefault();
        if (opts.onRun) opts.onRun();
        return;
      }
      if (e.key === 'Escape') { tabEscapes = true; return; }

      if (e.key === 'Tab' && !mod && !e.altKey) {
        if (tabEscapes) { tabEscapes = false; return; } // let focus move on
        e.preventDefault();
        const multiLine = ta.value.slice(ta.selectionStart, ta.selectionEnd).includes('\n');
        if (e.shiftKey) {
          transformLines(lines => lines.map(l => l.replace(/^ {1,4}/, '')));
        } else if (multiLine) {
          transformLines(lines => lines.map(l => INDENT + l));
        } else {
          insert(INDENT);
        }
        return;
      }
      tabEscapes = false;

      if (mod && e.key === '/') {
        e.preventDefault();
        transformLines(lines => {
          const allCommented = lines.every(l => l.trim() === '' || /^\s*#/.test(l));
          return lines.map(l => {
            if (l.trim() === '') return l;
            return allCommented ? l.replace(/^(\s*)# ?/, '$1') : l.replace(/^(\s*)/, '$1# ');
          });
        });
        return;
      }

      if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const before = ta.value.slice(0, ta.selectionStart);
        const currentLine = before.slice(before.lastIndexOf('\n') + 1);
        let indent = (currentLine.match(/^\s*/) || [''])[0];
        if (/=>\s*$/.test(currentLine)) indent += INDENT; // a block starts on the next line
        insert('\n' + indent);
      }
    });

    render();

    return {
      element: root,
      getValue: () => ta.value,
      setValue(value) {
        ta.value = value;
        errorLine = 0;
        ta.scrollTop = 0;
        ta.scrollLeft = 0;
        render();
        if (opts.onChange) opts.onChange(value);
      },
      setErrorLine(line) {
        errorLine = line || 0;
        render();
        if (errorLine) {
          const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 22;
          const top = (errorLine - 1) * lineHeight;
          if (top < ta.scrollTop || top > ta.scrollTop + ta.clientHeight - lineHeight * 2) {
            ta.scrollTop = Math.max(0, top - ta.clientHeight / 3);
          }
        }
      },
      focus: () => ta.focus(),
    };
  }

  window.CalcEditor = { createEditor, highlightCode, highlightLine, escapeHtml };
})();
