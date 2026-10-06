import { withConstant, math } from './helpers.js';

const paramSchema = [
  { key: 'maxRoot', label: 'Largest root', type: 'int', default: 6, min: 1, max: 20 },
  { key: 'allowNegative', label: 'Allow negative roots', type: 'bool', default: true },
];

function makeQuadratic(params, rng) {
  const pick = () => rng.int(1, params.maxRoot) * (params.allowNegative ? rng.sign() : 1);
  const [r1, r2] = [pick(), pick()].sort((a, b) => a - b);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const xTerm = b === 0 ? '' : b > 0 ? ` + ${b === 1 ? '' : b}x` : ` - ${b === -1 ? '' : -b}x`;
  const poly = withConstant(`x^2${xTerm}`, c);
  const factor = (r) => (r > 0 ? `(x - ${r})` : `(x + ${-r})`);
  const factored = r1 === r2 ? `${factor(r1)}^2` : `${factor(r1)}${factor(r2)}`;
  return { r1, r2, b, c, poly, factored };
}

export default [
  {
    id: 'quadratics.factoring',
    name: 'Factor a quadratic',
    category: 'Algebra',
    paramSchema,
    generate(params, rng, p) {
      const { r1, r2, b, c, poly, factored } = makeQuadratic(params, rng);
      return {
        statement: p('factor', { poly: math(poly) }),
        answer: math(factored),
        solution: p('factorSolution', {
          c: math(String(c)), b: math(String(b)), m: math(String(-r1)), n: math(String(-r2)),
          eq: math(`${poly} = ${factored}`),
        }),
      };
    },
  },
  {
    id: 'quadratics.solve',
    name: 'Solve a quadratic by factoring',
    category: 'Algebra',
    paramSchema,
    generate(params, rng, p) {
      const { r1, r2, poly, factored } = makeQuadratic(params, rng);
      const answer = r1 === r2 ? `x = ${r1}` : `x = ${r1} \\text{ ${p.or} } x = ${r2}`;
      return {
        statement: p('solveFor', { x: math('x'), eq: math(`${poly} = 0`) }),
        answer: math(answer),
        solution: p('quadSolution', { eq: math(`${factored} = 0`), ans: math(answer) }),
      };
    },
  },
];
