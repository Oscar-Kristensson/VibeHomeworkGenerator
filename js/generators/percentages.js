import { gcd, math } from './helpers.js';

/** Smallest base that makes "p% of base" a whole number. */
const baseStep = (p) => 100 / gcd(p, 100);

export default [
  {
    id: 'percentages.ofNumber',
    name: 'Percent of a number',
    category: 'Percentages',
    paramSchema: [
      { key: 'maxBase', label: 'Largest number', type: 'int', default: 200, min: 20, max: 10000 },
    ],
    generate(params, rng) {
      const p = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      const step = baseStep(p);
      const base = step * rng.int(1, Math.max(1, Math.floor(params.maxBase / step)));
      const result = (p * base) / 100;
      return {
        statement: `What is ${math(`${p}\\%`)} of ${math(String(base))}?`,
        answer: math(String(result)),
        solution: math(`${p}\\% \\text{ of } ${base} = \\dfrac{${p}}{100} \\times ${base} = ${result}`) + '.',
      };
    },
  },
  {
    id: 'percentages.discount',
    name: 'Sale price after a discount',
    category: 'Percentages',
    paramSchema: [
      { key: 'maxPrice', label: 'Highest price', type: 'int', default: 200, min: 20, max: 10000 },
    ],
    generate(params, rng) {
      const p = rng.pick([10, 15, 20, 25, 30, 40, 50]);
      const step = baseStep(p);
      const price = step * rng.int(1, Math.max(1, Math.floor(params.maxPrice / step)));
      const discount = (p * price) / 100;
      const sale = price - discount;
      return {
        statement: `An item costs \\$${price}. It is on sale for ${math(`${p}\\%`)} off. What is the sale price?`,
        answer: `\\$${sale}`,
        solution: `The discount is ${math(`${p}\\% \\times ${price} = ${discount}`)}, so the sale price is ${math(`${price} - ${discount} = ${sale}`)}.`,
      };
    },
  },
];
