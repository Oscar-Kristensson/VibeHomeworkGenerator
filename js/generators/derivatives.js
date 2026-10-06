import { polynomial, math } from './helpers.js';

export default [
  {
    id: 'derivatives.polynomial',
    name: 'Derivative of a polynomial',
    category: 'Calculus',
    paramSchema: [
      { key: 'terms', label: 'Number of terms', type: 'int', default: 3, min: 2, max: 5 },
      { key: 'maxDegree', label: 'Highest power', type: 'int', default: 4, min: 2, max: 8 },
      { key: 'maxCoefficient', label: 'Largest coefficient', type: 'int', default: 9, min: 1, max: 20 },
      { key: 'allowNegative', label: 'Allow negative coefficients', type: 'bool', default: true },
    ],
    generate(params, rng, p) {
      const lead = rng.int(2, params.maxDegree);
      // the other degrees are drawn from 0..lead-1 without repeats
      const pool = Array.from({ length: lead }, (_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) { const j = rng.int(0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const degrees = [lead, ...pool.slice(0, Math.min(params.terms - 1, lead))].sort((a, b) => b - a);
      const f = degrees.map((d) => ({ c: rng.int(1, params.maxCoefficient) * (params.allowNegative ? rng.sign() : 1), d }));
      const fPrime = f.filter((t) => t.d > 0).map(({ c, d }) => ({ c: c * d, d: d - 1 }));
      const result = polynomial(fPrime);
      return {
        statement: p('derivative', { fp: math("f'(x)"), f: math(`f(x) = ${polynomial(f)}`) }),
        answer: math(`f'(x) = ${result}`),
        solution: p('derivativeSolution', { rule: math('\\dfrac{d}{dx}x^n = nx^{n-1}'), zero: math('0'), eq: math(`f'(x) = ${result}`) }),
      };
    },
  },
];
