// The "Export HTML" dialog: options, download and preview.
import { getState, subscribe } from '../state.js';
import { buildExportHtml, loadAssets, exportFileName, DEFAULT_OPTIONS } from '../export/exportHtml.js';
import { downloadText } from '../storage.js';
import { t, tn } from '../strings.js';
import { toast } from './toast.js';
import { $ } from './dom.js';

const OPTIONS_KEY = 'mathsheet.exportOptions.v1';

export function initExportDialog() {
  const openBtn = $('#btn-export');
  const dialog = $('#export-dialog');
  const status = $('#export-status');
  const downloadBtn = $('#x-download');
  const previewBtn = $('#x-preview');
  const el = {
    key: $('#x-key'), solutions: $('#x-solutions'), newPage: $('#x-newpage'),
    points: $('#x-points'), shuffle: $('#x-shuffle'), source: $('#x-source'),
    fontsCdn: $('#x-fonts-cdn'), fontsEmbed: $('#x-fonts-embed'),
  };

  function loadOptions() {
    try { return { ...DEFAULT_OPTIONS, ...JSON.parse(localStorage.getItem(OPTIONS_KEY) ?? '{}') }; } catch { return { ...DEFAULT_OPTIONS }; }
  }
  const saveOptions = (o) => { try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(o)); } catch { /* best effort */ } };

  function writeForm(o) {
    el.key.checked = o.includeAnswerKey;
    el.solutions.checked = o.includeSolutions;
    el.newPage.checked = o.answerKeyOnNewPage;
    el.points.checked = o.showPoints;
    el.shuffle.checked = o.shuffle;
    el.source.checked = o.embedSource;
    el.fontsCdn.checked = o.fonts !== 'embed';
    el.fontsEmbed.checked = o.fonts === 'embed';
    syncDependents();
  }

  function readForm() {
    return {
      includeAnswerKey: el.key.checked,
      includeSolutions: el.solutions.checked,
      answerKeyOnNewPage: el.newPage.checked,
      showPoints: el.points.checked,
      shuffle: el.shuffle.checked,
      embedSource: el.source.checked,
      fonts: el.fontsEmbed.checked ? 'embed' : 'cdn',
    };
  }

  // Solutions and page placement only make sense with an answer key.
  function syncDependents() {
    el.solutions.disabled = !el.key.checked;
    el.newPage.disabled = !el.key.checked;
  }
  el.key.addEventListener('change', syncDependents);

  async function build() {
    const options = readForm();
    saveOptions(options);
    const assets = await loadAssets(options.fonts);
    const worksheet = getState().worksheet;
    const { html, mathErrors } = buildExportHtml(worksheet, options, assets);
    return { html, mathErrors, worksheet };
  }

  async function run(action) {
    downloadBtn.disabled = true;
    previewBtn.disabled = true;
    status.textContent = t('export.building');
    // A preview window must be opened during the click, before any waiting, or pop-up blockers stop it.
    const preview = action === 'preview' ? window.open('', '_blank') : null;
    try {
      const { html, mathErrors, worksheet } = await build();
      if (action === 'download') {
        const name = exportFileName(worksheet);
        downloadText(name, html, 'text/html');
        toast(t('export.done', { name }));
      } else if (preview) {
        preview.location = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      } else {
        toast(t('export.popup'));
      }
      if (mathErrors.length) toast(tn('export.mathErrors', mathErrors.length), { timeout: 10000 });
    } catch (err) {
      preview?.close();
      toast(t('export.failed', { msg: err.message }), { timeout: 10000 });
    } finally {
      status.textContent = '';
      downloadBtn.disabled = false;
      previewBtn.disabled = false;
    }
  }

  downloadBtn.addEventListener('click', () => run('download'));
  previewBtn.addEventListener('click', () => run('preview'));
  $('#x-close').addEventListener('click', () => dialog.close());

  openBtn.addEventListener('click', () => {
    writeForm(loadOptions());
    status.textContent = '';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  });

  // Nothing to export until there is at least one problem.
  const syncButton = (kind, state) => {
    const empty = state.worksheet.problems.length === 0;
    openBtn.disabled = empty;
    openBtn.title = empty ? t('file.exportEmpty') : '';
  };
  subscribe(syncButton);
  syncButton('render', getState());
}
