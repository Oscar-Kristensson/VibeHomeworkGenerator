// Sanity checks for generators. Pure ES module: used by tests/run.mjs (Node) and, later, tests.html.
// Each check re-reads the generated text and verifies the math independently of the generator code.
import { splitMath } from '../js/render.js';
import { createRng } from '../js/generators/rng.js';
import { normalizeParams, defaultParams, generate } from '../js/generators/index.js';
import { gcd } from '../js/generators/helpers.js';

const mathParts = (text) => splitMath(text).filter((s) => s.type !== 'text').map((s) => s.value);
const firstMath = (text) => mathParts(text)[0];
const evalNum = (expr) => new Function(`return (${expr});`)();
const fracs = (tex) => [...tex.matchAll(/\\dfrac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])]);
const asFrac = (tex) => {
  const f = fracs(tex)[0];
  return f ?? [Number(tex), 1];
};
const reduced = ([n, d]) => gcd(n, d) === 1;

/** Turns a tiny TeX polynomial / equation into JavaScript. */
const toJs = (tex) => tex
  .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '(($1)/($2))')
  .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
  .replace(/(\d)\s*x/g, '$1*x')
  .replace(/\)\s*\(/g, ')*(')
  .replace(/\)\s*x/g, ')*x')
  .replace(/\^\{?(\d+)\}?/g, '**$1')
  .replace(/(x\*\*\d+)/g, '($1)'); // JavaScript rejects "-x**2" without parentheses

const numbers = (text) => [...text.matchAll(/\$(\d+)\\text/g)].map((m) => Number(m[1]));
const answerNumber = (r) => Number(firstMath(r.answer).match(/^(\d+)/)[1]);

const SPECIFIC = {
  'powers.evaluate'(r) {
    const value = evalNum(toJs(firstMath(r.statement)));
    return value === Number(firstMath(r.answer)) ? null : `wrong power: ${r.statement} -> ${r.answer}`;
  },
  'powers.roots'(r) {
    const m = firstMath(r.statement).match(/^\\sqrt(\[3\])?\{(\d+)\}$/);
    if (!m) return `unexpected root format: ${r.statement}`;
    const k = m[1] ? 3 : 2;
    const root = Number(firstMath(r.answer));
    return root ** k === Number(m[2]) ? null : `${root}^${k} is not ${m[2]}`;
  },
  'powers.exponentLaws'(r) {
    const v = firstMath(r.statement).match(/([xyan])\^/)?.[1];
    // convert to JavaScript first (that removes "\dfrac"), then rename the variable to x
    const rename = (tex) => toJs(tex).replace(new RegExp(v, 'g'), 'x');
    const stmt = rename(firstMath(r.statement));
    const ans = rename(firstMath(r.answer));
    const x = 2; // powers of 2 are exact in floating point, so equal exponents give equal numbers
    return new Function('x', `return ${stmt};`)(x) === new Function('x', `return ${ans};`)(x) ? null : `wrong simplification: ${r.statement} -> ${r.answer}`;
  },
  'geometry.rectangle'(r) {
    const [l, w] = numbers(r.statement);
    const area = /area/.test(r.statement);
    const expected = area ? l * w : 2 * (l + w);
    if (l === w) return 'rectangle is a square';
    return answerNumber(r) === expected ? null : `wrong: ${r.statement} -> ${r.answer}`;
  },
  'geometry.triangle'(r) {
    const [b, h] = numbers(r.statement);
    return Number.isInteger((b * h) / 2) && answerNumber(r) === (b * h) / 2 ? null : `wrong: ${r.statement} -> ${r.answer}`;
  },
  'geometry.circle'(r) {
    const [radius] = numbers(r.statement);
    const expected = /area/.test(r.statement) ? radius * radius : 2 * radius;
    return answerNumber(r) === expected && /\\pi/.test(r.answer) ? null : `wrong: ${r.statement} -> ${r.answer}`;
  },
  'derivatives.polynomial'(r) {
    const f = toJs(mathParts(r.statement)[1].replace(/^f\(x\) = /, ''));
    const d = toJs(firstMath(r.answer).replace(/^f'\(x\) = /, ''));
    const F = new Function('x', `return ${f};`);
    const D = new Function('x', `return ${d};`);
    const h = 1e-4;
    for (const x of [-2, -1, 0.5, 1, 2, 3]) {
      const numeric = (F(x + h) - F(x - h)) / (2 * h);
      if (Math.abs(numeric - D(x)) > 1e-3 * (1 + Math.abs(numeric))) return `derivative wrong at x=${x}: f=${f} f'=${d}`;
    }
    return null;
  },
  'arithmetic.integers'(r, p) {
    const expr = firstMath(r.statement);
    const value = evalNum(toJs(expr));
    if (!Number.isInteger(value)) return `not an integer: ${expr}`;
    if (value !== Number(firstMath(r.answer))) return `wrong answer for ${expr}: ${r.answer}`;
    if (!p.allowNegative && (/-/.test(expr.replace(/ - /g, '')) || value < 0)) return `unexpected negative in ${expr}`;
    return null;
  },
  'fractions.addSubtract'(r) {
    const expr = firstMath(r.statement);
    const [[a, b], [c, d]] = fracs(expr);
    const sign = expr.includes('+') ? 1 : -1;
    const [n, dd] = asFrac(firstMath(r.answer));
    if (n * b * d !== (a * d + sign * c * b) * dd) return `wrong sum/difference for ${expr}: ${r.answer}`;
    if (n <= 0) return `result not positive for ${expr}`;
    if (!reduced([n, dd])) return `answer not in lowest terms: ${r.answer}`;
    return null;
  },
  'fractions.multiply'(r) {
    const expr = firstMath(r.statement);
    const [[a, b], [c, d]] = fracs(expr);
    const [n, dd] = asFrac(firstMath(r.answer));
    if (n * b * d !== a * c * dd) return `wrong product for ${expr}: ${r.answer}`;
    if (!reduced([n, dd])) return `answer not in lowest terms: ${r.answer}`;
    return null;
  },
  'fractions.simplify'(r) {
    const [[a, b]] = fracs(firstMath(r.statement));
    const [n, d] = asFrac(firstMath(r.answer));
    if (n * b !== d * a) return `not equal: ${r.statement} -> ${r.answer}`;
    if (!reduced([n, d]) || d < 2) return `not fully simplified: ${r.answer}`;
    if (gcd(a, b) === 1) return `nothing to simplify in ${r.statement}`;
    return null;
  },
  'linearEquations.oneStep'(r, p) { return checkLinear(r, p); },
  'linearEquations.twoStep'(r, p) { return checkLinear(r, p); },
  'quadratics.factoring'(r) {
    const poly = toJs(firstMath(r.statement));
    const factored = toJs(firstMath(r.answer));
    for (let x = -8; x <= 8; x++) {
      if (new Function('x', `return ${poly};`)(x) !== new Function('x', `return ${factored};`)(x)) return `factoring wrong at x=${x}: ${poly} vs ${factored}`;
    }
    return null;
  },
  'quadratics.solve'(r) {
    const poly = toJs(mathParts(r.statement)[1].replace(/= 0$/, ''));
    const roots = [...firstMath(r.answer).matchAll(/x = (-?\d+)/g)].map((m) => Number(m[1]));
    if (roots.length === 0) return `no roots in ${r.answer}`;
    for (const x of roots) if (new Function('x', `return ${poly};`)(x) !== 0) return `x=${x} is not a root of ${poly}`;
    return null;
  },
  'percentages.ofNumber'(r) {
    const [p, base] = mathParts(r.statement).map((m) => parseInt(m, 10));
    const value = (p * base) / 100;
    if (!Number.isInteger(value) || value !== Number(firstMath(r.answer))) return `wrong: ${r.statement} -> ${r.answer}`;
    return null;
  },
  'percentages.discount'(r) {
    const price = Number(r.statement.match(/\\\$(\d+)/)[1]);
    const p = parseInt(mathParts(r.statement)[0], 10);
    const sale = price * (100 - p) / 100;
    if (!Number.isInteger(sale) || r.answer !== `\\$${sale}`) return `wrong: ${r.statement} -> ${r.answer}`;
    return null;
  },
};

function checkLinear(r, p) {
  const eq = mathParts(r.statement)[1];
  const answer = firstMath(r.answer).match(/^x = (-?\d+)$/);
  if (!answer) return `bad answer format: ${r.answer}`;
  const x = Number(answer[1]);
  const [left, right] = eq.split('=').map((s) => toJs(s));
  const L = new Function('x', `return ${left};`)(x);
  const R = new Function('x', `return ${right};`)(x);
  if (Math.abs(L - R) > 1e-9) return `x=${x} does not satisfy ${eq}`;
  if (x === 0 || !Number.isInteger(x)) return `answer should be a nonzero integer: ${x}`;
  if (!p.allowNegative && x < 0) return `negative answer although negatives are off: ${eq}`;
  return null;
}

/** Text that should never appear in generated math. */
function ugly(text) {
  const bad = [
    [/(^|[^\d.])1x/, '"1x"'], [/\b0x/, '"0x"'], [/\+ -/, '"+ -"'], [/- -/, '"- -"'],
    [/NaN|undefined|Infinity/, 'NaN/undefined/Infinity'], [/\\dfrac\{[^}]*\}\{0\}/, 'division by zero'],
  ];
  return bad.find(([re]) => re.test(text))?.[1] ?? null;
}

/** Parameter sets worth testing: defaults plus every toggle, option and bound. */
function variants(gen) {
  const base = defaultParams(gen);
  const list = [base];
  for (const spec of gen.paramSchema) {
    if (spec.type === 'bool') list.push({ ...base, [spec.key]: !spec.default });
    if (spec.type === 'select') spec.options.forEach((o) => list.push({ ...base, [spec.key]: o.value }));
    if (spec.type === 'int') {
      if (spec.min !== undefined) list.push({ ...base, [spec.key]: spec.min });
      if (spec.max !== undefined && spec.max <= 30) list.push({ ...base, [spec.key]: spec.max });
    }
  }
  return list;
}

/**
 * Runs every generator over many seeds and parameter variants.
 * Returns { checked, failures: [{ generator, params, seed, problem }] }.
 */
export function checkGenerators(generators, { seeds = 300, katex = null } = {}) {
  const failures = [];
  let checked = 0;
  for (const gen of generators) {
    for (const rawParams of variants(gen)) {
      const params = normalizeParams(gen, rawParams);
      for (let seed = 1; seed <= seeds; seed++) {
        checked++;
        const fail = (problem) => failures.push({ generator: gen.id, params, seed, problem });
        let r;
        try { r = generate(gen.id, params, seed * 7919); } catch (e) { fail(`threw: ${e.message}`); continue; }

        for (const key of ['statement', 'answer', 'solution']) {
          if (typeof r[key] !== 'string' || !r[key].trim()) fail(`empty ${key}`);
          const u = ugly(r[key] ?? '');
          if (u) fail(`${key} contains ${u}: ${r[key]}`);
          if (katex) {
            for (const part of mathParts(r[key] ?? '')) {
              try { katex.renderToString(part, { throwOnError: true, strict: 'ignore' }); } catch (e) { fail(`KaTeX error in ${key}: ${e.message}`); }
            }
          }
        }
        const again = generate(gen.id, params, seed * 7919);
        if (again.statement !== r.statement || again.answer !== r.answer || again.solution !== r.solution) fail('same seed gave a different result');

        const specific = SPECIFIC[gen.id];
        if (!specific) fail('no specific check written for this generator');
        else {
          try { const msg = specific(r, params); if (msg) fail(msg); } catch (e) { fail(`check crashed: ${e.message} (${r.statement})`); }
        }
      }
    }
  }
  return { checked, failures };
}
