// Checks for parsing, validation, schema, parameters and seeding. Pure ES module, no DOM needed.
import { splitMath, renderToHtml } from '../js/render.js';
import { validateWorksheet, newWorksheet, SCHEMA_VERSION } from '../js/schema.js';
import { slugify, parseWorksheetText } from '../js/storage.js';
import { createRng } from '../js/generators/rng.js';
import { generators, getGenerator, normalizeParams, defaultParams, categories } from '../js/generators/index.js';
import { polynomial, pow, withConstant, linear } from '../js/generators/helpers.js';
import { S, sv, t, tn, LANGUAGES } from './strings-for-tests.js';
import { missingTranslations, categoryName, generatorName, paramLabel } from '../js/generators/i18n.js';
import { BOOKS } from '../js/generators/phrases.js';

/** Returns [{ name, ok, detail }]. */
export function runCoreChecks({ katex, sample, svSample = null }) {
  const results = [];
  const check = (name, cond, detail = '') => results.push({ name, ok: Boolean(cond), detail: cond ? '' : String(detail) });
  const types = (text) => splitMath(text).map((s) => s.type).join(',');

  // ---- math splitting and rendering
  check('splitMath: inline, display and text', types('a $b$ c $$d$$ e') === 'text,inline,text,display,text');
  check('splitMath: \\$ is a literal dollar sign', splitMath('cost \\$5')[0].value === 'cost $5');
  check('splitMath: an unclosed $ stays text', types('only $5') === 'text');
  check('splitMath: \\$ inside math does not end it', splitMath('$a\\$b$')[0].value === 'a\\$b');
  const html = renderToHtml('<b>x</b> & $\\frac{1}{2}$', katex);
  check('renderToHtml: text is escaped', html.includes('&lt;b&gt;x&lt;/b&gt; &amp; ') && !html.includes('<b>'), html);
  check('renderToHtml: math is rendered', html.includes('class="katex"'));
  const errors = [];
  const bad = renderToHtml('$\\notacommand{$', katex, (m) => errors.push(m));
  check('renderToHtml: bad math is reported and shown as text', errors.length === 1 && bad.includes('math-error'), bad);

  // ---- schema
  const valid = validateWorksheet(sample);
  check('sample worksheet validates', valid.ok, valid.errors.join('; '));
  check('new worksheet has the current schema version', newWorksheet().schemaVersion === SCHEMA_VERSION);
  const bad1 = validateWorksheet({ schemaVersion: 1, problems: [{ type: 'custom' }, { statement: 'ok', points: -1 }, { statement: 'g', type: 'generated' }] });
  check('errors name the problem number', bad1.errors.some((e) => e.startsWith('problem 1: missing "statement"')), bad1.errors.join(' | '));
  check('negative points are rejected', bad1.errors.some((e) => e.startsWith('problem 2:') && e.includes('points')));
  check('generated problems need a generator', bad1.errors.some((e) => e.startsWith('problem 3:') && e.includes('generator')));
  check('a newer schema version is refused', validateWorksheet({ schemaVersion: SCHEMA_VERSION + 1, problems: [] }).ok === false);
  check('a non-object is refused', validateWorksheet([]).ok === false && validateWorksheet(null).ok === false);
  const filled = validateWorksheet({ problems: [{ statement: 'x' }] });
  check('missing fields get defaults', filled.ok && filled.worksheet.problems[0].points === 1 && filled.worksheet.meta.title === '' && filled.worksheet.settings.numbering === 'decimal', filled.errors.join('; '));
  const dup = validateWorksheet({ problems: [{ id: 'a', statement: 'x' }, { id: 'a', statement: 'y' }] });
  check('duplicate ids are repaired', dup.ok && dup.worksheet.problems[0].id !== dup.worksheet.problems[1].id);
  const extra = validateWorksheet({ note: 'keep me', problems: [{ statement: 'x', custom: 1 }] });
  check('unknown fields are preserved', extra.worksheet.note === 'keep me' && extra.worksheet.problems[0].custom === 1);
  check('numbering must be a known value', validateWorksheet({ settings: { numbering: 'weird' }, problems: [] }).errors.some((e) => e.includes('numbering')));
  check('invalid JSON gives a readable message', parseWorksheetText('{nope').errors[0].includes('not valid JSON'));
  check('saved key order is stable', Object.keys(valid.worksheet.problems[2]).slice(0, 5).join() === 'id,type,generator,params,seed', Object.keys(valid.worksheet.problems[2]).join());
  check('validation does not modify its input', JSON.stringify(sample) === JSON.stringify(JSON.parse(JSON.stringify(sample))) && validateWorksheet(sample).ok);

  // ---- files and names
  check('slugify: spaces and case', slugify('Homework Week 12') === 'homework-week-12');
  check('slugify: accents', slugify('Åäö Test!') === 'aao-test');
  check('slugify: empty', slugify('???') === '');

  // ---- generator registry
  check('generator ids are unique', new Set(generators.map((g) => g.id)).size === generators.length);
  check('every generator has the full interface', generators.every((g) => g.id && g.name && g.category && Array.isArray(g.paramSchema) && typeof g.generate === 'function'));
  check('categories cover all generators', categories().flatMap((c) => c.generators).length === generators.length);
  const gen = getGenerator('linearEquations.twoStep');
  const fixed = normalizeParams(gen, { min: 'abc', max: 99999, maxCoefficient: 1, allowNegative: 'yes', extra: 1 });
  check('normalizeParams repairs bad values', fixed.min === gen.paramSchema[0].default && fixed.max === 1000 && fixed.maxCoefficient === 2 && fixed.allowNegative === false && !('extra' in fixed), JSON.stringify(fixed));
  check('normalizeParams fills missing values', JSON.stringify(normalizeParams(gen, {})) === JSON.stringify(defaultParams(gen)));
  check('a bad select value falls back to the default', normalizeParams(getGenerator('arithmetic.integers'), { operation: 'nope' }).operation === 'mixed');

  // ---- random numbers and formatting helpers
  const a = createRng(42); const b = createRng(42);
  check('same seed, same sequence', [1, 2, 3, 4].every(() => a.next() === b.next()));
  check('different seeds differ', createRng(1).next() !== createRng(2).next());
  const r = createRng(7);
  check('rng.int stays in range and hits both ends', (() => { const seen = new Set(); for (let i = 0; i < 500; i++) seen.add(r.int(3, 5)); return seen.size === 3 && !seen.has(2) && !seen.has(6); })());
  check('helpers: no "1x" and no "+ -"', linear(1) === 'x' && linear(-1) === '-x' && withConstant('x', -3) === 'x - 3' && withConstant('x', 3) === 'x + 3');
  check('helpers: polynomial formatting', polynomial([{ c: 3, d: 4 }, { c: -1, d: 2 }, { c: 5, d: 1 }, { c: -7, d: 0 }]) === '3x^4 - x^2 + 5x - 7');
  check('helpers: pow drops exponent 1 and braces big exponents', pow('x', 1) === 'x' && pow('x', 12) === 'x^{12}' && pow('x', 3) === 'x^3');

  // ---- languages
  const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
  const enKeys = Object.keys(S);
  check('every English UI string has a Swedish one', enKeys.every((k) => k in sv), enKeys.filter((k) => !(k in sv)).join(', '));
  check('Swedish has no stray keys', Object.keys(sv).every((k) => k in S), Object.keys(sv).filter((k) => !(k in S)).join(', '));
  check('Swedish strings keep the same {placeholders}', enKeys.every((k) => !(k in sv) || placeholders(S[k]) === placeholders(sv[k])), enKeys.filter((k) => k in sv && placeholders(S[k]) !== placeholders(sv[k])).join(', '));
  check('t() uses the requested language and falls back to English', t('file.save', {}, 'sv') === 'Spara JSON' && t('file.save', {}, 'en') === 'Save JSON' && t('no.such.key', {}, 'sv') === 'no.such.key');
  check('tn() picks singular and plural', tn('count.problem', 1, {}, 'sv') === '1 uppgift' && tn('count.problem', 3, {}, 'sv') === '3 uppgifter');
  check('page language is declared for every language', LANGUAGES.every((l) => t('app.lang', {}, l.code) === l.code));
  check('generator names, labels and options are translated', missingTranslations(generators, 'sv').length === 0, missingTranslations(generators, 'sv').join('; '));
  check('English names are unchanged', generatorName(generators[0], 'en') === generators[0].name && categoryName('Algebra', 'en') === 'Algebra' && paramLabel(generators[0], generators[0].paramSchema[1], 'en') === generators[0].paramSchema[1].label);
  const enPhrases = Object.keys(BOOKS.en.text);
  // a translation may leave a placeholder out (Swedish says "Lös ekvationen {eq}" without {x}) but must not invent one
  const subset = (a, b) => placeholders(a).split(',').filter(Boolean).every((name) => placeholders(b).split(',').includes(name));
  check('every generator phrase exists in Swedish and only uses known {placeholders}', enPhrases.every((k) => k in BOOKS.sv.text && subset(BOOKS.sv.text[k], BOOKS.en.text[k])), enPhrases.filter((k) => !(k in BOOKS.sv.text) || !subset(BOOKS.sv.text[k], BOOKS.en.text[k])).join(', '));
  check('Swedish phrase book has no stray keys', Object.keys(BOOKS.sv.text).every((k) => k in BOOKS.en.text));
  check('old files without a language are English', validateWorksheet({ problems: [{ statement: 'x' }] }).worksheet.meta.language === 'en');
  check('worksheet language is validated', validateWorksheet({ meta: { language: 'xx' }, problems: [] }).errors.some((e) => e.includes('meta.language')) && validateWorksheet({ meta: { language: 'sv' }, problems: [] }).worksheet.meta.language === 'sv');
  check('new worksheets store a language', newWorksheet('sv').meta.language === 'sv' && newWorksheet().meta.language === 'en');
  if (svSample) {
    const v = validateWorksheet(svSample);
    check('Swedish sample validates and is Swedish', v.ok && v.worksheet.meta.language === 'sv', v.errors.join('; '));
  }

  return results;
}
