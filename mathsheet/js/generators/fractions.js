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
    generate(params, rng) {
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

      const intro = b === d
        ? 'The denominators are equal, so combine the numerators: '
        : `Rewrite both fractions with the common denominator ${math(String(L))}: `;
      return {
        statement: `Calculate ${math(expr)}. Give the answer in lowest terms.`,
        answer: math(fracOrInt(s, L)),
        solution: `${intro}${math(steps.join(' = '))}.`,
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
    generate(params, rng) {
      const [a, b] = proper(rng, params.maxDenominator);
      const [c, d] = proper(rng, params.maxDenominator);
      const expr = `${frac(a, b)} \\times ${frac(c, d)}`;
      const steps = [expr, `\\dfrac{${a} \\times ${c}}{${b} \\times ${d}}`, frac(a * c, b * d)];
      if (gcd(a * c, b * d) > 1) steps.push(fracOrInt(a * c, b * d));
      return {
        statement: `Calculate ${math(expr)}. Give the answer in lowest terms.`,
        answer: math(fracOrInt(a * c, b * d)),
        solution: `Multiply the numerators and the denominators: ${math(steps.join(' = '))}.`,
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
    generate(params, rng) {
      let p = 1;
      let q = rng.int(2, params.maxDenominator);
      for (let attempt = 0; attempt < 100; attempt++) {
        q = rng.int(2, params.maxDenominator);
        p = rng.int(1, q - 1);
        if (gcd(p, q) === 1) break;
        p = 1;
      }
      const k = rng.int(2, params.maxMultiplier);
      return {
        statement: `Simplify the fraction ${math(frac(p * k, q * k))} as far as possible.`,
        answer: math(frac(p, q)),
        solution: `The greatest common divisor of ${math(String(p * k))} and ${math(String(q * k))} is ${math(String(k))}. Divide both by ${math(String(k))}: ${math(`${frac(p * k, q * k)} = ${frac(p, q)}`)}.`,
      };
    },
  },
];
