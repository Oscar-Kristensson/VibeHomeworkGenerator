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
| 4. Generators | next |
| 5. HTML export | planned |
| 6. Polish (JSON editor, tests page, more generators) | planned |

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
