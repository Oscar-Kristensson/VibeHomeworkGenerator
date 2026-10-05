// JSON file import/export and browser autosave.
import { validateWorksheet } from './schema.js';
import { t } from './strings.js';

const AUTOSAVE_KEY = 'mathsheet.autosave.v1';

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function fileNameFor(worksheet) {
  return `${slugify(worksheet.meta.title) || 'worksheet'}.json`;
}

export function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(worksheet) {
  const name = fileNameFor(worksheet);
  downloadText(name, JSON.stringify(worksheet, null, 2) + '\n', 'application/json');
  return name;
}

/** Finds the worksheet JSON embedded in an exported HTML file, or null when there is none. */
export function extractSourceFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.getElementById('mathsheet-source')?.textContent ?? null;
}

/** Parses and validates JSON text. Returns { ok, errors, worksheet }. */
export function parseWorksheetText(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    return { ok: false, errors: [t('error.invalidJson', { msg: err.message })], worksheet: null };
  }
  return validateWorksheet(raw);
}

export function saveAutosave(worksheet) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), worksheet }));
  } catch { /* storage full or blocked: autosave is best effort */ }
}

export function loadAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const { savedAt, worksheet } = JSON.parse(raw);
    const result = validateWorksheet(worksheet);
    return result.worksheet ? { savedAt, worksheet: result.worksheet } : null;
  } catch {
    return null;
  }
}

export function clearAutosave() {
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* ignore */ }
}
