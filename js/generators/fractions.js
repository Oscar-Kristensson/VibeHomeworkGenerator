import { gcd, lcm, frac, fracOrInt, math } from './helpers.js';

const proper = (rng, maxD) => {
  const d = rng.int(2, Math.max(2, maxD));
  return [rng.int(1, d - 1), d];
};

export default [
  {
    id: 'fractions.addSubtract',
    name: 'Add and subtract fractions',
    category: 'Fractions',
    paramSchema: [
      {
        key: 'operation', label: 'Operation', type: 'select', default: 'add',
        options: [
          { value: 'add', label: 'Addition' },
          { value: 'subtract', label: 'Subtraction' },
          { value: 'mixed', label: 'Mixed' },
        ],
      },
      { key: 'maxDenominator', label: 'Largest denominator', type: 'int', default: 10, min: 2, max: 30 },
      { key: 'sameDenominator', label: 'Same denominators only', type: 'bool', default: false },
    ],
    generate(params, rng, p) {
      const op = params.operation === 'mixed' ? rng.pick(['add', 'subtract']) : params.operation;
      const sym = op === 'add' ? '+' : '-';
      let a, b, c, d;
      for (let attempt = 0; attempt < 200; attempt++) {
        [a, b] = proper(rng, params.maxDenominator);
        if (params.sameDenominator) { d = b; c = rng.int(1, b - 1); } else { [c, d] = proper(rng, params.maxDenominator); }
        const strict = attempt < 100; // after many tries (tiny ranges) accept less ideal cases
        if (!params.sameDenominator && strict && d === b) continue;
        if (op === 'subtract') {
          if (strict && a * d === c * b) continue;
          if (a * d < c * b) [a, b, c, d] = [c, d, a, b]; // keep the result positive
        }
        break;
      }
      const L = lcm(b, d);
      const na = a * (L / b);
      const nc = c * (L / d);
      const s = op === 'add' ? na + nc : na - nc;

      const expr = `${frac(a, b)} ${sym} ${frac(c, d)}`;
      const steps = b === d
        ? [expr, `\\dfrac{${a} ${sym} ${c}}{${b}}`, frac(s, L)]
        : [expr, `${frac(na, L)} ${sym} ${frac(nc, L)}`, frac(s, L)];
      const reducible = gcd(s, L) > 1;
      if (reducible) steps.push(fracOrInt(s, L));

      return {
        statement: p('calcLowest', { expr: math(expr) }),
        answer: math(fracOrInt(s, L)),
        solution: b === d
          ? p('fracSame', { steps: math(steps.join(' = ')) })
          : p('fracCommon', { d: math(String(L)), steps: math(steps.join(' = ')) }),
      };
    },
  },
  {
    id: 'fractions.multiply',
    name: 'Multiply fractions',
    category: 'Fractions',
    paramSchema: [
      { key: 'maxDenominator', label: 'Largest denominator', type: 'int', default: 9, min: 2, max: 30 },
    ],
    generate(params, rng, p) {
      const [a, b] = proper(rng, params.maxDenominator);
      const [c, d] = proper(rng, params.maxDenominator);
      const expr = `${frac(a, b)} ${p.times} ${frac(c, d)}`;
      const steps = [expr, `\\dfrac{${a} ${p.times} ${c}}{${b} ${p.times} ${d}}`, frac(a * c, b * d)];
      if (gcd(a * c, b * d) > 1) steps.push(fracOrInt(a * c, b * d));
      return {
        statement: p('calcLowest', { expr: math(expr) }),
        answer: math(fracOrInt(a * c, b * d)),
        solution: p('fracMultiply', { steps: math(steps.join(' = ')) }),
      };
    },
  },
  {
    id: 'fractions.simplify',
    name: 'Simplify a fraction',
    category: 'Fractions',
    paramSchema: [
      { key: 'maxDenominator', label: 'Largest reduced denominator', type: 'int', default: 12, min: 2, max: 30 },
      { key: 'maxMultiplier', label: 'Largest common factor', type: 'int', default: 9, min: 2, max: 20 },
    ],
    generate(params, rng, p) {
      let num = 1;
      let den = rng.int(2, params.maxDenominator);
      for (let attempt = 0; attempt < 100; attempt++) {
        den = rng.int(2, params.maxDenominator);
        num = rng.int(1, den - 1);
        if (gcd(num, den) === 1) break;
        num = 1;
      }
      const k = rng.int(2, params.maxMultiplier);
      return {
        statement: p('fracSimplify', { frac: math(frac(num * k, den * k)) }),
        answer: math(frac(num, den)),
        solution: p('fracSimplifySolution', { a: math(String(num * k)), b: math(String(den * k)), k: math(String(k)), eq: math(`${frac(num * k, den * k)} = ${frac(num, den)}`) }),
      };
    },
  },
];
