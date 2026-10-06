// Checks for the HTML export. Pure ES module (no DOM), used by tests/run.mjs.
import { buildExportHtml, prepareKatexCss } from '../js/export/exportHtml.js';

const count = (text, re) => (text.match(re) ?? []).length;

export function checkExport(worksheet, { katex, rawKatexCss, worksheetCss, fontData }) {
  const failures = [];
  const check = (cond, msg) => { if (!cond) failures.push(msg); };
  const build = (options, ws = worksheet, fonts = options.fonts ?? 'cdn') => buildExportHtml(ws, options, {
    katex, worksheetCss,
    katexCss: prepareKatexCss(rawKatexCss, { fonts, version: katex.version, fontData }),
  });
  const n = worksheet.problems.length;

  // plain student copy
  let { html, mathErrors } = build({});
  check(mathErrors.length === 0, `math errors: ${mathErrors.join('; ')}`);
  check(count(html, /<li class="ws-problem">/g) === n, 'one list item per problem');
  check(!html.includes('<section class="ws-answer-key'), 'no answer key by default');
  check(!/<script/i.test(html), 'student copy contains no script tag');
  check(!html.includes('mathsheet-source'), 'no embedded data by default');
  check(count(html, /class="katex"/g) > 0, 'math is pre-rendered');
  check(!/url\(fonts\//.test(html), 'no local font paths left');
  check(html.includes(`cdn.jsdelivr.net/npm/katex@${katex.version}/dist/fonts/`), 'CDN font links');
  check(!/data:font/.test(html), 'no embedded fonts in CDN mode');
  check(!/https?:\/\/(?!cdn\.jsdelivr\.net\/npm\/katex@)/.test(html.replace(/xmlns="[^"]*"/g, '')), 'no other external URLs');

  // answer key
  ({ html } = build({ includeAnswerKey: true }));
  check(html.includes('class="ws-answer-key new-page"'), 'answer key on a new page by default');
  check(count(html, /<div class="ws-answer">/g) === worksheet.problems.filter((p) => p.answer.trim()).length, 'one answer per problem with an answer');
  check(!html.includes('class="ws-solution"><strong>'), 'solutions hidden unless requested');
  ({ html } = build({ includeAnswerKey: true, includeSolutions: true, answerKeyOnNewPage: false }));
  check(!html.includes('new-page"'), 'answer key can stay on the same page');
  check(html.includes('<strong>Solution:</strong>'), 'solutions shown when requested');

  // fonts embedded
  const embedded = build({ fonts: 'embed' }).html;
  check(count(embedded, /url\(data:font\/woff2;base64,/g) >= 15, 'fonts embedded as base64');
  check(!/cdn\.jsdelivr/.test(embedded) && !/url\(fonts\//.test(embedded), 'embedded export is fully offline');

  // shuffle keeps the same set of problems
  const shuffled = build({ shuffle: true }).html;
  check(count(shuffled, /<li class="ws-problem">/g) === n, 'shuffle keeps every problem');

  // points
  check(!build({ showPoints: false }).html.includes('ws-points-tag"'), 'points can be hidden');

  // embedded source round-trips and cannot break out of its script tag
  const hostile = JSON.parse(JSON.stringify(worksheet));
  hostile.meta.title = '<img src=x onerror=alert(1)> Test';
  hostile.meta.subject = '</script><script>alert(2)</script>';
  hostile.problems[0].statement = '<script>alert(3)</script> $x$';
  hostile.problems[0].solution = '</script><b>x</b>';
  const withSource = build({ embedSource: true, includeAnswerKey: true, includeSolutions: true }, hostile).html;
  check(!/<img src=x/.test(withSource), 'title is escaped');
  check(count(withSource, /<script/gi) === 1, 'only the data script exists: ' + count(withSource, /<script/gi));
  const m = withSource.match(/<script type="application\/json" id="mathsheet-source">([\s\S]*?)<\/script>/);
  let parsed = null;
  try { parsed = JSON.parse(m[1]); } catch { /* handled below */ }
  check(parsed && parsed.problems[0].statement === hostile.problems[0].statement && parsed.meta.title === hostile.meta.title, 'embedded JSON round-trips');

  // name/date fields and numbering follow the worksheet settings
  const settings = JSON.parse(JSON.stringify(worksheet));
  settings.settings.showNameDateFields = false;
  settings.settings.numbering = 'none';
  const plain = build({ includeAnswerKey: true }, settings).html;
  check(!plain.includes('ws-fields">'), 'name/date line can be off');
  check(plain.includes('data-numbering="none"') && plain.includes('data-numbering="decimal"'), 'answer key is numbered even when the worksheet is not');

  // bad formulas fall back to plain text instead of failing
  const broken = JSON.parse(JSON.stringify(worksheet));
  broken.problems[0].statement = 'Oops $\\notacommand{$ and $x$';
  const result = build({}, broken);
  check(result.mathErrors.length === 1 && result.html.includes('class="math-error"'), 'broken formula shown as plain text');

  // Swedish worksheet: labels and page language follow meta.language
  const swedish = JSON.parse(JSON.stringify(worksheet));
  swedish.meta.language = 'sv';
  const svHtml = build({ includeAnswerKey: true, includeSolutions: true }, swedish).html;
  check(svHtml.includes('<html lang="sv">'), 'Swedish export declares lang="sv"');
  check(svHtml.includes('>Namn<') && svHtml.includes('>Datum<') && svHtml.includes('>Facit<'), 'Swedish labels for name, date and answer key');
  check(svHtml.includes('<strong>Lösning:</strong>'), 'Swedish label for solutions');
  check(/\d+ p<\/span>/.test(svHtml) && /poäng totalt/.test(svHtml), 'Swedish points and total');
  check(!svHtml.includes('>Name<') && !svHtml.includes('Answer key</h2>'), 'no English labels left in the Swedish export');
  check(build({}).html.includes('<html lang="en">') && build({}).html.includes('>Name<'), 'English export unchanged');

  return { failures, sizes: { cdn: build({}).html.length, embedded: embedded.length } };
}
