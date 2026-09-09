# Test Report — Taskmarket TSK-5DV55M47

Tested September 9, 2026 on Windows with Node.js 24.16.0 and Google Chrome 152.0.7977.77. Dev/test packages: puppeteer-core 25.10.0 and axe-core 4.13.0.

## Commands actually run

```text
npm test
npm run test:browser
npm run test:all
```

Final combined run: **PASS** — 7/7 domain tests and 15/15 browser checks. Browser console/page errors: 0. axe-core WCAG 2.x A/AA violations: 0 in the tested state.

Earlier test iterations caught and fixed: a keyboard-focus issue in scrollable table regions, mobile page overflow caused by grid-item intrinsic sizing, a touch-harness coordinate error, and an automatic favicon 404. Those failures are not presented as final passes; the final `npm run test:all` run passed after fixes.

## Acceptance criteria → evidence

| Acceptance example / requirement | Evidence exercised | Final result |
| --- | --- | --- |
| Axis changes rendering only | Browser test moves axis min to 70 and asserts `#graphStats` text and 6-row table are unchanged; model test pins mean/range/change. | PASS |
| Every chart labeled + useful accessible table + reset | SVGs include visible axis/unit labels; graph/correlation tables expose exact records, sampling table exposes composition; chart/reset controls exercised in journey. Scroll areas are keyboard-focusable. | PASS |
| Biased + less-biased sampling match documented definitions | Model tests assert closing-only contains only Closing hour; all-window n=24 contains 6 per documented equal stratum. Browser test checks rendered composition. | PASS |
| Repeated sampling reproducible/fixed cases | Model test asserts seed 2026 repeats identical IDs and seed 2027 differs. Seed is visible in UI. | PASS |
| Correlation says association alone does not establish causation | Browser selects nuanced answer and asserts immediate feedback contains that statement; stratified statistics are checked (overall 0.826, Easy -0.881). | PASS |
| Final response asks claim + observation + limitation with useful feedback | Browser fills all three fields, selects 3 issue tags, submits, and asserts structural/self-review feedback. App explicitly says prose is not semantically graded. | PASS |
| Obvious onboarding/navigation/progress/completion/next practice | End-to-end journey asserts progress 0→4, notebook count 4, refresh persistence; completion section and next-practice prompt are present. | PASS |
| Demonstration → guided practice → fresh application | Cases 01–03 are demonstrated/guided interactive investigations; Case 04 is a distinct BrightByte transfer case. | PASS |
| Meaningful input changes learning state | Axis changes visual framing, sample method/size/seed changes composition, stratify toggle changes grouping/stats, checked reasoning updates progress/notebook. | PASS |
| Immediate specific feedback, hint, retry, no shame/rank | Each case includes hint/scaffold and specific feedback; buttons remain usable after incorrect answers; no lives, ranking, score, or shame language. | PASS by source + journey |
| Reset/replay without reload | Browser accepts Reset confirmation after completed persisted state and asserts progress/notebook return to 0 without navigation/reload. Replay control is present. | PASS |
| Browser-only persistence explanation and clear reset | UI privacy copy and README describe localStorage key; persistence is asserted after reload; reset is asserted. | PASS |
| Educator guide requirements | `EDUCATOR_GUIDE.md` includes prerequisites, objectives, walkthrough/session time, adaptations/co-play, sources, limitations, and offline follow-up. | PASS by document inspection |
| ≥2 reputable references with titles/URLs/support | Educator guide lists AAPOR “Best Practices for Survey Research” and NIST “1.3.3.26. Scatter Plot,” with URLs and explanation of use. Both URLs were web-verified Sept. 9, 2026. | PASS |
| Synthetic datasets, units, provenance, dictionary | `data/datasets.json` + `DATA_NOTES.md` document fictional status, construction, units, fields, and purposes. Model tests pin constructed cases. | PASS |
| Fictional headline/person/organization | Nova Arcade, Orbit Puzzle Room, Skyline Puzzle League, BrightByte Games and transfer headline are explicitly identified as fictional/synthetic. | PASS |
| No real science / no sensitive claim | Learner content states synthetic/fictional repeatedly; no medical, political, learner-demographic, or sensitive real-world claim is used. | PASS by source inspection |
| 360 / 768 / 1280 responsive | Browser test checks document scroll width ≤ viewport at 360×800, 768×900, 1280×900. Deliberately wide tables scroll inside their own focusable data regions. | PASS |
| Keyboard core action | Graph answer is selected with Space and submitted with Enter; correlation stratification toggle is operated with Space. Visible focus styles are present. | PASS |
| Touch/core action | Puppeteer mobile emulation at 360×800 uses `touchscreen.tap` on Start and asserts navigation changes. | PASS (simulated touch) |
| Non-drag alternatives / chart text alternatives | Core interactions are radio/button/range/checkbox controls; all essential charts have tables and textual summaries. | PASS by source + browser |
| WCAG 2.2 AA target / non-color / focus | axe-core run tagged WCAG 2.x A/AA reports 0 violations in tested state; feedback uses text, focus is visible, core targets are ≥44px in primary controls. | PASS in automated scope; not certification |
| Reduced motion | Browser emulates `prefers-reduced-motion: reduce` and asserts transitions collapse to the reduced duration. | PASS |
| No flashing/autoplay/audio dependency | No flashing, autoplay, audio, or time pressure exists. | PASS by source inspection |
| Free/no login/PII/ads/analytics/tracking/remote grading/API | Static source contains no such service; browser journey succeeds without credentials or external service. | PASS by source/runtime inspection |
| Bundled core assets | Runtime uses local HTML/CSS/JS/JSON only; no external fonts/media/scripts. | PASS |
| Refresh/repeated/invalid state | Refresh persistence asserted; repeated seeded draws supported; empty answer/form states return specific feedback instead of crashing. | PASS by journey/source |
| Architecture note / content separation | README architecture maps state/UI/data/model; calculations are in `src/model.js`, data metadata in JSON. | PASS |
| README + lockfile + exact commands | README includes Node expectation, install/start/test commands, tested browser, deployment, known limitations; `package-lock.json` present. | PASS |
| License/attribution | MIT `LICENSE`; `THIRD_PARTY_NOTICES.md` records test-only Puppeteer/axe licenses and confirms no runtime media/fonts. | PASS |

## Domain test inventory (7)

1. Graph statistics independent of rendering axis.
2. 240-record population and 60/60/60/60 documented block composition.
3. Closing-only sample stays entirely inside biased frame.
4. All-window stratified n=24 includes 6 per equal stratum.
5. Same seed reproduces selected IDs; different seed changes them.
6. Larger n=48 biased sample still excludes three blocks.
7. Correlation construction pins overall r=0.826 and each within-difficulty r=-0.881.

## Browser check inventory (15)

1. Fresh 0/4 state.
2. Axis changes rendering, not values/stats.
3. Graph case keyboard completion + immediate feedback.
4. Sampling composition + nuanced answer.
5. Third-variable/correlation feedback.
6. Final case structure/self-review, no fake prose grading.
7. localStorage persistence after refresh.
8. Reduced-motion behavior.
9. axe-core A/AA scan: zero violations.
10. 1280px no page-level horizontal overflow.
11. 768px no page-level horizontal overflow.
12. 360px no page-level horizontal overflow.
13. 360px simulated touch activates Start + mobile capture.
14. Reset clears local state without reload.
15. No browser console/page errors.

## Numbered screenshot walkthrough

1. `screenshots/01-graph-framing-desktop.png` — Case 01 axis framing, chart, table access, and guided reasoning.
2. `screenshots/02-sampling-desktop.png` — Case 02 method controls and population/sample comparison.
3. `screenshots/03-correlation-desktop.png` — Case 03 stratified scatter investigation and conclusion choices.
4. `screenshots/04-transfer-case-desktop.png` — Fresh BrightByte case file with claim/observation/limitation form and self-review.
5. `screenshots/05-mobile-360.png` — 360px mobile viewport evidence from the sampling portion after simulated touch navigation.

These numbered screenshots satisfy the requested screenshot walkthrough in place of a video.

## Manual/interactive checks and limitations

The final submission run used real installed Chrome controlled through Puppeteer for interaction checks. Keyboard activation, touch input, feedback, reset, persistence, responsive widths, and reduced-motion were directly exercised rather than inferred from source. Touch was **simulated through Chrome's touch-capable mobile emulation**, not a physical phone. No testing with children or disabled participants was conducted. No claim of formal WCAG certification is made.
