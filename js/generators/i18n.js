// Interface names for generators (categories, names, setting labels, option labels) in other languages.
// English text lives in the generator files themselves; anything missing here falls back to it.
import { getLanguage } from '../strings.js';

const TABLES = {
  sv: {
    categories: {
      Arithmetic: 'Aritmetik', Fractions: 'Bråk', Algebra: 'Algebra', Percentages: 'Procent',
      'Powers and roots': 'Potenser och rötter', Geometry: 'Geometri', Calculus: 'Analys',
    },
    // setting labels shared by several generators
    params: {
      min: 'Minsta tal', max: 'Största tal', allowNegative: 'Tillåt negativa tal', operation: 'Räknesätt',
      maxDenominator: 'Största nämnare', maxExponent: 'Största exponent', maxCoefficient: 'Största koefficient',
      unit: 'Enhet', quantity: 'Bestäm', maxSide: 'Längsta sida',
    },
    options: {
      operation: { mixed: 'Blandat', add: 'Addition', subtract: 'Subtraktion', multiply: 'Multiplikation', divide: 'Division' },
      unit: { cm: 'cm', m: 'm', in: 'tum', ft: 'fot' },
      quantity: { mixed: 'Area eller omkrets', area: 'Area', perimeter: 'Omkrets', circumference: 'Omkrets' },
    },
    generators: {
      'arithmetic.integers': {
        name: 'Heltalsräkning',
        options: { operation: { mixed: 'Blandat (+, −, ·)' } },
      },
      'fractions.addSubtract': {
        name: 'Addera och subtrahera bråk',
        params: { sameDenominator: 'Endast lika nämnare' },
      },
      'fractions.multiply': { name: 'Multiplicera bråk' },
      'fractions.simplify': {
        name: 'Förkorta ett bråk',
        params: { maxDenominator: 'Största nämnare i enklaste form', maxMultiplier: 'Största gemensamma faktor' },
      },
      'linearEquations.oneStep': { name: 'Enstegsekvationer' },
      'linearEquations.twoStep': {
        name: 'Tvåstegsekvationer',
        params: { allowNegative: 'Tillåt negativa svar och koefficienter' },
      },
      'quadratics.factoring': {
        name: 'Faktorisera ett andragradsuttryck',
        params: { maxRoot: 'Största rot', allowNegative: 'Tillåt negativa rötter' },
      },
      'quadratics.solve': {
        name: 'Lös andragradsekvationer med faktorisering',
        params: { maxRoot: 'Största rot', allowNegative: 'Tillåt negativa rötter' },
      },
      'percentages.ofNumber': { name: 'Procent av ett tal', params: { maxBase: 'Största tal' } },
      'percentages.discount': { name: 'Pris efter rabatt', params: { maxPrice: 'Högsta pris' } },
      'powers.evaluate': {
        name: 'Beräkna en potens',
        params: { maxBase: 'Största bas', allowNegative: 'Tillåt negativa baser' },
      },
      'powers.roots': {
        name: 'Kvadratrötter och kubikrötter',
        params: { rootType: 'Sorts rot', maxRoot: 'Största svar' },
        options: { rootType: { square: 'Kvadratrötter', cube: 'Kubikrötter', mixed: 'Båda' } },
      },
      'powers.exponentLaws': {
        name: 'Potenslagar',
        params: { law: 'Regel' },
        options: { law: { mixed: 'Alla regler', product: 'Multiplicera potenser', quotient: 'Dividera potenser', power: 'Potens av potens' } },
      },
      'geometry.rectangle': { name: 'Rektangel: area eller omkrets' },
      'geometry.triangle': { name: 'Triangel: area', params: { maxSide: 'Största bas eller höjd' } },
      'geometry.circle': { name: 'Cirkel: area eller omkrets', params: { maxRadius: 'Största radie' } },
      'derivatives.polynomial': {
        name: 'Derivata av ett polynom',
        params: { terms: 'Antal termer', maxDegree: 'Högsta potens', allowNegative: 'Tillåt negativa koefficienter' },
      },
    },
  },
};

export const TRANSLATED_LANGUAGES = Object.keys(TABLES);

export const categoryName = (name, lang = getLanguage()) => TABLES[lang]?.categories[name] ?? name;
export const generatorName = (gen, lang = getLanguage()) => TABLES[lang]?.generators[gen.id]?.name ?? gen.name;

export function paramLabel(gen, spec, lang = getLanguage()) {
  const t = TABLES[lang];
  return t?.generators[gen.id]?.params?.[spec.key] ?? t?.params[spec.key] ?? spec.label;
}

export function optionLabel(gen, spec, option, lang = getLanguage()) {
  const t = TABLES[lang];
  return t?.generators[gen.id]?.options?.[spec.key]?.[option.value] ?? t?.options[spec.key]?.[option.value] ?? option.label;
}

/** Lists names that have no translation yet (used by the tests). */
export function missingTranslations(generators, lang) {
  const missing = [];
  const t = TABLES[lang];
  if (!t) return ['no table for ' + lang];
  for (const gen of generators) {
    if (!t.categories[gen.category]) missing.push(`category ${gen.category}`);
    if (!t.generators[gen.id]?.name) missing.push(`name of ${gen.id}`);
    for (const spec of gen.paramSchema) {
      if (paramLabel(gen, spec, lang) === spec.label) missing.push(`label ${gen.id}.${spec.key}`);
      if (spec.type === 'select') {
        for (const o of spec.options) {
          // identical text (like "cm") is fine; only flag options that have no entry at all
          const entry = t.generators[gen.id]?.options?.[spec.key]?.[o.value] ?? t.options[spec.key]?.[o.value];
          if (entry === undefined) missing.push(`option ${gen.id}.${spec.key}.${o.value}`);
        }
      }
    }
  }
  return missing;
}
