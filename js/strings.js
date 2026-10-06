// All user-facing text lives here. English is the base; other languages live in strings.<code>.js
// and fall back to English for any missing key. To add a language, see the README.
import { sv } from './strings.sv.js';

export const S = {
  'app.name': 'Mathsheet',
  'app.lang': 'en',
  'app.skip': 'Skip to the worksheet',
  'app.language': 'Language',

  'file.new': 'New',
  'file.open': 'Open',
  'file.save': 'Save JSON',
  'file.export': 'Export HTML',
  'file.exportEmpty': 'Add a problem before exporting',
  'status.unsaved': 'Unsaved changes',
  'status.clean': 'No unsaved changes',

  'tab.custom': 'Write a problem',
  'tab.generate': 'Generate',
  'tab.list': 'Add problems',

  'form.statement': 'Problem',
  'form.answer': 'Answer',
  'form.solution': 'Solution (optional)',
  'form.points': 'Points',
  'form.tags': 'Tags, separated by commas',
  'form.add': 'Add to worksheet',
  'form.save': 'Save changes',
  'form.cancel': 'Cancel',
  'form.editing': 'Editing problem {n}',
  'form.hint': 'Write math between dollar signs: $x^2$ inline, $$x^2$$ on its own line. Type \\$ for a literal dollar sign.',
  'form.preview': 'Preview',
  'form.previewEmpty': 'The rendered problem appears here.',
  'form.snippets': 'Insert math',
  'form.statementRequired': 'Write the problem text first.',
  'form.mathError': 'Check the math: {msg}',

  'json.edit': 'Edit JSON',
  'json.back': 'Back to worksheet',
  'json.title': 'Edit the worksheet as JSON',
  'json.intro': 'Changes take effect when you click Apply, and only if the file passes validation. Generated problems keep their generator, settings and seed.',
  'json.label': 'Worksheet JSON',
  'json.unchanged': 'No changes yet.',
  'json.valid': 'Valid. Ready to apply.',
  'json.invalid': 'Cannot apply yet:',
  'json.apply': 'Apply changes',
  'json.revert': 'Revert',
  'json.applied': 'JSON applied',
  'confirm.discardJson': 'You have JSON edits that were not applied. Discard them?',

  'export.title': 'Export worksheet',
  'export.intro': 'Creates one HTML file to email, upload to a learning platform or print. It needs no JavaScript.',
  'export.answerKey': 'Answer key',
  'export.key': 'Answer key',
  'export.includeKey': 'Include an answer key',
  'export.includeSolutions': 'Include worked solutions',
  'export.newPage': 'Start the answer key on a new page',
  'export.content': 'Content',
  'export.showPoints': 'Show points',
  'export.shuffle': 'Shuffle the problem order',
  'export.fonts': 'Math fonts',
  'export.fontsCdn': 'Load from a CDN',
  'export.fontsCdnHint': 'Smallest file. Math looks right only while the reader is online.',
  'export.fontsEmbed': 'Embed in the file',
  'export.fontsEmbedHint': 'Adds about 400 KB. Works offline.',
  'export.source': 'Reopening later',
  'export.embedSource': 'Embed the worksheet data in the file',
  'export.embedSourceHint': 'Lets you open the HTML file in Mathsheet again. It contains every answer and solution, so students could read them.',
  'export.download': 'Download HTML',
  'export.preview': 'Preview',
  'export.close': 'Close',
  'export.building': 'Preparing the file…',
  'export.done': 'Saved {name}',
  'export.failed': 'Could not build the export ({msg}). Check that the site is served by a web server.',
  'export.popup': 'Allow pop-ups to see the preview.',
  'export.mathErrors.one': '{n} formula could not be rendered and appears as plain text.',
  'export.mathErrors.other': '{n} formulas could not be rendered and appear as plain text.',

  'gen.generator': 'Kind of problem',
  'gen.settings': 'Settings',
  'gen.count': 'How many',
  'gen.points': 'Points each',
  'gen.button': 'Generate problems',
  'gen.countInvalid': 'Enter a number from 1 to {max}.',
  'gen.noneNew': 'No new problems could be made with these settings. Widen the number range or change an option.',

  'sheet.titlePlaceholder': 'Untitled worksheet',
  'sheet.subjectPlaceholder': 'Subject or class',
  'sheet.name': 'Name',
  'sheet.date': 'Date',
  'sheet.problems': 'Problems',
  'sheet.worksheet': 'Worksheet',
  'sheet.noName': 'Untitled worksheet',

  'controls.showAnswers': 'Show answers here',
  'controls.nameDate': 'Name and date lines',
  'controls.numbering': 'Numbering',
  'controls.language': 'Worksheet language',
  'controls.languageHint': 'Sets the wording of generated problems and the labels in exported files. Problems that already exist keep their text.',
  'numbering.decimal': '1, 2, 3',
  'numbering.alpha': 'a, b, c',
  'numbering.roman': 'i, ii, iii',
  'numbering.none': 'None',
  'controls.total.one': '{n} point in total',
  'controls.total.other': '{n} points in total',

  'empty.title': 'No problems yet',
  'empty.body': 'Write a problem on the left, or open the example to see how a worksheet looks.',
  'empty.example': 'Load example worksheet',

  'problem.up': 'Move up',
  'problem.down': 'Move down',
  'problem.edit': 'Edit',
  'problem.regenerate': 'Regenerate',
  'problem.duplicate': 'Duplicate',
  'problem.delete': 'Delete',
  'problem.drag': 'Drag to reorder',
  'problem.generated': 'Generated',
  'problem.edited': 'Edited by hand',
  'problem.label': 'Problem {n}',
  'problem.pts.one': '{n} pt',
  'problem.pts.other': '{n} pts',
  'problem.answer': 'Answer:',
  'problem.solution': 'Solution:',
  'problem.tools': 'Actions for problem {n}',

  'toast.added': 'Problem added',
  'toast.generated.one': '{n} problem added',
  'toast.generated.other': '{n} problems added',
  'toast.generatedFewer': 'Added {made} of {wanted}. These settings allow few different problems.',
  'toast.regenerateFailed': 'This problem could not be regenerated. Check its generator and params in the JSON.',
  'toast.updated': 'Problem updated',
  'toast.deleted': 'Problem deleted',
  'toast.undo': 'Undo',
  'toast.fileSaved': 'Saved {name}',
  'toast.loaded': 'Opened {title}',
  'toast.exampleFailed': 'Could not load the example. Serve this folder with a local web server (see README).',

  'banner.restore': 'Restore your last session? "{title}", {count}, saved {when}.',
  'banner.restoreBtn': 'Restore',
  'banner.discardBtn': 'Discard',
  'banner.errorTitle': 'This file could not be opened.',
  'banner.dismiss': 'Dismiss',
  'count.problem.one': '{n} problem',
  'count.problem.other': '{n} problems',

  'confirm.regenerateEdited': 'This problem was edited by hand. Replace it with a new generated one?',
  'confirm.discard': 'You have unsaved changes. Discard them?',
  'worksheet.untitled': 'Untitled worksheet',

  'error.noSource': 'This HTML file has no worksheet data. Only files exported with "Embed the worksheet data" can be opened again.',
  'error.invalidJson': 'The file is not valid JSON ({msg}).',
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },
];
const DICTS = { en: S, sv };
export const isLanguage = (code) => Object.hasOwn(DICTS, code);

const LANG_KEY = 'mathsheet.lang';

function detectLanguage() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (isLanguage(fromUrl)) return fromUrl;
    const saved = localStorage.getItem(LANG_KEY);
    if (isLanguage(saved)) return saved;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (isLanguage(browser)) return browser;
  } catch { /* not in a browser: use English */ }
  return 'en';
}

let current = detectLanguage();

/** The interface language. */
export const getLanguage = () => current;

/** Remembers the choice; the page is reloaded afterwards so every string is redrawn. */
export function setLanguage(code) {
  if (!isLanguage(code)) return;
  current = code;
  try { localStorage.setItem(LANG_KEY, code); } catch { /* best effort */ }
}

/** Looks up a string. Pass lang to use another language than the interface (the export does this). */
export function t(key, vars = {}, lang = current) {
  const template = DICTS[lang]?.[key] ?? S[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/** Picks "<key>.one" or "<key>.other" depending on n. */
export function tn(key, n, vars = {}, lang = current) {
  return t(`${key}.${n === 1 ? 'one' : 'other'}`, { n, ...vars }, lang);
}

/** Fills elements marked with data-i18n, data-i18n-title, data-i18n-placeholder, data-i18n-label. */
export function applyStrings(root = document) {
  document.documentElement.lang = t('app.lang');
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
}
