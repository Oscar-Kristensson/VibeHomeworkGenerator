import { applyStrings, t, tn } from './strings.js';
import { getState, subscribe, setWorksheet, markSaved } from './state.js';
import { newWorksheet } from './schema.js';
import { downloadJson, parseWorksheetText, extractSourceFromHtml, saveAutosave, loadAutosave, clearAutosave } from './storage.js';
import { initWorksheetView } from './ui/worksheetView.js';
import { initProblemEditor } from './ui/problemEditor.js';
import { initGeneratorPanel } from './ui/generatorPanel.js';
import { initExportDialog } from './ui/exportDialog.js';
import { toast } from './ui/toast.js';
import { $, h } from './ui/dom.js';

applyStrings();

// ---- banner (restore prompt, file errors)
const banner = $('#banner');
function showBanner({ text, items = [], actions = [], kind = '' }) {
  banner.className = `banner ${kind}`.trim();
  banner.replaceChildren(
    h('div', { class: 'banner-text' },
      h('p', { text }),
      items.length > 0 && h('ul', {}, items.map((item) => h('li', { text: item }))),
    ),
    h('div', { class: 'banner-actions' }, actions.map((a) => h('button', { type: 'button', class: `btn small${a.primary ? ' primary' : ''}`, text: a.label, onclick: a.onClick }))),
  );
  banner.hidden = false;
}
const hideBanner = () => { banner.hidden = true; };

// ---- load / save
const confirmDiscard = () => !getState().dirty || window.confirm(t('confirm.discard'));

function loadText(text) {
  const result = parseWorksheetText(text);
  if (!result.ok) {
    showBanner({
      kind: 'error',
      text: t('banner.errorTitle'),
      items: result.errors.slice(0, 8),
      actions: [{ label: t('banner.dismiss'), onClick: hideBanner }],
    });
    return false;
  }
  hideBanner();
  setWorksheet(result.worksheet, { dirty: false });
  toast(t('toast.loaded', { title: result.worksheet.meta.title || t('worksheet.untitled') }));
  return true;
}

async function openFile(file) {
  if (!file || !confirmDiscard()) return;
  let text = await file.text();
  if (/\.html?$/i.test(file.name)) { // an exported worksheet that carries its source data
    text = extractSourceFromHtml(text);
    if (text === null) {
      showBanner({ kind: 'error', text: t('error.noSource'), actions: [{ label: t('banner.dismiss'), onClick: hideBanner }] });
      return;
    }
  }
  loadText(text);
}

async function loadExample() {
  if (!confirmDiscard()) return;
  try {
    const response = await fetch('examples/sample-worksheet.json');
    if (!response.ok) throw new Error(response.statusText);
    loadText(await response.text());
  } catch {
    toast(t('toast.exampleFailed'), { timeout: 10000 });
  }
}

const fileInput = $('#file-input');
$('#btn-open').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { openFile(fileInput.files[0]); fileInput.value = ''; });

$('#btn-new').addEventListener('click', () => {
  if (!confirmDiscard()) return;
  hideBanner();
  clearAutosave();
  setWorksheet(newWorksheet(), { dirty: false });
});

$('#btn-save').addEventListener('click', () => {
  const name = downloadJson(getState().worksheet);
  markSaved();
  toast(t('toast.fileSaved', { name }));
});

// Drop a .json file anywhere on the page to open it.
window.addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault(); });
window.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  e.preventDefault();
  openFile(file);
});

window.addEventListener('beforeunload', (e) => {
  if (getState().dirty) { e.preventDefault(); e.returnValue = ''; }
});

// ---- tabs
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach((other) => {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
    $('#' + other.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// ---- status + autosave
const status = $('#save-status');
let autosaveOn = false;
let autosaveTimer = null;

subscribe((kind, state) => {
  status.textContent = state.dirty ? t('status.unsaved') : t('status.clean');
  status.classList.toggle('is-dirty', state.dirty);
  if (!autosaveOn || !state.dirty) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveAutosave(state.worksheet), 400);
});

// ---- start
initProblemEditor();
initGeneratorPanel();
initExportDialog();
initWorksheetView({ onLoadExample: loadExample });
status.textContent = t('status.clean');

const previous = loadAutosave();
if (previous && previous.worksheet.problems.length > 0) {
  showBanner({
    text: t('banner.restore', {
      title: previous.worksheet.meta.title || t('worksheet.untitled'),
      count: tn('count.problem', previous.worksheet.problems.length),
      when: new Date(previous.savedAt).toLocaleString(),
    }),
    actions: [
      {
        label: t('banner.restoreBtn'), primary: true,
        onClick: () => {
          if (!confirmDiscard()) return;
          autosaveOn = true;
          hideBanner();
          setWorksheet(previous.worksheet, { dirty: true });
        },
      },
      { label: t('banner.discardBtn'), onClick: () => { clearAutosave(); autosaveOn = true; hideBanner(); } },
    ],
  });
} else {
  autosaveOn = true;
}
