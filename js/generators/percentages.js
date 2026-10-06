import { gcd, math } from './helpers.js';

/** Smallest base that makes "p% of base" a whole number. */
const baseStep = (pct) => 100 / gcd(pct, 100);

export default [
  {
    id: 'percentages.ofNumber',
    name: 'Percent of a number',
    category: 'Percentages',
    paramSchema: [
      { key: 'maxBase', label: 'Largest number', type: 'int', default: 200, min: 20, max: 10000 },
    ],
    generate(params, rng, p) {
      const pct = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      const step = baseStep(pct);
      const base = step * rng.int(1, Math.max(1, Math.floor(params.maxBase / step)));
      const result = (pct * base) / 100;
      return {
        statement: p('pctOf', { pct: math(p.pct(pct)), base: math(String(base)) }),
        answer: math(String(result)),
        solution: math(`${p.pct(pct)} \\text{ ${p.of} } ${base} = \\dfrac{${pct}}{100} ${p.times} ${base} = ${result}`) + '.',
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
    generate(params, rng, p) {
      const pct = rng.pick([10, 15, 20, 25, 30, 40, 50]);
      const step = baseStep(pct);
      const price = step * rng.int(1, Math.max(1, Math.floor(params.maxPrice / step)));
      const discount = (pct * price) / 100;
      const sale = price - discount;
      return {
        statement: p('discount', { price: p.money(price), pct: math(p.pct(pct)) }),
        answer: p.money(sale),
        solution: p('discountSolution', {
          disc: math(`${p.pct(pct)} ${p.times} ${price} = ${discount}`),
          sale: math(`${price} - ${discount} = ${sale}`),
        }),
      };
    },
  },
];
