// The worksheet "paper": header fields, problem list, reorder / edit / duplicate / delete.
import { getState, update, subscribe, setEditing } from '../state.js';
import { renderInto } from '../render.js';
import { t, tn, LANGUAGES, isLanguage } from '../strings.js';
import { toast } from './toast.js';
import { getGenerator, generate, newSeed } from '../generators/index.js';
import { $, h } from './dom.js';

export function initWorksheetView({ onLoadExample }) {
  const list = $('#problem-list');
  const empty = $('#empty-state');
  const titleInput = $('#ws-title');
  const subjectInput = $('#ws-subject');
  const fieldsRow = $('#ws-fields');
  const showAnswers = $('#opt-answers');
  const showFields = $('#opt-fields');
  const numbering = $('#opt-numbering');
  const total = $('#total-points');
  const language = $('#opt-language');
  language.append(...LANGUAGES.map((l) => h('option', { value: l.code, text: l.name })));

  $('#btn-example').addEventListener('click', onLoadExample);

  // Header and settings write to state without re-drawing, so typing never loses focus.
  titleInput.addEventListener('input', () => update((s) => { s.worksheet.meta.title = titleInput.value; }, { render: false }));
  subjectInput.addEventListener('input', () => update((s) => { s.worksheet.meta.subject = subjectInput.value; }, { render: false }));
  showAnswers.addEventListener('change', () => update((s) => { s.worksheet.settings.showAnswers = showAnswers.checked; }));
  showFields.addEventListener('change', () => update((s) => { s.worksheet.settings.showNameDateFields = showFields.checked; }));
  language.addEventListener('change', () => { if (isLanguage(language.value)) update((s) => { s.worksheet.meta.language = language.value; }); });
  numbering.addEventListener('change', () => update((s) => { s.worksheet.settings.numbering = numbering.value; }));

  // ---- actions
  const indexOf = (id) => getState().worksheet.problems.findIndex((p) => p.id === id);

  function move(id, delta, focusAction) {
    const from = indexOf(id);
    const to = from + delta;
    if (from === -1 || to < 0 || to >= getState().worksheet.problems.length) return;
    update((s) => {
      const [item] = s.worksheet.problems.splice(from, 1);
      s.worksheet.problems.splice(to, 0, item);
    });
    list.querySelector(`[data-id="${id}"] [data-action="${focusAction}"]`)?.focus();
  }

  function moveBefore(id, targetId, after) {
    update((s) => {
      const arr = s.worksheet.problems;
      const [item] = arr.splice(arr.findIndex((p) => p.id === id), 1);
      let to = arr.findIndex((p) => p.id === targetId);
      if (after) to += 1;
      arr.splice(to, 0, item);
    });
  }

  function duplicate(id) {
    const from = indexOf(id);
    update((s) => {
      const copy = JSON.parse(JSON.stringify(s.worksheet.problems[from]));
      copy.id = `${copy.id}_c${Math.random().toString(36).slice(2, 5)}`;
      s.worksheet.problems.splice(from + 1, 0, copy);
    });
    list.querySelector(`[data-id="${id}"] [data-action="duplicate"]`)?.focus();
  }

  function regenerate(id) {
    const p = getState().worksheet.problems[indexOf(id)];
    if (!p || !getGenerator(p.generator)) return;
    if (p.edited && !window.confirm(t('confirm.regenerateEdited'))) return;
    let fresh = null;
    let seed = 0;
    try {
      for (let i = 0; i < 10; i++) { // try a few seeds so the new problem differs from the old one
        seed = newSeed();
        fresh = generate(p.generator, p.params, seed, getState().worksheet.meta.language);
        if (fresh.statement !== p.statement) break;
      }
    } catch {
      toast(t('toast.regenerateFailed'));
      return;
    }
    update((s) => {
      const q = s.worksheet.problems.find((x) => x.id === id);
      Object.assign(q, { params: fresh.params, seed, statement: fresh.statement, answer: fresh.answer, solution: fresh.solution });
      delete q.edited;
      if (s.editingId === id) s.editingId = null; // the open form would be out of date
    });
    list.querySelector(`[data-id="${id}"] [data-action="regenerate"]`)?.focus();
  }

  function remove(id) {
    const index = indexOf(id);
    const removed = getState().worksheet.problems[index];
    update((s) => {
      s.worksheet.problems.splice(index, 1);
      if (s.editingId === id) s.editingId = null;
    });
    // keyboard users keep their place: focus the next problem (or the previous one)
    const rows = [...list.children];
    (rows[index] ?? rows[index - 1])?.querySelector('[data-action="edit"]')?.focus();
    if (rows.length === 0) $('#btn-example').focus();
    toast(t('toast.deleted'), {
      actionLabel: t('toast.undo'),
      onAction: () => update((s) => { s.worksheet.problems.splice(Math.min(index, s.worksheet.problems.length), 0, removed); }),
    });
  }

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.closest('li').dataset.id;
    switch (btn.dataset.action) {
      case 'up': move(id, -1, 'up'); break;
      case 'down': move(id, 1, 'down'); break;
      case 'edit': setEditing(id); break;
      case 'duplicate': duplicate(id); break;
      case 'regenerate': regenerate(id); break;
      case 'delete': remove(id); break;
    }
  });

  // ---- drag and drop (move up/down buttons are the keyboard alternative)
  let dragId = null;
  const clearMarks = () => list.querySelectorAll('.drop-before, .drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after'));
  const endDrag = () => {
    dragId = null;
    clearMarks();
    list.querySelectorAll('li').forEach((li) => { li.draggable = false; li.classList.remove('is-dragging'); });
  };
  const isAfter = (e, li) => {
    const r = li.getBoundingClientRect();
    return e.clientY > r.top + r.height / 2;
  };

  list.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (handle) handle.closest('li').draggable = true;
  });
  document.addEventListener('pointerup', () => { if (!dragId) list.querySelectorAll('li').forEach((li) => { li.draggable = false; }); });
  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('li.ws-problem');
    if (!li || !li.draggable) return;
    dragId = li.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    li.classList.add('is-dragging');
  });
  list.addEventListener('dragover', (e) => {
    if (!dragId) return;
    e.preventDefault();
    clearMarks();
    const li = e.target.closest('li.ws-problem');
    if (li && li.dataset.id !== dragId) li.classList.add(isAfter(e, li) ? 'drop-after' : 'drop-before');
  });
  list.addEventListener('drop', (e) => {
    if (!dragId) return;
    e.preventDefault();
    const li = e.target.closest('li.ws-problem');
    const id = dragId;
    const after = li ? isAfter(e, li) : false;
    endDrag();
    if (li && li.dataset.id !== id) moveBefore(id, li.dataset.id, after);
  });
  list.addEventListener('dragend', endDrag);

  // ---- drawing
  function problemItem(p, number, settings) {
    const label = t('problem.label', { n: number });
    const body = h('div', { class: 'ws-statement' });
    renderInto(body, p.statement);

    const meta = h('div', { class: 'problem-meta' },
      h('span', { class: 'ws-points', text: tn('problem.pts', p.points) }),
      p.type === 'generated' && h('span', { class: 'badge', text: t('problem.generated') }),
      p.edited && h('span', { class: 'badge', text: t('problem.edited') }),
      p.tags.map((tag) => h('span', { class: 'tag', text: tag })),
    );

    const answers = [];
    if (settings.showAnswers && p.answer) {
      const a = h('span', { class: 'ws-answer-text' });
      renderInto(a, p.answer);
      answers.push(h('div', { class: 'ws-answer' }, h('strong', { text: t('problem.answer') + ' ' }), a));
    }
    if (settings.showAnswers && p.solution) {
      const s = h('span');
      renderInto(s, p.solution);
      answers.push(h('div', { class: 'ws-solution' }, h('strong', { text: t('problem.solution') + ' ' }), s));
    }

    const tool = (action, text, extra = {}) => h('button', {
      type: 'button', class: 'btn small', text, dataset: { action }, 'aria-label': `${text}, ${label}`, ...extra,
    });
    const tools = h('div', { class: 'problem-tools', role: 'group', 'aria-label': t('problem.tools', { n: number }) },
      h('span', { class: 'drag-handle', text: '⋮⋮', title: t('problem.drag'), 'aria-hidden': 'true' }),
      tool('up', '↑', { title: t('problem.up'), 'aria-label': `${t('problem.up')}, ${label}` }),
      tool('down', '↓', { title: t('problem.down'), 'aria-label': `${t('problem.down')}, ${label}` }),
      tool('edit', t('problem.edit')),
      p.type === 'generated' && getGenerator(p.generator) && tool('regenerate', t('problem.regenerate')),
      tool('duplicate', t('problem.duplicate')),
      tool('delete', t('problem.delete'), { class: 'btn small danger' }),
    );

    return h('li', {
      class: 'ws-problem' + (getState().editingId === p.id ? ' is-editing' : ''),
      dataset: { id: p.id },
    }, tools, body, answers, meta);
  }

  function render(kind, state) {
    if (kind !== 'render') return;
    const { meta, settings, problems } = state.worksheet;

    if (titleInput.value !== meta.title) titleInput.value = meta.title;
    if (subjectInput.value !== meta.subject) subjectInput.value = meta.subject;
    showAnswers.checked = settings.showAnswers;
    showFields.checked = settings.showNameDateFields;
    numbering.value = settings.numbering;
    language.value = meta.language;
    fieldsRow.hidden = !settings.showNameDateFields;
    list.dataset.numbering = settings.numbering;

    list.replaceChildren(...problems.map((p, i) => problemItem(p, i + 1, settings)));
    empty.hidden = problems.length > 0;

    const points = problems.reduce((sum, p) => sum + p.points, 0);
    total.textContent = problems.length ? tn('controls.total', Math.round(points * 100) / 100) : '';
  }

  subscribe(render);
  render('render', getState());
}
