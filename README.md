# Mathsheet

A static website for building math homework. Write your own problems, keep everything in a JSON file, and (soon) auto-generate problems and export the worksheet as a standalone HTML page. Math is rendered with [KaTeX](https://katex.org/), vendored in `vendor/katex/` so it works offline.

## Run it

The app uses ES modules, which browsers block on `file://`, so serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

It also works unchanged on GitHub Pages or any static host.

## Status

| Milestone | State |
|---|---|
| 1. Skeleton, KaTeX, state, layout | done |
| 2. Custom problems with live preview, list with edit / reorder / delete | done |
| 3. JSON save / open / validation / autosave | done |
| 4. Generators: registry, auto-built settings form, 10 generators, regenerate | done |
| 5. HTML export: standalone file, answer key, print CSS | done |
| 6. Polish: 17 generators, JSON editor, tests page, accessibility pass | done |
| Extra: Swedish interface, generated problems and export | done |

## Exporting

**Export HTML** creates one self-contained file to email, upload to a learning platform or print. Math is pre-rendered, so the file contains no JavaScript.

- **Answer key:** optional, with or without worked solutions, on its own page or straight after the problems. It follows the printed order and is always numbered.
- **Content:** show or hide points, shuffle the problem order. Name and date lines and the numbering style come from the worksheet settings.
- **Math fonts:** link them from a CDN (about 32 KB per file, math looks right only online) or embed them (about 370 KB, fully offline).
- **Reopening later:** you can embed the worksheet JSON in the file. Open the HTML in Mathsheet with **Open** to continue editing. The data includes all answers, so leave it off for files you give to students.
- **Preview** opens the file in a new tab. Printing uses page margins and keeps each problem on one page.
- User text is always escaped. Only KaTeX output is inserted as HTML.

## Generators

Open the **Generate** tab, pick a kind of problem, adjust its settings, choose how many, and click *Generate problems*. They are added to the worksheet (Undo is offered). On the worksheet, **Regenerate** gives a problem a new seed, **Edit** changes its text by hand, and **Delete** removes it.

| Category | Generators |
|---|---|
| Arithmetic | `arithmetic.integers` |
| Fractions | `fractions.addSubtract`, `fractions.multiply`, `fractions.simplify` |
| Algebra | `linearEquations.oneStep`, `linearEquations.twoStep`, `quadratics.factoring`, `quadratics.solve` |
| Percentages | `percentages.ofNumber`, `percentages.discount` |
| Powers and roots | `powers.evaluate`, `powers.roots`, `powers.exponentLaws` |
| Geometry | `geometry.rectangle`, `geometry.triangle`, `geometry.circle` (units: cm, m, in, ft) |
| Calculus | `derivatives.polynomial` |

The same generator, settings and seed always give the same problem. The rendered text is stored too, so hand edits in the JSON are never overwritten unless you click Regenerate.

To add a generator, create a module in `js/generators/` that exports an array of generators (see `arithmetic.js`: `id`, `name`, `category`, `paramSchema`, `generate(params, rng)`) and add it to the list in `js/generators/index.js`. The settings form is built from `paramSchema` (types `int`, `bool`, `select`). Also add a matching check in `tests/generator-checks.js`.

## Editing the JSON directly

**Edit JSON** in the top bar shows the whole worksheet as text. Changes are validated as you type, errors are listed by problem number, and nothing is applied until you click **Apply changes** (or press Ctrl/Cmd+Enter). **Revert** goes back to the current worksheet.

## Tests

Open `tests.html` through the web server (for example `http://localhost:8000/tests.html`) to run everything in the browser. Add `?seeds=1000` to test more seeds. Or run it from a terminal:

```sh
node tests/run.mjs
```

Both run every generator in both languages over 300 seeds and every setting variant (about 58,000 problems). Each answer is re-checked independently of the generator, every formula must render in KaTeX, and the same seed must give the same result. It also checks the HTML export: escaping, the answer key, fonts, the embedded data, and that broken formulas degrade to plain text.

## Accessibility

- A skip link, labelled form fields, and a labelled list of problems.
- Drag and drop has a keyboard alternative: the move up and move down buttons keep focus after use. After deleting, focus moves to a neighbouring problem.
- Math is rendered with KaTeX's MathML output, so screen readers can read it.
- Errors are announced and marked (`aria-invalid`), status messages use live regions, and the interface does not rely on colour alone.
- Larger touch targets on touch screens, no animation when reduced motion is requested, and forced-colors support.

## Languages

The app is available in **English** and **Svenska**.

- **Interface language:** pick it in the top bar. It defaults to your browser language and is remembered. The page reloads to redraw everything, and unsaved work is autosaved. You can also use `?lang=sv` in the address.
- **Worksheet language:** set above the worksheet and stored in the file as `meta.language`. It controls the wording and notation of *generated* problems, and the labels in exported files (Name, Date, Answer key, Solution, points, the page language). A new worksheet starts in the interface language. Files without the field are treated as English.
- **Changing the worksheet language** does not rewrite problems that already exist. Use **Regenerate** on a generated problem to get it in the new language. Custom problems are always yours to write.
- **Swedish notation:** multiplication uses `·`, division uses `:`, percent is written `25 %`, prices are written `80 kr`, and units use `tum` and `fot`.
- An example worksheet in each language is in `examples/`. **Load example worksheet** opens the one for the interface language.

### Adding another language

1. Interface: copy `js/strings.sv.js` to `js/strings.<code>.js`, translate the values, and register it in `js/strings.js` (`DICTS` and `LANGUAGES`). Missing keys fall back to English.
2. Generated problems: add an entry to `BOOKS` in `js/generators/phrases.js` (wording, the notation symbols, units, money format).
3. Names in the Generate tab: add a table to `js/generators/i18n.js`.
4. Run `node tests/run.mjs`. It reports missing keys, placeholders that do not match, untranslated generator names, and checks that every generator still produces correct math in each language.

## Hosting

Push the folder to GitHub Pages or any static host. `.nojekyll` is included. No build step.

KaTeX 0.16.11 is bundled in `vendor/katex/` under its MIT licence (see `vendor/katex/LICENSE`).

## Writing math

- `$x^2$` is inline math, `$$x^2$$` is display math.
- `\$` is a literal dollar sign.
- The same rules apply to the problem, answer and solution fields.

## File format

```json
{
  "schemaVersion": 1,
  "meta": { "title": "...", "subject": "...", "language": "en", "createdAt": "...", "updatedAt": "..." },
  "settings": { "showAnswers": false, "showNameDateFields": true, "numbering": "decimal" },
  "problems": [
    { "id": "p_01", "type": "custom", "statement": "...", "answer": "...", "solution": "...", "points": 2, "tags": [] },
    { "id": "p_03", "type": "generated", "generator": "linearEquations.oneStep", "params": {}, "seed": 482913,
      "statement": "...", "answer": "...", "solution": "...", "points": 2, "tags": [] }
  ]
}
```

- `numbering` is one of `decimal`, `alpha`, `roman`, `none`. `language` is `en` or `sv`.
- Generated problems keep their rendered text, so hand edits are never overwritten. Editing one in the app adds `"edited": true`.
- Opening a file reports problems by position, for example `problem 3: missing "statement".`
- Unknown extra fields are preserved.

## Layout

- `js/state.js` is the single source of truth. `js/schema.js` validates and migrates files. `js/storage.js` handles files and autosave.
- `js/render.js` turns `$...$` text into KaTeX output without ever inserting user text as HTML.
- `js/strings.js` holds the English UI strings and the language logic, `js/strings.sv.js` the Swedish ones. `js/generators/phrases.js` and `i18n.js` hold the wording and names for generators.
- `js/export/exportHtml.js` builds the export (pure functions, tested in Node). `css/worksheet.css` is shared by the editor and the export. `css/app.css` is editor-only.
