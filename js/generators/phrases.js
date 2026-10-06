// Wording and notation for generated problems, one "phrase book" per language.
// Generators call p('key', { vars }) and use p.times, p.div and friends for notation, so adding
// a language means adding one entry to BOOKS (and the interface names in names.sv.js style).
const fmt = (template, vars = {}) => template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));

export const BOOKS = {
  en: {
    times: '\\times', div: '\\div', or: 'or', of: 'of',
    pct: (n) => `${n}\\%`,
    money: (n) => `\\$${n}`,
    units: { cm: 'cm', m: 'm', in: 'in', ft: 'ft' },
    text: {
      calculate: 'Calculate {expr}.',
      check: 'Check: {eq}.',
      calcLowest: 'Calculate {expr}. Give the answer in lowest terms.',
      fracSame: 'The denominators are equal, so combine the numerators: {steps}.',
      fracCommon: 'Rewrite both fractions with the common denominator {d}: {steps}.',
      fracMultiply: 'Multiply the numerators and the denominators: {steps}.',
      fracSimplify: 'Simplify the fraction {frac} as far as possible.',
      fracSimplifySolution: 'The greatest common divisor of {a} and {b} is {k}. Divide both by {k}: {eq}.',
      solveFor: 'Solve for {x}: {eq}',
      stepSubtract: 'Subtract {n} from both sides: {eq}.',
      stepAdd: 'Add {n} to both sides: {eq}.',
      stepDivide: 'Divide both sides by {n}: {eq}.',
      stepMultiply: 'Multiply both sides by {n}: {eq}.',
      factor: 'Factor {poly}.',
      factorSolution: 'Look for two numbers with product {c} and sum {b}. They are {m} and {n}, so {eq}.',
      quadSolution: 'Factor the left side: {eq}. A product is zero when one of its factors is zero, so {ans}.',
      pctOf: 'What is {pct} of {base}?',
      discount: 'An item costs {price}. It is on sale for {pct} off. What is the sale price?',
      discountSolution: 'The discount is {disc}, so the sale price is {sale}.',
      simplify: 'Simplify {expr}.',
      rootSolution: 'Since {pow}, we get {eq}.',
      lawProduct: 'When multiplying powers with the same base, add the exponents: {eq}.',
      lawQuotient: 'When dividing powers with the same base, subtract the exponents: {eq}.',
      lawPower: 'For a power of a power, multiply the exponents: {eq}.',
      rectArea: 'A rectangle has length {l} and width {w}. Find its area.',
      rectPerimeter: 'A rectangle has length {l} and width {w}. Find its perimeter.',
      rectAreaSolution: 'Area = length × width: {eq}.',
      rectPerimeterSolution: 'Perimeter = 2 × (length + width): {eq}.',
      triangle: 'A triangle has base {b} and height {h}. Find its area.',
      triangleSolution: 'Area = ½ × base × height: {eq}.',
      circleArea: 'A circle has radius {r}. Find its area. Give the answer in terms of {pi}.',
      circleCircumference: 'A circle has radius {r}. Find its circumference. Give the answer in terms of {pi}.',
      derivative: 'Find {fp} for {f}.',
      derivativeSolution: 'Use the power rule {rule} on each term. A constant has derivative {zero}. So {eq}.',
    },
  },
  sv: {
    times: '\\cdot', div: '÷', or: 'eller', of: 'av',
    pct: (n) => `${n}\\,\\%`,
    money: (n) => `${n} kr`,
    units: { cm: 'cm', m: 'm', in: 'tum', ft: 'fot' },
    text: {
      calculate: 'Beräkna {expr}.',
      check: 'Kontroll: {eq}.',
      calcLowest: 'Beräkna {expr}. Svara i enklaste form.',
      fracSame: 'Nämnarna är lika, så vi räknar med täljarna: {steps}.',
      fracCommon: 'Skriv om båda bråken med den gemensamma nämnaren {d}: {steps}.',
      fracMultiply: 'Multiplicera täljarna med varandra och nämnarna med varandra: {steps}.',
      fracSimplify: 'Förkorta bråket {frac} så långt som möjligt.',
      fracSimplifySolution: 'Den största gemensamma delaren till {a} och {b} är {k}. Dividera både täljare och nämnare med {k}: {eq}.',
      solveFor: 'Lös ekvationen {eq}.',
      stepSubtract: 'Subtrahera {n} från båda led: {eq}.',
      stepAdd: 'Addera {n} till båda led: {eq}.',
      stepDivide: 'Dividera båda led med {n}: {eq}.',
      stepMultiply: 'Multiplicera båda led med {n}: {eq}.',
      factor: 'Faktorisera {poly}.',
      factorSolution: 'Leta efter två tal med produkten {c} och summan {b}. Talen är {m} och {n}, så {eq}.',
      quadSolution: 'Faktorisera vänsterledet: {eq}. En produkt är noll när någon faktor är noll, så {ans}.',
      pctOf: 'Hur mycket är {pct} av {base}?',
      discount: 'En vara kostar {price}. Den säljs med {pct} rabatt. Vad blir det nya priset?',
      discountSolution: 'Rabatten är {disc}, så det nya priset blir {sale}.',
      simplify: 'Förenkla {expr}.',
      rootSolution: 'Eftersom {pow} är {eq}.',
      lawProduct: 'När potenser med samma bas multipliceras adderas exponenterna: {eq}.',
      lawQuotient: 'När potenser med samma bas divideras subtraheras exponenterna: {eq}.',
      lawPower: 'När en potens upphöjs till ett tal multipliceras exponenterna: {eq}.',
      rectArea: 'En rektangel har längden {l} och bredden {w}. Bestäm dess area.',
      rectPerimeter: 'En rektangel har längden {l} och bredden {w}. Bestäm dess omkrets.',
      rectAreaSolution: 'Area = längd · bredd: {eq}.',
      rectPerimeterSolution: 'Omkrets = 2 · (längd + bredd): {eq}.',
      triangle: 'En triangel har basen {b} och höjden {h}. Bestäm dess area.',
      triangleSolution: 'Area = bas · höjd / 2: {eq}.',
      circleArea: 'En cirkel har radien {r}. Bestäm dess area. Svara exakt, uttryckt i {pi}.',
      circleCircumference: 'En cirkel har radien {r}. Bestäm dess omkrets. Svara exakt, uttryckt i {pi}.',
      derivative: 'Bestäm {fp} om {f}.',
      derivativeSolution: 'Använd potensregeln {rule} på varje term. En konstant har derivatan {zero}. Alltså är {eq}.',
    },
  },
};

export const PHRASE_LANGUAGES = Object.keys(BOOKS);

/** Returns p(key, vars) with notation helpers attached: p.times, p.div, p.or, p.of, p.pct(n), p.money(n), p.unit(u). */
export function phraseBook(lang = 'en') {
  const book = BOOKS[lang] ?? BOOKS.en;
  const p = (key, vars) => fmt(book.text[key] ?? BOOKS.en.text[key], vars);
  p.times = book.times;
  p.div = book.div;
  p.or = book.or;
  p.of = book.of;
  p.pct = book.pct;
  p.money = book.money;
  p.unit = (u) => book.units[u] ?? u;
  return p;
}
