// Builds the standalone HTML worksheet. Everything here is pure (no fetch, no DOM), so it can be tested in Node.
// Loading the CSS and fonts is done separately in loadAssets().
import { renderToHtml, escapeHtml } from '../render.js';
import { createRng, newSeed } from '../generators/rng.js';
import { slugify } from '../storage.js';
import { t, tn } from '../strings.js';

export const DEFAULT_OPTIONS = {
  includeAnswerKey: false,
  includeSolutions: false,
  answerKeyOnNewPage: true,
  showPoints: true,
  shuffle: false,
  fonts: 'cdn',        // "cdn" links the KaTeX fonts, "embed" inlines them as base64
  embedSource: false,  // adds the worksheet JSON (with answers) so the file can be re-imported
};

const EXPORT_CSS = `
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: #e9edf2; }
.ws-doc { max-width: 48rem; margin: 2rem auto; padding: 2.5rem 3rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
.ws-title { margin: 0; }
.ws-total { margin: 0.75rem 0 0; text-align: right; font-size: 0.85rem; color: var(--ws-muted); }
.ws-points-tag { float: right; margin: 0 0 0.25rem 1rem; font-size: 0.8em; color: var(--ws-muted); white-space: nowrap; }
.ws-answer-key { margin-top: 3rem; }
.ws-answer-key h2 { margin: 0 0 1rem; padding-bottom: 0.5rem; font-size: 1.4rem; border-bottom: 2px solid var(--ws-ink); }
.ws-answer-key .ws-problem { margin-bottom: 0.9rem; }
.ws-answer-key .ws-answer { margin: 0; }
@media (max-width: 600px) { .ws-doc { margin: 0; padding: 1.25rem; box-shadow: none; } }
@page { margin: 18mm; }
@media print {
  body { background: #fff; }
  .ws-doc { max-width: none; margin: 0; padding: 0; box-shadow: none; }
  .ws-answer-key.new-page { break-before: page; margin-top: 0; }
  .ws-problem { break-inside: avoid; }
}
`;

/** Rewrites the KaTeX stylesheet so its fonts either load from a CDN or are embedded as base64. */
export function prepareKatexCss(css, { fonts, version, fontData = {} }) {
  return css
    // keep only the woff2 sources (all current browsers support them)
    .replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, '')
    .replace(/url\(fonts\/([^)]+\.woff2)\)/g, (_, file) => {
      if (fonts !== 'embed') return `url(https://cdn.jsdelivr.net/npm/katex@${version}/dist/fonts/${file})`;
      if (!fontData[file]) throw new Error(`Missing font data for ${file}`);
      return `url(data:font/woff2;base64,${fontData[file]})`;
    });
}

function shuffled(list) {
  const rng = createRng(newSeed());
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Returns { html, mathErrors }.
 * assets = { katex, katexCss (already prepared), worksheetCss }
 */
export function buildExportHtml(worksheet, options, assets) {
  const o = { ...DEFAULT_OPTIONS, ...options };
  const mathErrors = [];
  const render = (text) => renderToHtml(text, assets.katex, (msg) => mathErrors.push(msg));

  const { meta, settings } = worksheet;
  const title = meta.title.trim() || t('worksheet.untitled');
  const problems = o.shuffle ? shuffled(worksheet.problems) : worksheet.problems;
  const totalPoints = Math.round(worksheet.problems.reduce((sum, p) => sum + p.points, 0) * 100) / 100;
  // "no numbering" is fine on the worksheet, but an answer key needs numbers to be matchable
  const keyNumbering = settings.numbering === 'none' ? 'decimal' : settings.numbering;

  const problemItems = problems.map((p) => `<li class="ws-problem">`
    + (o.showPoints ? `<span class="ws-points-tag">${escapeHtml(tn('problem.pts', p.points))}</span>` : '')
    + `<div class="ws-statement">${render(p.statement)}</div></li>`).join('\n');

  let answerKey = '';
  if (o.includeAnswerKey) {
    const items = problems.map((p) => {
      const parts = [];
      if (p.answer.trim()) parts.push(`<div class="ws-answer">${render(p.answer)}</div>`);
      if (o.includeSolutions && p.solution.trim()) {
        parts.push(`<div class="ws-solution"><strong>${escapeHtml(t('problem.solution'))}</strong> ${render(p.solution)}</div>`);
      }
      if (parts.length === 0) parts.push('<div class="ws-solution">&mdash;</div>');
      return `<li class="ws-problem">${parts.join('')}</li>`;
    }).join('\n');
    answerKey = `<section class="ws-answer-key${o.answerKeyOnNewPage ? ' new-page' : ''}">
<h2>${escapeHtml(t('export.answerKey'))}</h2>
<ol class="ws-problems" data-numbering="${keyNumbering}">
${items}
</ol>
</section>`;
  }

  // "<" is escaped so the data can never close the script tag early
  const source = o.embedSource
    ? `<script type="application/json" id="mathsheet-source">${JSON.stringify(worksheet).replace(/</g, '\\u003c')}</script>\n`
    : '';

  const html = `<!doctype html>
<html lang="${escapeHtml(t('app.lang'))}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Mathsheet">
<title>${escapeHtml(title)}</title>
<style>
${assets.katexCss}
${assets.worksheetCss}
${EXPORT_CSS}
</style>
</head>
<body>
<main class="ws-page ws-doc">
<header class="ws-header">
<h1 class="ws-title">${escapeHtml(title)}</h1>
${meta.subject.trim() ? `<p class="ws-subject">${escapeHtml(meta.subject.trim())}</p>` : ''}
${settings.showNameDateFields ? `<div class="ws-fields"><span class="ws-field">${escapeHtml(t('sheet.name'))}</span><span class="ws-field">${escapeHtml(t('sheet.date'))}</span></div>` : ''}
${o.showPoints && totalPoints > 0 ? `<p class="ws-total">${escapeHtml(tn('controls.total', totalPoints))}</p>` : ''}
</header>
<ol class="ws-problems" data-numbering="${settings.numbering}">
${problemItems}
</ol>
${answerKey}
</main>
${source}</body>
</html>
`;
  return { html, mathErrors };
}

export function exportFileName(worksheet) {
  return `${slugify(worksheet.meta.title) || 'worksheet'}.html`;
}

// ---- browser-only: fetching the CSS and fonts the export embeds ----

let cached = null;

/** For the test page: the raw stylesheet, worksheet CSS and base64 fonts. */
export async function loadTestAssets() {
  await loadAssets('embed');
  return { rawKatexCss: cached.rawKatexCss, worksheetCss: cached.worksheetCss, fontData: cached.fontData };
}

async function fetchOk(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response;
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Fetches the stylesheets (and the fonts, when embedding) and returns assets for buildExportHtml. */
export async function loadAssets(fonts) {
  cached ??= {
    rawKatexCss: await (await fetchOk('vendor/katex/katex.min.css')).text(),
    worksheetCss: await (await fetchOk('css/worksheet.css')).text(),
    fontData: null,
  };
  if (fonts === 'embed' && !cached.fontData) {
    const files = [...new Set([...cached.rawKatexCss.matchAll(/url\(fonts\/([^)]+\.woff2)\)/g)].map((m) => m[1]))];
    const entries = await Promise.all(files.map(async (file) => [file, toBase64(await (await fetchOk(`vendor/katex/fonts/${file}`)).arrayBuffer())]));
    cached.fontData = Object.fromEntries(entries);
  }
  return {
    katex: window.katex,
    worksheetCss: cached.worksheetCss,
    katexCss: prepareKatexCss(cached.rawKatexCss, { fonts, version: window.katex.version, fontData: cached.fontData ?? {} }),
  };
}
