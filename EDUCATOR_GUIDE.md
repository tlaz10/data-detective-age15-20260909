# Educator Guide — Signal & Story: Data Detective

## Audience and session shape

Designed for learners around age 15 as a focused **10–15 minute** investigation. The interface uses a fictional newsroom/data-detective framing without childish rewards, ranking, shame, or blanket “never trust graphs” messaging.

### Prerequisites

Learners should be able to read labeled axes and interpret a simple average. No prior statistics course, account, personal information, or external website use is required.

### Learning objectives

By the end of the session, a learner should be able to:

1. Explain how graph presentation—especially a vertical-axis range—can change perceived effect size without changing the underlying values.
2. Identify a sampling-frame limitation and explain why a larger sample drawn from the same biased frame need not repair the problem.
3. Distinguish association from causal evidence and use stratification to inspect a plausible third-variable explanation.
4. Assemble a cautious conclusion containing a claim, a supporting observation, and a limitation.
5. Scrutinize evidence proportionately rather than treating every non-zero axis, sample, or correlation as deceptive.

The project makes no claim that completing the activity causes or validates learning gains.

## Walkthrough

### Demonstration / Case 01 — Graph framing (about 2–3 min)

The learner sees the six-value fictional Nova Arcade wait-time series and moves the vertical-axis minimum from 0 toward 70 seconds. The SVG redraws, but the table, mean (77.8 s), range (74–82 s), and first-to-last change (-8 s) remain fixed.

Prompt: *What did the slider change?* Immediate feedback distinguishes visual emphasis from changed data and explicitly rejects the simplistic rule that every non-zero axis is deceptive. A hint directs the learner to compare the table and fixed numeric summary.

### Guided practice / Case 02 — Sampling (about 3–4 min)

The documented synthetic population has 240 visit records: 60 in each of four time blocks. The learner can change sample size, draw repeatedly with visible deterministic seeds, and switch between:

- **Closing-hour intercept:** randomly samples only the 60 closing-hour records. It is plausibly biased for a whole-day claim because three blocks have zero chance of selection.
- **All-window stratified:** randomly samples within every block; because the synthetic population has equal-sized blocks, it draws equal counts from each.

The composition table and grouped bars compare population vs current sample. The guided question asks whether increasing a closing-hour sample from 12 to 48 fixes the coverage problem. Both the direct “No” and the nuance “only if added records come from missing blocks” receive appropriate feedback.

### Guided practice / Case 03 — Correlation (about 3–4 min)

The fictional Skyline Puzzle League data initially show a strong positive overall association between hints used and completion time (r = 0.826). The learner toggles comparison by puzzle difficulty. Easy, Medium, and Hard strata each have r = -0.881 in this intentionally constructed teaching dataset.

The point is not that stratification proves the opposite cause. It shows a plausible third-variable explanation: harder puzzles were constructed to take longer and to receive more hints. Feedback states explicitly that **association alone does not establish causation** and that observational stratification still does not prove the effect of changing hint use.

### Fresh application / Case 04 — Case file (about 3–4 min)

The learner evaluates a new fictional BrightByte Games headline combining three issues: a narrow graph axis, a tournament-final-only sampling frame, and session count as a plausible third variable.

The learner writes:

- a cautious claim,
- a supporting observation,
- a limitation,
- and tags at least two evidence issues used.

There is deliberately **no semantic prose grader**. The app checks only whether the three written parts are present and at least two issue tags are selected, then opens a self-review checklist and a defensible exemplar. Nuanced wording can differ from the exemplar.

## Evidence notebook, progress, and reset

Correct/good-faith completion of each case records a concise observation in the Evidence Notebook. Progress is shown as 0–4 cases. State, notebook entries, and the learner's final draft are stored only in browser `localStorage`; the interface explains this. **Reset lesson** and **Erase local progress** clear stored state and reset controls without a page reload. Replay navigation remains available after completion.

## Adaptations and co-play

- **More support:** open the hint before answering; read the accessible table before the chart; ask the learner to name “what changed” and “what stayed fixed” aloud.
- **More challenge:** ask for two different defensible limitations in the final case or ask when a non-zero axis might be useful rather than misleading.
- **Language/reading support:** an adult can read concise copy aloud and pause on the data tables. The core tasks do not depend on drag gestures, color naming, audio, or rapid timing.
- **Keyboard/motor support:** every core control has a semantic keyboard-operated alternative; charts have data tables and sampling uses buttons/range/radio controls rather than drag-only mechanics.
- **Co-play:** one learner can operate controls while another acts as editor, requiring the editor to ask “claim, observation, limitation?” before accepting a headline.
- **Reduced motion:** the page respects the browser/OS `prefers-reduced-motion` preference.

## Adult-facing content sources

These sources support the statistical ideas used in the lesson. They are listed here for educators rather than presented as a learner outbound-link maze.

1. **American Association for Public Opinion Research (AAPOR), “Best Practices for Survey Research”**  
   https://aapor.org/standards-and-ethics/best-practices/  
   Supports the sampling activity's distinction between a population, sampling frame, and sample, and the need to design a frame that represents the population under study. The page also stresses that survey quality is not judged simply by size. Verified accessible September 9, 2026.

2. **NIST/SEMATECH e-Handbook of Statistical Methods, “1.3.3.26. Scatter Plot”**  
   https://www.itl.nist.gov/div898/handbook/eda/section3/eda33q.htm  
   Supports using scatter plots to inspect relationships and conditioning/subset plots to inspect a third variable. NIST explicitly states that association does not imply causality and that a scatter plot cannot prove cause and effect. Verified accessible September 9, 2026.

The graph-framing activity is an original constructed demonstration: its critical invariant is directly testable in the app—the axis mapping changes while the data table and numerical summaries remain unchanged. The lesson deliberately avoids teaching “non-zero axis = deception.”

## Model and content limitations

- All records are synthetic and intentionally constructed to make specific statistical distinctions visible in a short session. They are not estimates of any real phenomenon.
- Pearson r is shown as a descriptive teaching aid. The activity does not introduce inferential tests, uncertainty intervals, experimental design, or generalization beyond the synthetic records.
- The “less biased” sampling method is less biased **for this documented equal-strata synthetic population**; the activity does not claim stratification is universally best.
- Final free text is not machine-interpreted. Structural completion plus self-review avoids false claims of prose understanding.
- Automated accessibility testing helps catch issues but is not equivalent to evaluation by disabled users or formal WCAG certification.
- No testing with children was conducted for this bounty.

## Offline/no-device follow-up

Print or copy a small table of 6–10 values. Ask learners to sketch the same values twice using two reasonable vertical-axis ranges, then annotate what changed visually and what did not. Next, give four index cards labeled with sampling frames (for example, “only final-period attendees” vs “records from every time block”) and have learners rank which claims each frame can reasonably support. Finish by rewriting a causal-sounding headline into a cautious association statement that names one possible third variable.
