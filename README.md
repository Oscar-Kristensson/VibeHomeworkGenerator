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
| 5. HTML export | next |
| 6. Polish (JSON editor, tests page, more generators) | planned |

## Generators

Open the **Generate** tab, pick a kind of problem, adjust its settings, choose how many, and click *Generate problems*. They are added to the worksheet (Undo is offered). On the worksheet, **Regenerate** gives a problem a new seed, **Edit** changes its text by hand, and **Delete** removes it.

| Category | Generators |
|---|---|
| Arithmetic | `arithmetic.integers` |
| Fractions | `fractions.addSubtract`, `fractions.multiply`, `fractions.simplify` |
| Algebra | `linearEquations.oneStep`, `linearEquations.twoStep`, `quadratics.factoring`, `quadratics.solve` |
| Percentages | `percentages.ofNumber`, `percentages.discount` |

The same generator, settings and seed always give the same problem. The rendered text is stored too, so hand edits in the JSON are never overwritten unless you click Regenerate.

To add a generator, create a module in `js/generators/` that exports an array of generators (see `arithmetic.js`: `id`, `name`, `category`, `paramSchema`, `generate(params, rng)`) and add it to the list in `js/generators/index.js`. The settings form is built from `paramSchema` (types `int`, `bool`, `select`). Also add a matching check in `tests/generator-checks.js`.

## Tests

```sh
node tests/run.mjs
```

Runs every generator over 300 seeds and every setting variant (about 14,000 problems). Each answer is re-checked independently of the generator, every formula must render in KaTeX, and the same seed must give the same result.

## Writing math

- `$x^2$` is inline math, `$$x^2$$` is display math.
- `\$` is a literal dollar sign.
- The same rules apply to the problem, answer and solution fields.

## File format

```json
{
  "schemaVersion": 1,
  "meta": { "title": "...", "subject": "...", "createdAt": "...", "updatedAt": "..." },
  "settings": { "showAnswers": false, "showNameDateFields": true, "numbering": "decimal" },
  "problems": [
    { "id": "p_01", "type": "custom", "statement": "...", "answer": "...", "solution": "...", "points": 2, "tags": [] },
    { "id": "p_03", "type": "generated", "generator": "linearEquations.oneStep", "params": {}, "seed": 482913,
      "statement": "...", "answer": "...", "solution": "...", "points": 2, "tags": [] }
  ]
}
```

- `numbering` is one of `decimal`, `alpha`, `roman`, `none`.
- Generated problems keep their rendered text, so hand edits are never overwritten. Editing one in the app adds `"edited": true`.
- Opening a file reports problems by position, for example `problem 3: missing "statement".`
- Unknown extra fields are preserved.

## Layout

- `js/state.js` is the single source of truth. `js/schema.js` validates and migrates files. `js/storage.js` handles files and autosave.
- `js/render.js` turns `$...$` text into KaTeX output without ever inserting user text as HTML.
- `js/strings.js` holds every UI string, so translating means swapping one object.
- `css/worksheet.css` is shared with the future export. `css/app.css` is editor-only.
