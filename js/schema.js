// Worksheet data model: defaults, validation and version migrations.
import { LANGUAGES, getLanguage, isLanguage } from './strings.js';

export const SCHEMA_VERSION = 1;
export const NUMBERINGS = ['decimal', 'alpha', 'roman', 'none'];
export const PROBLEM_TYPES = ['custom', 'generated'];

/** Migrations[n] upgrades a worksheet from schema version n to n + 1. */
const MIGRATIONS = {
  // 1: (data) => { ...; data.schemaVersion = 2; return data; },
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function uid() {
  return 'p_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
}

/** language: wording of generated problems and labels in exported files. New worksheets follow the interface language. */
export function newWorksheet(language = getLanguage()) {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: { title: '', subject: '', language, createdAt: now, updatedAt: now },
    settings: { showAnswers: false, showNameDateFields: true, numbering: 'decimal' },
    problems: [],
  };
}

export function newProblem(fields = {}) {
  return { id: uid(), type: 'custom', statement: '', answer: '', solution: '', points: 1, tags: [], ...fields };
}

/**
 * Checks (and upgrades) data read from a file.
 * Returns { ok, errors, worksheet }. Missing optional fields are filled with defaults;
 * unknown extra fields are kept so hand-edited files do not lose information.
 */
export function validateWorksheet(raw) {
  if (!isObj(raw)) return { ok: false, errors: ['The file must contain a JSON object.'], worksheet: null };

  const errors = [];
  let data = JSON.parse(JSON.stringify(raw));

  let version = data.schemaVersion ?? 1;
  if (!Number.isInteger(version) || version < 1) {
    errors.push('schemaVersion must be a whole number of 1 or more.');
    version = SCHEMA_VERSION;
  } else if (version > SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [`This file uses schema version ${version}, but this app only understands up to ${SCHEMA_VERSION}.`],
      worksheet: null,
    };
  }
  while (version < SCHEMA_VERSION) {
    data = MIGRATIONS[version](data);
    version = data.schemaVersion;
  }

  const base = newWorksheet();

  // meta
  if (data.meta !== undefined && !isObj(data.meta)) errors.push('meta must be an object.');
  const meta = { ...base.meta, ...(isObj(data.meta) ? data.meta : {}) };
  // Files from before languages existed are English.
  if (data.meta === undefined || !isObj(data.meta) || data.meta.language === undefined) meta.language = 'en';
  else if (!isLanguage(meta.language)) {
    errors.push(`meta.language must be one of: ${LANGUAGES.map((l) => l.code).join(', ')}.`);
    meta.language = 'en';
  }
  for (const key of ['title', 'subject', 'createdAt', 'updatedAt']) {
    if (typeof meta[key] !== 'string') {
      errors.push(`meta.${key} must be text.`);
      meta[key] = base.meta[key];
    }
  }

  // settings
  if (data.settings !== undefined && !isObj(data.settings)) errors.push('settings must be an object.');
  const settings = { ...base.settings, ...(isObj(data.settings) ? data.settings : {}) };
  for (const key of ['showAnswers', 'showNameDateFields']) {
    if (typeof settings[key] !== 'boolean') {
      errors.push(`settings.${key} must be true or false.`);
      settings[key] = base.settings[key];
    }
  }
  if (!NUMBERINGS.includes(settings.numbering)) {
    errors.push(`settings.numbering must be one of: ${NUMBERINGS.join(', ')}.`);
    settings.numbering = base.settings.numbering;
  }

  // problems
  const problems = [];
  if (!Array.isArray(data.problems)) {
    errors.push('problems must be a list.');
  } else {
    const seen = new Set();
    data.problems.forEach((raw, i) => {
      const where = `problem ${i + 1}`;
      if (!isObj(raw)) { errors.push(`${where}: must be an object.`); return; }
      const p = { ...raw };

      if (typeof p.statement !== 'string' || p.statement.trim() === '') {
        errors.push(`${where}: missing "statement".`);
        p.statement = typeof p.statement === 'string' ? p.statement : '';
      }
      if (p.type === undefined) p.type = 'custom';
      if (!PROBLEM_TYPES.includes(p.type)) {
        errors.push(`${where}: "type" must be "custom" or "generated".`);
        p.type = 'custom';
      }
      if (p.type === 'generated') {
        if (typeof p.generator !== 'string' || !p.generator) errors.push(`${where}: generated problems need a "generator" name.`);
        if (p.params === undefined) p.params = {};
        else if (!isObj(p.params)) { errors.push(`${where}: "params" must be an object.`); p.params = {}; }
        if (p.seed !== undefined && !Number.isInteger(p.seed)) errors.push(`${where}: "seed" must be a whole number.`);
      }
      for (const key of ['answer', 'solution']) {
        if (p[key] === undefined) p[key] = '';
        else if (typeof p[key] !== 'string') { errors.push(`${where}: "${key}" must be text.`); p[key] = ''; }
      }
      if (p.points === undefined) p.points = 1;
      else if (typeof p.points !== 'number' || !Number.isFinite(p.points) || p.points < 0) {
        errors.push(`${where}: "points" must be a number of 0 or more.`);
        p.points = 1;
      }
      if (p.tags === undefined) p.tags = [];
      else if (!Array.isArray(p.tags) || p.tags.some((tag) => typeof tag !== 'string')) {
        errors.push(`${where}: "tags" must be a list of text.`);
        p.tags = [];
      }
      if (typeof p.id !== 'string' || !p.id || seen.has(p.id)) p.id = uid();
      seen.add(p.id);

      // Keep a stable, readable key order in saved files.
      const { id, type, generator, params, seed, statement, answer, solution, points, tags, ...rest } = p;
      problems.push({
        id, type,
        ...(type === 'generated' ? { generator, params, ...(seed !== undefined ? { seed } : {}) } : {}),
        statement, answer, solution, points, tags, ...rest,
      });
    });
  }

  const { schemaVersion, meta: _m, settings: _s, problems: _p, ...extra } = data;
  const worksheet = { schemaVersion: SCHEMA_VERSION, meta, settings, problems, ...extra };
  return { ok: errors.length === 0, errors, worksheet };
}
