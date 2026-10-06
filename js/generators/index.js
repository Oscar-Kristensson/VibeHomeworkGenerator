// Generator registry. To add a generator, create a module that exports an array of generators
// (see arithmetic.js) and add it to the list below.
import arithmetic from './arithmetic.js';
import fractions from './fractions.js';
import linearEquations from './linearEquations.js';
import quadratics from './quadratics.js';
import percentages from './percentages.js';
import powers from './powers.js';
import geometry from './geometry.js';
import derivatives from './derivatives.js';
import { createRng } from './rng.js';
import { phraseBook } from './phrases.js';

export { newSeed } from './rng.js';

export const generators = [
  ...arithmetic,
  ...fractions,
  ...linearEquations,
  ...quadratics,
  ...percentages,
  ...powers,
  ...geometry,
  ...derivatives,
];

const byId = new Map(generators.map((g) => [g.id, g]));

export const getGenerator = (id) => byId.get(id) ?? null;

/** [{ name, generators: [...] }] in registry order. */
export function categories() {
  const groups = new Map();
  for (const g of generators) {
    if (!groups.has(g.category)) groups.set(g.category, []);
    groups.get(g.category).push(g);
  }
  return [...groups].map(([name, list]) => ({ name, generators: list }));
}

export function defaultParams(gen) {
  return Object.fromEntries(gen.paramSchema.map((spec) => [spec.key, spec.default]));
}

/** Fills in missing values and repairs invalid ones, so hand-edited params never crash a generator. */
export function normalizeParams(gen, params = {}) {
  const out = {};
  for (const spec of gen.paramSchema) {
    const value = params?.[spec.key];
    if (spec.type === 'int') {
      let n = Math.round(Number(value));
      if (value === '' || value == null || !Number.isFinite(n)) n = spec.default;
      if (spec.min !== undefined) n = Math.max(spec.min, n);
      if (spec.max !== undefined) n = Math.min(spec.max, n);
      out[spec.key] = n;
    } else if (spec.type === 'bool') {
      out[spec.key] = typeof value === 'boolean' ? value : spec.default;
    } else if (spec.type === 'select') {
      out[spec.key] = spec.options.some((o) => o.value === value) ? value : spec.default;
    } else {
      out[spec.key] = spec.default;
    }
  }
  return out;
}

/** Same generator + params + seed + language always gives the same result. */
export function generate(id, params, seed, lang = 'en') {
  const gen = getGenerator(id);
  if (!gen) throw new Error(`Unknown generator: ${id}`);
  const normalized = normalizeParams(gen, params);
  const result = gen.generate(normalized, createRng(seed), phraseBook(lang));
  return { params: normalized, ...result };
}
