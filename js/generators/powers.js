import { paren, pow, math } from './helpers.js';

export default [
  {
    id: 'powers.evaluate',
    name: 'Evaluate a power',
    category: 'Powers and roots',
    paramSchema: [
      { key: 'maxBase', label: 'Largest base', type: 'int', default: 10, min: 2, max: 20 },
      { key: 'maxExponent', label: 'Largest exponent', type: 'int', default: 4, min: 2, max: 6 },
      { key: 'allowNegative', label: 'Allow negative bases', type: 'bool', default: false },
    ],
    generate(params, rng, p) {
      const base = rng.int(2, params.maxBase) * (params.allowNegative ? rng.sign() : 1);
      const exp = rng.int(2, params.maxExponent);
      const result = base ** exp;
      const expr = `${paren(base)}^${exp}`;
      const expanded = exp <= 4 ? `${Array(exp).fill(paren(base)).join(` ${p.times} `)} = ` : '';
      return {
        statement: p('calculate', { expr: math(expr) }),
        answer: math(String(result)),
        solution: `${math(`${expr} = ${expanded}${result}`)}.`,
      };
    },
  },
  {
    id: 'powers.roots',
    name: 'Square and cube roots',
    category: 'Powers and roots',
    paramSchema: [
      {
        key: 'rootType', label: 'Kind of root', type: 'select', default: 'square',
        options: [
          { value: 'square', label: 'Square roots' },
          { value: 'cube', label: 'Cube roots' },
          { value: 'mixed', label: 'Both' },
        ],
      },
      { key: 'maxRoot', label: 'Largest answer', type: 'int', default: 12, min: 2, max: 30 },
    ],
    generate(params, rng, p) {
      const cube = params.rootType === 'cube' || (params.rootType === 'mixed' && rng.chance());
      const root = rng.int(2, params.maxRoot);
      const n = root ** (cube ? 3 : 2);
      const expr = cube ? `\\sqrt[3]{${n}}` : `\\sqrt{${n}}`;
      return {
        statement: p('calculate', { expr: math(expr) }),
        answer: math(String(root)),
        solution: p('rootSolution', { pow: math(`${root}^${cube ? 3 : 2} = ${n}`), eq: math(`${expr} = ${root}`) }),
      };
    },
  },
  {
    id: 'powers.exponentLaws',
    name: 'Laws of exponents',
    category: 'Powers and roots',
    paramSchema: [
      {
        key: 'law', label: 'Rule', type: 'select', default: 'mixed',
        options: [
          { value: 'mixed', label: 'All rules' },
          { value: 'product', label: 'Multiplying powers' },
          { value: 'quotient', label: 'Dividing powers' },
          { value: 'power', label: 'Power of a power' },
        ],
      },
      { key: 'maxExponent', label: 'Largest exponent', type: 'int', default: 6, min: 3, max: 9 },
    ],
    generate(params, rng, p) {
      const v = rng.pick(['x', 'y', 'a', 'n']);
      const law = params.law === 'mixed' ? rng.pick(['product', 'quotient', 'power']) : params.law;
      const max = params.maxExponent;
      let expr; let result; let rule;
      if (law === 'product') {
        const a = rng.int(2, max); const b = rng.int(2, max);
        expr = `${pow(v, a)} \\cdot ${pow(v, b)}`;
        result = pow(v, a + b);
        rule = p('lawProduct', { eq: math(`${expr} = ${v}^{${a} + ${b}} = ${result}`) });
      } else if (law === 'quotient') {
        const a = rng.int(3, max); const b = rng.int(1, a - 1);
        expr = `\\dfrac{${pow(v, a)}}{${pow(v, b)}}`;
        result = pow(v, a - b);
        rule = p('lawQuotient', { eq: math(`${expr} = ${v}^{${a} - ${b}} = ${result}`) });
      } else {
        const a = rng.int(2, max); const b = rng.int(2, 4);
        expr = `(${pow(v, a)})^${b}`;
        result = pow(v, a * b);
        rule = p('lawPower', { eq: math(`${expr} = ${v}^{${a} ${p.times} ${b}} = ${result}`) });
      }
      return { statement: p('simplify', { expr: math(expr) }), answer: math(result), solution: rule };
    },
  },
];
