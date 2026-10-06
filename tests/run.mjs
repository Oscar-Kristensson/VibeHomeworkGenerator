// Run with:  node tests/run.mjs
import { createRequire } from 'node:module';
import { generators } from '../js/generators/index.js';
import { readFileSync } from 'node:fs';
import { checkGenerators } from './generator-checks.js';
import { checkExport } from './export-checks.js';
import { runCoreChecks } from './core-checks.js';
import { validateWorksheet } from '../js/schema.js';

const require = createRequire(import.meta.url);
const katex = require('../vendor/katex/katex.min.js');

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const { checked, failures } = checkGenerators(generators, { seeds: 300, katex });
console.log(`${generators.length} generators, ${checked} problems checked.`);
if (failures.length === 0) console.log('All checks passed.');
else {
  const byGen = Object.groupBy ? Object.groupBy(failures, (f) => f.generator) : {};
  for (const f of failures.slice(0, 15)) console.log(`FAIL ${f.generator} seed=${f.seed} ${JSON.stringify(f.params)}\n     ${f.problem}`);
  console.log(`${failures.length} failures in total.`);
  process.exit(1);
}

// ---- HTML export
const rawKatexCss = read('vendor/katex/katex.min.css').toString('utf8');
const fontData = {};
for (const [, file] of rawKatexCss.matchAll(/url\(fonts\/([^)]+\.woff2)\)/g)) fontData[file] = read(`vendor/katex/fonts/${file}`).toString('base64');
const sample = validateWorksheet(JSON.parse(read('examples/sample-worksheet.json'))).worksheet;
const exp = checkExport(sample, { katex, rawKatexCss, worksheetCss: read('css/worksheet.css').toString('utf8'), fontData });
console.log(`Export: ${exp.failures.length === 0 ? 'all checks passed' : exp.failures.length + ' failures'} (file size ${Math.round(exp.sizes.cdn / 1024)} KB with CDN fonts, ${Math.round(exp.sizes.embedded / 1024)} KB with embedded fonts).`);
if (exp.failures.length) { exp.failures.forEach((f) => console.log('FAIL export: ' + f)); process.exit(1); }

// ---- parsing, schema, parameters, helpers
const core = runCoreChecks({ katex, sample: JSON.parse(read('examples/sample-worksheet.json')) });
const coreFailed = core.filter((c) => !c.ok);
console.log(`Core: ${core.length - coreFailed.length} of ${core.length} checks passed.`);
if (coreFailed.length) { coreFailed.forEach((c) => console.log(`FAIL core: ${c.name} ${c.detail}`)); process.exit(1); }
