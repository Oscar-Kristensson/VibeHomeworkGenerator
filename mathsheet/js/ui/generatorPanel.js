// The "Generate" tab: pick a generator, adjust its settings, add several problems at once.
import { getState, update } from '../state.js';
import { uid } from '../schema.js';
import { categories, getGenerator, defaultParams, normalizeParams, generate, newSeed } from '../generators/index.js';
import { t, tn } from '../strings.js';
import { toast } from './toast.js';
import { $, h } from './dom.js';

const MAX_COUNT = 50;

export function initGeneratorPanel() {
  const form = $('#generate-form');
  const select = $('#g-generator');
  const paramsBox = $('#g-params');
  const countInput = $('#g-count');
  const pointsInput = $('#g-points');
  const errorEl = $('#g-error');

  const remembered = new Map(); // generator id -> params the teacher chose in this session
  let current = null;

  for (const group of categories()) {
    select.append(h('optgroup', { label: group.name },
      group.generators.map((g) => h('option', { value: g.id, text: g.name }))));
  }

  const input = (key) => paramsBox.querySelector(`[data-key="${key}"]`);

  /** Builds the settings form straight from the generator's paramSchema. */
  function buildParams(gen, values) {
    paramsBox.replaceChildren(...gen.paramSchema.map((spec) => {
      const id = `gp-${spec.key}`;
      if (spec.type === 'bool') {
        const box = h('input', { type: 'checkbox', id, dataset: { key: spec.key } });
        box.checked = Boolean(values[spec.key]);
        return h('label', { class: 'check wide', for: id }, box, h('span', { text: spec.label }));
      }
      if (spec.type === 'select') {
        const sel = h('select', { id, dataset: { key: spec.key } },
          spec.options.map((o) => h('option', { value: o.value, text: o.label })));
        sel.value = values[spec.key];
        return h('div', { class: 'field wide' }, h('label', { for: id, text: spec.label }), sel);
      }
      return h('div', { class: 'field' },
        h('label', { for: id, text: spec.label }),
        h('input', { type: 'number', id, step: 1, min: spec.min, max: spec.max, value: values[spec.key], inputmode: 'numeric', dataset: { key: spec.key } }));
    }));
  }

  function readParams(gen) {
    const raw = {};
    for (const spec of gen.paramSchema) {
      const el = input(spec.key);
      raw[spec.key] = spec.type === 'bool' ? el.checked : el.value;
    }
    return normalizeParams(gen, raw);
  }

  function show(id) {
    if (current) remembered.set(current.id, readParams(current));
    current = getGenerator(id);
    buildParams(current, remembered.get(id) ?? defaultParams(current));
    errorEl.hidden = true;
  }

  select.addEventListener('change', () => show(select.value));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const gen = current;
    const count = Math.floor(Number(countInput.value));
    if (!(count >= 1 && count <= MAX_COUNT)) {
      errorEl.textContent = t('gen.countInvalid', { max: MAX_COUNT });
      errorEl.hidden = false;
      countInput.focus();
      return;
    }
    errorEl.hidden = true;

    const params = readParams(gen);
    buildParams(gen, params); // show the repaired values the generator will really use
    const points = Number(pointsInput.value);
    const pointsEach = pointsInput.value.trim() !== '' && Number.isFinite(points) && points >= 0 ? points : 1;

    // Skip statements that are already on the worksheet or already in this batch.
    const seen = new Set(getState().worksheet.problems.map((p) => p.statement));
    const made = [];
    for (let attempts = 0; made.length < count && attempts < count * 30; attempts++) {
      const seed = newSeed();
      const r = generate(gen.id, params, seed);
      if (seen.has(r.statement)) continue;
      seen.add(r.statement);
      made.push({
        id: uid(), type: 'generated', generator: gen.id, params: r.params, seed,
        statement: r.statement, answer: r.answer, solution: r.solution,
        points: pointsEach, tags: [gen.category.toLowerCase()],
      });
    }

    if (made.length === 0) {
      errorEl.textContent = t('gen.noneNew');
      errorEl.hidden = false;
      return;
    }

    update((s) => { s.worksheet.problems.push(...made); });
    const ids = new Set(made.map((p) => p.id));
    const message = made.length < count
      ? t('toast.generatedFewer', { made: made.length, wanted: count })
      : tn('toast.generated', made.length);
    toast(message, {
      actionLabel: t('toast.undo'),
      onAction: () => update((s) => { s.worksheet.problems = s.worksheet.problems.filter((p) => !ids.has(p.id)); }),
    });
    document.querySelector(`[data-id="${made[0].id}"]`)?.scrollIntoView({ block: 'nearest' });
  });

  select.value = select.options[0].value;
  show(select.value);
}
