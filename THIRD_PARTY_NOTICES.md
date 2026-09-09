# Third-Party Notices

## Runtime

No third-party JavaScript, fonts, images, audio, icons, analytics, APIs, or hosted assets are loaded by the learner experience. All learner-facing copy, SVG charts, data, styling, and code are original to this submission.

## Development/test dependencies

These packages are used only by the local test harness and are pinned by `package-lock.json`:

- **puppeteer-core 25.10.0** — Apache-2.0 license. Used to exercise the installed Chrome and capture evidence screenshots. Project: https://pptr.dev/
- **axe-core 4.13.0** — Mozilla Public License 2.0. Used for automated accessibility checks. Project: https://github.com/dequelabs/axe-core

Their license texts remain available from their upstream projects and installed packages. No code from these dependencies is copied into the learner-facing source.
