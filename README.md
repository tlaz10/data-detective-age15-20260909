# Signal & Story: Data Detective

A 10–15 minute, age-15 data-literacy investigation built for Taskmarket TSK-5DV55M47. Learners investigate graph framing, sampling coverage, correlation/causation, and then apply the ideas to a fresh fictional headline.

**Preview:** https://tlaz10.github.io/data-detective-age15-20260909/

## What the learner does

1. Changes the vertical-axis minimum while the underlying Nova Arcade data and statistics stay fixed.
2. Draws reproducible samples from a 240-record synthetic Orbit Puzzle Room population using a closing-hour-only frame or a less-biased all-window stratified frame.
3. Explores hints vs completion time in 45 synthetic Skyline Puzzle League sessions, then stratifies by puzzle difficulty to inspect a third-variable explanation.
4. Writes a cautious BrightByte Games case note with a claim, supporting observation, and limitation, then self-reviews it against a checklist/exemplar. The app checks structure only and does **not** pretend to understand free text.

All organisations, headlines, and records are fictional/synthetic. Nothing is presented as real research.

## Setup and exact commands

Runtime expectation: **Node.js 24.x**. The delivered lockfile pins dev dependencies.

```text
npm ci
npm start
```

Open `http://127.0.0.1:4173`.

Tests:

```text
npm test
npm run test:browser
npm run test:all
```

`npm test` uses Node's built-in test runner for calculations and sampling logic. `npm run test:browser` starts its own local server on port **45115** and drives the installed Chrome with Puppeteer; set `CHROME_PATH` if Chrome is elsewhere.

## Tested environment

- Windows 10/11 host
- Node.js 24.16.0
- Google Chrome 152.0.7977.77
- puppeteer-core 25.10.0 (development/test only)
- axe-core 4.13.0 (development/test only)
- Automated responsive checks at 1280×900, 768×900, and 360×800

The site uses standard HTML/CSS/ES modules/SVG and should work in current Chromium, Firefox, and Safari-family browsers, but only the Chrome version above was exercised for this submission.

## Architecture

- `index.html` — semantic learner interface and learning content shell.
- `styles.css` — responsive presentation, focus treatment, touch sizing, and reduced-motion handling.
- `data/datasets.json` — learner-visible dataset metadata, units, provenance, dictionary, graph records, and transfer case facts.
- `src/model.js` — pure calculations, deterministic synthetic population construction, seeded sampling, summaries, and correlation calculations.
- `src/app.js` — browser state, chart rendering, feedback, progress, local evidence notebook, and reset/replay behavior.
- `tests/model.test.mjs` — deterministic domain tests.
- `tests/browser.test.mjs` — end-to-end learner journey, accessibility, viewport, touch, persistence/reset, screenshots, and console-error checks.
- `screenshots/` — numbered evidence walkthrough captured by the browser test.

Learning content/data are kept separate from calculation logic where practical. UI code consumes the bundled data/model layer. There is no backend.

## Data, privacy, and persistence

Core assets and data are bundled in this repository. At runtime the page makes no third-party requests, uses no analytics/tracking, has no ads, account, login, payment, upload, chat, remote grading, or generative AI.

Progress, notebook entries, and learner-entered case text are stored only in browser `localStorage` under `signal-story-data-detective-v1`. The interface explains this and provides **Reset lesson** / **Erase local progress**. Reset works without reloading the page.

See `DATA_NOTES.md` for construction notes and the data dictionary.

## Accessibility

The lesson uses semantic buttons/forms, visible keyboard focus, text/table alternatives for essential charts, non-color feedback, scrollable tables that can receive keyboard focus, responsive layouts, and `prefers-reduced-motion`. The automated submission run reported zero axe-core WCAG 2.x A/AA violations and no page-level horizontal overflow at the three required widths. Deliberately wide data tables scroll within their labeled data region.

## Deployment

The project is static. GitHub Pages can publish the repository root from `main`; no build step or paid service is required. The local Node server exists only for preview/testing because ES modules plus bundled JSON should be served over HTTP rather than opened with `file://`.

## Known limitations

- Free-text reasoning is never semantically auto-scored. Structural completion + self-review/exemplar are intentional.
- Correlation and sampling examples are constructed teaching cases, not inferential studies and not evidence of learning gains.
- Browser automation was run only in Chrome 152.0.7977.77.
- Progress is browser-local; clearing site storage or using another browser/device starts a new lesson.
- There is no service worker/offline install mode. Once served, the core lesson has no external service dependency.

## Documentation

- `EDUCATOR_GUIDE.md` — objectives, prerequisites, walkthrough, adaptations, sources, limitations, follow-up.
- `TEST_REPORT.md` — acceptance-criteria evidence and actual test results.
- `DATA_NOTES.md` — synthetic-data provenance, construction, units, and dictionary.
- `THIRD_PARTY_NOTICES.md` — dependency/media attribution.
- `LICENSE` — MIT license for original project code/content.

