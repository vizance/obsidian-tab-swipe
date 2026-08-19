# AGENTS.md

Guidance for coding agents working on Tab Swipe, an Obsidian plugin that switches tabs by swiping the mobile navigation bar.

## Project overview

- TypeScript, bundled with esbuild into `main.js`, which is published as a release asset for BRAT together with `manifest.json` and `styles.css`. `main.js` is deliberately **not** tracked in git — BRAT reads releases, so the build output does not belong in version control.
- `src/gesture/` decides what counts as a swipe, `src/tabs/` cycles the tabs, `src/plugin/` binds to the navigation bar and keeps the indicator in sync, `src/ui/` draws the dots.
- Specifications live in `openspec/specs/`, change proposals in `openspec/changes/`. This repository is developed spec-first with Spectra; see [CLAUDE.md](CLAUDE.md).

## Setup and commands

```bash
npm install
npm test          # vitest, must stay green
npm run build     # type-check, then bundle to main.js
```

There is no lint script yet. If one is added, use the Obsidian eslint plugin, as the sibling plugin repository does.

## Code style

- Tabs for indentation, single quotes, semicolons.
- Keep gesture thresholds and tab arithmetic in modules that import nothing from Obsidian, so they stay unit-testable; the plugin layer only wires them up.
- Never set styles inline (`element.style.foo = ...`). Add a class in `styles.css` instead, so themes can override it.
- The plugin registers nothing on desktop. Keep it that way — guard mobile-only behaviour at registration, not inside handlers.

## Testing instructions

- Every behaviour change needs a test. Gesture rules especially: a tap must never become a swipe, so threshold changes need a case for the boundary.
- Automated tests cannot reproduce a real thumb, the iOS keyboard, or third-party themes. Ask for device verification rather than claiming it works.

## Security and privacy

This repository is public and its releases install into other people's vaults. Before pushing, and again before each release:

- No paths from the author's private workspace anywhere in the tree, including generated blocks in specs: `grep -rn "300_專案\|200_Reference\|000_Agent\|chi_agent\|Obsidian Vault" . --exclude-dir=node_modules --exclude-dir=.git`
- No credentials: `grep -rniE "api[_-]?key|secret|token|password|ghp_" . --exclude-dir=node_modules --exclude=package-lock.json`
- The esbuild banner and any generated comment may name only the public repository URL, never a local path — that line ships inside `main.js`.
- Remove debugging probes and console logging before release.

## Release instructions

- Keep `manifest.json`, `package.json`, `package-lock.json`, and `versions.json` on the same version.
- Tags carry no `v` prefix.
- Attach exactly `main.js`, `manifest.json`, and `styles.css` to the GitHub release. `main.js` is not in git, so build it first.
- Release notes are written in English first, then Traditional Chinese, and explain the cause of a fix rather than only the fix.
