import { bounds, paren, linear, withConstant, math } from './helpers.js';

const solveFor = (eq) => `Solve for ${math('x')}: ${math(eq)}`;

export default [
  {
    id: 'linearEquations.oneStep',
    name: 'One-step equations',
    category: 'Algebra',
    paramSchema: [
      { key: 'min', label: 'Smallest number', type: 'int', default: 1, min: 1, max: 1000 },
      { key: 'max', label: 'Largest number', type: 'int', default: 12, min: 1, max: 1000 },
      { key: 'allowNegative', label: 'Allow negative numbers', type: 'bool', default: false },
    ],
    generate(params, rng) {
      const { lo, hi } = bounds(params);
      const neg = params.allowNegative;
      const pick = () => rng.int(lo, hi) * (neg ? rng.sign() : 1);
      const type = rng.pick(['add', 'subtract', 'multiply', 'divide']);

      for (let attempt = 0; ; attempt++) {
        let eq; let x; let step;
        if (type === 'add') {
          const b = pick();
          x = pick();
          const c = x + b;
          eq = `${withConstant('x', b)} = ${c}`;
          step = b > 0
            ? `Subtract ${math(String(b))} from both sides: ${math(`x = ${c} - ${b} = ${x}`)}.`
            : `Add ${math(String(-b))} to both sides: ${math(`x = ${c} + ${-b} = ${x}`)}.`;
          if (c === 0 && attempt < 100) continue;
        } else if (type === 'subtract') {
          const b = rng.int(lo, hi);
          const c = pick();
          x = c + b;
          eq = `x - ${b} = ${c}`;
          step = `Add ${math(String(b))} to both sides: ${math(`x = ${c} + ${b} = ${x}`)}.`;
          if (x === 0 && attempt < 100) continue;
        } else if (type === 'multiply') {
          const al = Math.max(2, lo);
          const a = rng.int(al, Math.max(al, hi)) * (neg ? rng.sign() : 1);
          x = pick();
          eq = `${linear(a)} = ${a * x}`;
          step = `Divide both sides by ${math(String(a))}: ${math(`x = ${a * x} \\div ${paren(a)} = ${x}`)}.`;
        } else {
          const al = Math.max(2, lo);
          const a = rng.int(al, Math.max(al, hi));
          const c = pick();
          x = a * c;
          eq = `\\dfrac{x}{${a}} = ${c}`;
          step = `Multiply both sides by ${math(String(a))}: ${math(`x = ${c} \\times ${a} = ${x}`)}.`;
        }
        return { statement: `${solveFor(eq)}`, answer: math(`x = ${x}`), solution: step };
      }
    },
  },
  {
    id: 'linearEquations.twoStep',
    name: 'Two-step equations',
    category: 'Algebra',
    paramSchema: [
      { key: 'min', label: 'Smallest number', type: 'int', default: 1, min: 1, max: 1000 },
      { key: 'max', label: 'Largest number', type: 'int', default: 10, min: 1, max: 1000 },
      { key: 'maxCoefficient', label: 'Largest coefficient', type: 'int', default: 9, min: 2, max: 20 },
      { key: 'allowNegative', label: 'Allow negative answers and coefficients', type: 'bool', default: false },
    ],
    generate(params, rng) {
      const { lo, hi } = bounds(params);
      const neg = params.allowNegative;
      for (let attempt = 0; ; attempt++) {
        const a = rng.int(2, params.maxCoefficient) * (neg ? rng.sign() : 1);
        const x = rng.int(lo, hi) * (neg ? rng.sign() : 1);
        const b = rng.int(lo, hi) * rng.sign();
        const c = a * x + b;
        if ((c === 0 || (!neg && c < 0)) && attempt < 200) continue;

        const first = b > 0
          ? `Subtract ${math(String(b))} from both sides: ${math(`${linear(a)} = ${c} - ${b} = ${c - b}`)}.`
          : `Add ${math(String(-b))} to both sides: ${math(`${linear(a)} = ${c} + ${-b} = ${c - b}`)}.`;
        const second = `Divide both sides by ${math(String(a))}: ${math(`x = ${c - b} \\div ${paren(a)} = ${x}`)}.`;
        return {
          statement: solveFor(`${withConstant(linear(a), b)} = ${c}`),
          answer: math(`x = ${x}`),
          solution: `${first} ${second}`,
        };
      }
    },
  },
];
