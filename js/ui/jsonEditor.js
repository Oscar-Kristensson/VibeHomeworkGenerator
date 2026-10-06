// Raw JSON view: edit the whole worksheet as text, validated before it is applied.
import { getState, subscribe, setWorksheet } from '../state.js';
import { parseWorksheetText } from '../storage.js';
import { t } from '../strings.js';
import { toast } from './toast.js';
import { $, h } from './dom.js';

export function initJsonEditor() {
  const button = $('#btn-json');
  const layout = $('.layout');
  const sheetDesk = $('#worksheet');
  const view = $('#json-view');
  const text = $('#json-text');
  const status = $('#json-status');
  const applyBtn = $('#json-apply');
  const revertBtn = $('#json-revert');

  let open = false;
  let timer = null;
  let pending = null; // the validated worksheet that Apply would use

  const currentText = () => JSON.stringify(getState().worksheet, null, 2) + '\n';
  const isModified = () => text.value !== currentText();

  function validate() {
    const modified = isModified();
    const result = parseWorksheetText(text.value);
    pending = result.ok ? result.worksheet : null;
    status.className = 'json-status';
    if (!modified) {
      status.textContent = t('json.unchanged');
    } else if (result.ok) {
      status.classList.add('is-valid');
      status.textContent = t('json.valid');
    } else {
      status.classList.add('is-invalid');
      status.replaceChildren(
        h('p', { text: t('json.invalid') }),
        h('ul', {}, result.errors.slice(0, 8).map((e) => h('li', { text: e }))),
      );
    }
    applyBtn.disabled = !modified || !result.ok;
  }

  function refresh() {
    text.value = currentText();
    validate();
  }

  function toggle() {
    if (open && isModified() && !window.confirm(t('confirm.discardJson'))) return;
    open = !open;
    layout.classList.toggle('json-mode', open);
    sheetDesk.hidden = open;
    view.hidden = !open;
    button.setAttribute('aria-pressed', String(open));
    button.textContent = open ? t('json.back') : t('json.edit');
    if (open) { refresh(); text.focus(); } else { sheetDesk.focus(); }
  }

  function apply() {
    if (!pending) return;
    setWorksheet(pending, { dirty: true }); // the subscriber below re-formats the text
    toast(t('json.applied'));
  }

  button.addEventListener('click', toggle);
  applyBtn.addEventListener('click', apply);
  revertBtn.addEventListener('click', refresh);
  text.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(validate, 200); });
  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); apply(); }
  });

  // New / Open / Restore / Apply all replace the worksheet: show the new text.
  subscribe(() => { if (open) refresh(); });
}
