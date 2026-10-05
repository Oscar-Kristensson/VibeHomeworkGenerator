// All user-facing text lives here so the UI can be translated by swapping this object.
export const S = {
  'app.name': 'Mathsheet',

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
