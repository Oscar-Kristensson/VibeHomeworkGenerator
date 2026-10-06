import { math } from './helpers.js';

const unitParam = {
  key: 'unit', label: 'Unit', type: 'select', default: 'cm',
  options: [{ value: 'cm', label: 'cm' }, { value: 'm', label: 'm' }, { value: 'in', label: 'in' }, { value: 'ft', label: 'ft' }],
};
const length = (n, unit) => math(`${n}\\text{ ${unit}}`);
const lengthTex = (n, unit) => `${n}\\text{ ${unit}}`;
const areaTex = (n, unit) => `${n}\\text{ ${unit}}^2`;

export default [
  {
    id: 'geometry.rectangle',
    name: 'Rectangle: area or perimeter',
    category: 'Geometry',
    paramSchema: [
      {
        key: 'quantity', label: 'Find the', type: 'select', default: 'mixed',
        options: [{ value: 'mixed', label: 'Area or perimeter' }, { value: 'area', label: 'Area' }, { value: 'perimeter', label: 'Perimeter' }],
      },
      { key: 'maxSide', label: 'Longest side', type: 'int', default: 12, min: 3, max: 100 },
      unitParam,
    ],
    generate(params, rng) {
      const w = rng.int(2, params.maxSide - 1);
      let l = rng.int(2, params.maxSide);
      if (l === w) l = w + 1; // a rectangle, not a square
      const quantity = params.quantity === 'mixed' ? rng.pick(['area', 'perimeter']) : params.quantity;
      const u = params.unit;
      const statement = `A rectangle has length ${length(l, u)} and width ${length(w, u)}. Find its ${quantity}.`;
      return quantity === 'area'
        ? { statement, answer: math(areaTex(l * w, u)), solution: `Area = length × width: ${math(`${l} \\times ${w} = ${areaTex(l * w, u)}`)}.` }
        : { statement, answer: math(lengthTex(2 * (l + w), u)), solution: `Perimeter = 2 × (length + width): ${math(`2 \\times (${l} + ${w}) = ${lengthTex(2 * (l + w), u)}`)}.` };
    },
  },
  {
    id: 'geometry.triangle',
    name: 'Triangle: area',
    category: 'Geometry',
    paramSchema: [
      { key: 'maxSide', label: 'Largest base or height', type: 'int', default: 12, min: 3, max: 100 },
      unitParam,
    ],
    generate(params, rng) {
      const b = rng.int(2, params.maxSide);
      let h = rng.int(2, params.maxSide);
      if ((b * h) % 2 !== 0) h = h < params.maxSide ? h + 1 : h - 1; // keeps the area a whole number
      const u = params.unit;
      const area = (b * h) / 2;
      return {
        statement: `A triangle has base ${length(b, u)} and height ${length(h, u)}. Find its area.`,
        answer: math(areaTex(area, u)),
        solution: `Area = ½ × base × height: ${math(`\\dfrac{1}{2} \\times ${b} \\times ${h} = ${areaTex(area, u)}`)}.`,
      };
    },
  },
  {
    id: 'geometry.circle',
    name: 'Circle: area or circumference',
    category: 'Geometry',
    paramSchema: [
      {
        key: 'quantity', label: 'Find the', type: 'select', default: 'mixed',
        options: [{ value: 'mixed', label: 'Area or circumference' }, { value: 'area', label: 'Area' }, { value: 'circumference', label: 'Circumference' }],
      },
      { key: 'maxRadius', label: 'Largest radius', type: 'int', default: 10, min: 2, max: 100 },
      unitParam,
    ],
    generate(params, rng) {
      const r = rng.int(1, params.maxRadius);
      const quantity = params.quantity === 'mixed' ? rng.pick(['area', 'circumference']) : params.quantity;
      const u = params.unit;
      const statement = `A circle has radius ${length(r, u)}. Find its ${quantity}. Give the answer in terms of ${math('\\pi')}.`;
      return quantity === 'area'
        ? { statement, answer: math(`${r * r}\\pi\\text{ ${u}}^2`), solution: `${math(`A = \\pi r^2 = \\pi \\times ${r}^2 = ${r * r}\\pi\\text{ ${u}}^2`)}.` }
        : { statement, answer: math(`${2 * r}\\pi\\text{ ${u}}`), solution: `${math(`C = 2\\pi r = 2\\pi \\times ${r} = ${2 * r}\\pi\\text{ ${u}}`)}.` };
    },
  },
];
