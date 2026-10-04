// Single source of truth. UI modules read getState() and change it through update().
import { newWorksheet } from './schema.js';

const state = {
  worksheet: newWorksheet(),
  editingId: null, // id of the problem loaded in the editor, or null
  dirty: false,    // true when there are changes not yet saved to a file
};

const listeners = new Set();

export const getState = () => state;

/** fn(kind, state). kind is "render" (re-draw the worksheet) or "meta" (title-like edits, no re-draw). */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(kind) {
  listeners.forEach((fn) => fn(kind, state));
}

/** Runs mutator(state), marks the worksheet as changed and notifies subscribers. */
export function update(mutator, { render = true, dirty = true } = {}) {
  mutator(state);
  if (dirty) {
    state.worksheet.meta.updatedAt = new Date().toISOString();
    state.dirty = true;
  }
  emit(render ? 'render' : 'meta');
}

export function setWorksheet(worksheet, { dirty = false } = {}) {
  state.worksheet = worksheet;
  state.editingId = null;
  state.dirty = dirty;
  emit('render');
}

export function setEditing(id) {
  state.editingId = id;
  emit('render');
}

export function markSaved() {
  state.dirty = false;
  emit('meta');
}
