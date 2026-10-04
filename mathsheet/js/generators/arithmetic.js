import { bounds, paren, math } from './helpers.js';

export default [
  {
    id: 'arithmetic.integers',
    name: 'Integer arithmetic',
    category: 'Arithmetic',
    paramSchema: [
      {
        key: 'operation', label: 'Operation', type: 'select', default: 'mixed',
        options: [
          { value: 'mixed', label: 'Mixed (+, −, ×)' },
          { value: 'add', label: 'Addition' },
          { value: 'subtract', label: 'Subtraction' },
          { value: 'multiply', label: 'Multiplication' },
          { value: 'divide', label: 'Division' },
        ],
      },
      { key: 'min', label: 'Smallest number', type: 'int', default: 2, min: 1, max: 1000 },
      { key: 'max', label: 'Largest number', type: 'int', default: 20, min: 1, max: 1000 },
      { key: 'allowNegative', label: 'Allow negative numbers', type: 'bool', default: false },
    ],
    generate(params, rng) {
      const { lo, hi } = bounds(params);
      const sgn = () => (params.allowNegative ? rng.sign() : 1);
      const op = params.operation === 'mixed' ? rng.pick(['add', 'subtract', 'multiply']) : params.operation;

      let expr; let result; let note = '';
      if (op === 'divide') {
        const dl = Math.max(2, lo);
        const b = rng.int(dl, Math.max(dl, hi)) * sgn();
        const q = rng.int(lo, hi) * sgn();
        const a = b * q;
        expr = `${a} \\div ${paren(b)}`;
        result = q;
        note = ` Check: ${math(`${paren(q)} \\times ${paren(b)} = ${a}`)}.`;
      } else {
        let a = rng.int(lo, hi) * sgn();
        let b = rng.int(lo, hi) * sgn();
        if (op === 'subtract' && !params.allowNegative && a < b) [a, b] = [b, a];
        const symbol = { add: '+', subtract: '-', multiply: '\\times' }[op];
        expr = `${a} ${symbol} ${paren(b)}`;
        result = op === 'add' ? a + b : op === 'subtract' ? a - b : a * b;
      }
      return {
        statement: `Calculate ${math(expr)}.`,
        answer: math(String(result)),
        solution: `${math(`${expr} = ${result}`)}.${note}`,
      };
    },
  },
];
