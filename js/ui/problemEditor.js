// The "Write a problem" form with live KaTeX preview. Also edits existing problems.
import { getState, update, subscribe, setEditing } from '../state.js';
import { newProblem } from '../schema.js';
import { renderInto } from '../render.js';
import { t } from '../strings.js';
import { toast } from './toast.js';
import { $, h } from './dom.js';

// "|" marks where the cursor goes; selected text is wrapped at that spot.
const SNIPPETS = [
  { label: '$ $', insert: '$|$', title: 'Inline math' },
  { label: '$$ $$', insert: '$$|$$', title: 'Display math' },
  { label: 'a/b', insert: '\\frac{|}{}', title: 'Fraction' },
  { label: '√', insert: '\\sqrt{|}', title: 'Square root' },
  { label: 'xⁿ', insert: '^{|}', title: 'Power' },
  { label: 'xₙ', insert: '_{|}', title: 'Subscript' },
  { label: '×', insert: '\\times ', title: 'Times' },
  { label: '÷', insert: '\\div ', title: 'Divide' },
  { label: '≤', insert: '\\leq ', title: 'Less than or equal' },
  { label: '≥', insert: '\\geq ', title: 'Greater than or equal' },
  { label: 'π', insert: '\\pi ', title: 'Pi' },
];

export function initProblemEditor() {
  const form = $('#problem-form');
  const fields = {
    statement: $('#f-statement'),
    answer: $('#f-answer'),
    solution: $('#f-solution'),
    points: $('#f-points'),
    tags: $('#f-tags'),
  };
  const submitBtn = $('#btn-submit');
  const cancelBtn = $('#btn-cancel');
  const statementError = $('#err-statement');
  const editingNote = $('#editing-note');
  const mathErrors = $('#math-errors');
  const previews = { statement: $('#pv-statement'), answer: $('#pv-answer'), solution: $('#pv-solution') };
  Object.values(previews).forEach((el) => { el.dataset.empty = t('form.previewEmpty'); });

  let loadedId = null;
  let lastField = fields.statement;
  let previewTimer = null;

  // ---- insert-math toolbar
  const toolbar = $('#snippet-bar');
  SNIPPETS.forEach((s) => {
    toolbar.append(h('button', {
      type: 'button', class: 'btn small snippet', text: s.label, title: s.title, 'aria-label': s.title,
      onmousedown: (e) => e.preventDefault(), // keep focus (and selection) in the text field
      onclick: () => insertSnippet(s.insert),
    }));
  });
  form.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLTextAreaElement) lastField = e.target;
  });

  function insertSnippet(snippet) {
    const field = lastField;
    const { selectionStart: start, selectionEnd: end, value } = field;
    const selected = value.slice(start, end);
    const marker = snippet.indexOf('|');
    const text = marker === -1 ? snippet : snippet.replace('|', () => selected);
    const caret = marker === -1 ? start + text.length : start + marker + selected.length;
    field.value = value.slice(0, start) + text + value.slice(end);
    field.focus();
    field.setSelectionRange(caret, caret);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ---- live preview
  function renderPreview() {
    const errors = [];
    for (const key of ['statement', 'answer', 'solution']) {
      const value = fields[key].value;
      errors.push(...renderInto(previews[key], value));
      previews[key].closest('.preview-row').hidden = key !== 'statement' && value.trim() === '';
    }
    mathErrors.replaceChildren(...[...new Set(errors)].map((msg) => h('li', { text: t('form.mathError', { msg }) })));
    mathErrors.hidden = errors.length === 0;
  }
  const schedulePreview = () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 120);
  };
  Object.values(fields).forEach((f) => f.addEventListener('input', schedulePreview));
  fields.statement.addEventListener('input', () => { statementError.hidden = true; fields.statement.removeAttribute('aria-invalid'); });

  // ---- form <-> state
  const parseTags = (text) => [...new Set(text.split(',').map((s) => s.trim()).filter(Boolean))];
  const parsePoints = (text) => {
    const n = Number(text);
    return text.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : 1;
  };

  function resetForm() {
    form.reset();
    fields.points.value = '1';
    submitBtn.textContent = t('form.add');
    cancelBtn.hidden = true;
    editingNote.hidden = true;
    statementError.hidden = true;
    fields.statement.removeAttribute('aria-invalid');
    renderPreview();
  }

  function loadFromState(state) {
    if (state.editingId === loadedId) return;
    loadedId = state.editingId;
    if (!loadedId) { resetForm(); return; }

    const index = state.worksheet.problems.findIndex((p) => p.id === loadedId);
    if (index === -1) { state.editingId = null; loadedId = null; resetForm(); return; }
    const p = state.worksheet.problems[index];

    fields.statement.value = p.statement;
    fields.answer.value = p.answer;
    fields.solution.value = p.solution;
    fields.points.value = String(p.points);
    fields.tags.value = p.tags.join(', ');
    submitBtn.textContent = t('form.save');
    cancelBtn.hidden = false;
    editingNote.textContent = t('form.editing', { n: index + 1 });
    editingNote.hidden = false;
    statementError.hidden = true;
    $('#tab-btn-custom').click();
    renderPreview();
    fields.statement.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const statement = fields.statement.value.trim();
    if (!statement) {
      statementError.textContent = t('form.statementRequired');
      statementError.hidden = false;
      fields.statement.setAttribute('aria-invalid', 'true');
      fields.statement.focus();
      return;
    }
    const values = {
      statement,
      answer: fields.answer.value.trim(),
      solution: fields.solution.value.trim(),
      points: parsePoints(fields.points.value),
      tags: parseTags(fields.tags.value),
    };

    const editingId = getState().editingId;
    if (editingId) {
      update((s) => {
        const p = s.worksheet.problems.find((x) => x.id === editingId);
        const changed = ['statement', 'answer', 'solution'].some((k) => p[k] !== values[k]);
        Object.assign(p, values);
        if (p.type === 'generated' && changed) p.edited = true; // so "regenerate" never overwrites silently
        s.editingId = null;
      });
      toast(t('toast.updated'));
    } else {
      update((s) => { s.worksheet.problems.push(newProblem(values)); });
      toast(t('toast.added'));
      resetForm();
      fields.statement.focus();
    }
  });

  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); form.requestSubmit(); }
  });
  cancelBtn.addEventListener('click', () => setEditing(null));

  subscribe((kind, state) => loadFromState(state));
  resetForm();
}
