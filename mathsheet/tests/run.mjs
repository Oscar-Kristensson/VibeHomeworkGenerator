// Run with:  node tests/run.mjs
import { createRequire } from 'node:module';
import { generators } from '../js/generators/index.js';
import { checkGenerators } from './generator-checks.js';

const require = createRequire(import.meta.url);
const katex = require('../vendor/katex/katex.min.js');

const { checked, failures } = checkGenerators(generators, { seeds: 300, katex });
console.log(`${generators.length} generators, ${checked} problems checked.`);
if (failures.length === 0) console.log('All checks passed.');
else {
  const byGen = Object.groupBy ? Object.groupBy(failures, (f) => f.generator) : {};
  for (const f of failures.slice(0, 15)) console.log(`FAIL ${f.generator} seed=${f.seed} ${JSON.stringify(f.params)}\n     ${f.problem}`);
  console.log(`${failures.length} failures in total.`);
  process.exit(1);
}
