import { math } from './helpers.js';

const unitParam = {
  key: 'unit', label: 'Unit', type: 'select', default: 'cm',
  options: [{ value: 'cm', label: 'cm' }, { value: 'm', label: 'm' }, { value: 'in', label: 'in' }, { value: 'ft', label: 'ft' }],
};

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
    generate(params, rng, p) {
      const w = rng.int(2, params.maxSide - 1);
      let l = rng.int(2, params.maxSide);
      if (l === w) l = w + 1; // a rectangle, not a square
      const quantity = params.quantity === 'mixed' ? rng.pick(['area', 'perimeter']) : params.quantity;
      const u = p.unit(params.unit);
      const sides = { l: math(`${l}\\text{ ${u}}`), w: math(`${w}\\text{ ${u}}`) };
      return quantity === 'area'
        ? {
          statement: p('rectArea', sides),
          answer: math(`${l * w}\\text{ ${u}}^2`),
          solution: p('rectAreaSolution', { eq: math(`${l} ${p.times} ${w} = ${l * w}\\text{ ${u}}^2`) }),
        }
        : {
          statement: p('rectPerimeter', sides),
          answer: math(`${2 * (l + w)}\\text{ ${u}}`),
          solution: p('rectPerimeterSolution', { eq: math(`2 ${p.times} (${l} + ${w}) = ${2 * (l + w)}\\text{ ${u}}`) }),
        };
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
    generate(params, rng, p) {
      const b = rng.int(2, params.maxSide);
      let h = rng.int(2, params.maxSide);
      if ((b * h) % 2 !== 0) h = h < params.maxSide ? h + 1 : h - 1; // keeps the area a whole number
      const u = p.unit(params.unit);
      const area = (b * h) / 2;
      return {
        statement: p('triangle', { b: math(`${b}\\text{ ${u}}`), h: math(`${h}\\text{ ${u}}`) }),
        answer: math(`${area}\\text{ ${u}}^2`),
        solution: p('triangleSolution', { eq: math(`\\dfrac{1}{2} ${p.times} ${b} ${p.times} ${h} = ${area}\\text{ ${u}}^2`) }),
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
    generate(params, rng, p) {
      const r = rng.int(1, params.maxRadius);
      const quantity = params.quantity === 'mixed' ? rng.pick(['area', 'circumference']) : params.quantity;
      const u = p.unit(params.unit);
      const vars = { r: math(`${r}\\text{ ${u}}`), pi: math('\\pi') };
      return quantity === 'area'
        ? {
          statement: p('circleArea', vars),
          answer: math(`${r * r}\\pi\\text{ ${u}}^2`),
          solution: `${math(`A = \\pi r^2 = \\pi ${p.times} ${r}^2 = ${r * r}\\pi\\text{ ${u}}^2`)}.`,
        }
        : {
          statement: p('circleCircumference', vars),
          answer: math(`${2 * r}\\pi\\text{ ${u}}`),
          solution: `${math(`C = 2\\pi r = 2\\pi ${p.times} ${r} = ${2 * r}\\pi\\text{ ${u}}`)}.`,
        };
    },
  },
];
