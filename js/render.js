// Turns text containing $...$ and $$...$$ into DOM nodes, rendering the math with KaTeX.
// User text is only ever inserted as text nodes, never as HTML.

/** Splits source into [{type: "text" | "inline" | "display", value}]. "\$" is a literal dollar sign. */
export function splitMath(src) {
  const out = [];
  let buf = '';
  let i = 0;
  const flush = () => { if (buf) { out.push({ type: 'text', value: buf }); buf = ''; } };

  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && src[i + 1] === '$') { buf += '$'; i += 2; continue; }
    if (c === '$') {
      const display = src[i + 1] === '$';
      const delim = display ? '$$' : '$';
      const start = i + delim.length;
      let j = start;
      let end = -1;
      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src.startsWith(delim, j)) { end = j; break; }
        j++;
      }
      if (end > start) {
        flush();
        out.push({ type: display ? 'display' : 'inline', value: src.slice(start, end) });
        i = end + delim.length;
        continue;
      }
    }
    buf += c;
    i++;
  }
  flush();
  return out;
}

/** Renders text into el. Returns a list of KaTeX error messages (empty when everything rendered). */
export function renderInto(el, text) {
  el.replaceChildren();
  const errors = [];
  const katex = window.katex;

  for (const seg of splitMath(text ?? '')) {
    if (seg.type === 'text') { el.append(document.createTextNode(seg.value)); continue; }

    const span = document.createElement('span');
    span.className = seg.type === 'display' ? 'ws-math ws-math-display' : 'ws-math';
    if (!katex) { span.textContent = seg.value; el.append(span); continue; }

    try {
      katex.render(seg.value, span, { displayMode: seg.type === 'display', throwOnError: true, strict: 'ignore', trust: false });
    } catch (err) {
      const message = String(err.message || err).replace(/^KaTeX parse error:\s*/, '');
      const delim = seg.type === 'display' ? '$$' : '$';
      span.className = 'math-error';
      span.textContent = delim + seg.value + delim;
      span.title = message;
      errors.push(message);
    }
    el.append(span);
  }
  return errors;
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Same as renderInto, but returns an HTML string (used by the export). Text is escaped; only KaTeX output is trusted.
 * Formulas KaTeX cannot parse are shown as escaped plain text and reported through onError(message).
 */
export function renderToHtml(text, katex = window.katex, onError = () => {}) {
  return splitMath(text ?? '').map((seg) => {
    if (seg.type === 'text') return escapeHtml(seg.value);
    const display = seg.type === 'display';
    try {
      const html = katex.renderToString(seg.value, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false });
      return `<span class="ws-math${display ? ' ws-math-display' : ''}">${html}</span>`;
    } catch (err) {
      onError(String(err.message || err).replace(/^KaTeX parse error:\s*/, ''));
      const delim = display ? '$$' : '$';
      return `<span class="math-error">${escapeHtml(delim + seg.value + delim)}</span>`;
    }
  }).join('');
}
