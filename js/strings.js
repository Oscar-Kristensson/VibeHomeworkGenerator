// All user-facing text lives here so the UI can be translated by swapping this object.
export const S = {
  'app.name': 'Mathsheet',

  'file.new': 'New',
  'file.open': 'Open JSON',
  'file.save': 'Save JSON',
  'file.export': 'Export HTML',
  'file.exportSoon': 'HTML export is not built yet',
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

  'gen.title': 'Generators are not built yet',
  'gen.body': 'Worksheets already store a generator name, its settings and a seed for each generated problem, so files you save now will keep working once generators arrive.',

  'sheet.titlePlaceholder': 'Untitled worksheet',
  'sheet.subjectPlaceholder': 'Subject or class',
  'sheet.name': 'Name',
  'sheet.date': 'Date',
  'sheet.problems': 'Problems',

  'controls.showAnswers': 'Show answers here',
  'controls.nameDate': 'Name and date lines',
  'controls.numbering': 'Numbering',
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

  'confirm.discard': 'You have unsaved changes. Discard them?',
  'worksheet.untitled': 'Untitled worksheet',

  'error.invalidJson': 'The file is not valid JSON ({msg}).',
};

export function t(key, vars = {}) {
  const template = S[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/** Picks "<key>.one" or "<key>.other" depending on n. */
export function tn(key, n, vars = {}) {
  return t(`${key}.${n === 1 ? 'one' : 'other'}`, { n, ...vars });
}

/** Fills elements marked with data-i18n, data-i18n-title, data-i18n-placeholder, data-i18n-label. */
export function applyStrings(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
}
