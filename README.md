# Tab Swipe

Swipe left or right on the Obsidian mobile navigation bar to switch between open tabs.

Switching tabs on mobile normally takes three actions: tap the tab-count button, wait for the list, pick the target. This plugin makes it one gesture on a strip your thumb already rests on.

[繁體中文說明](README.zh-TW.md)

## How it works

Swipe horizontally on the bottom navigation bar:

- **Swipe left** → the tab to the right
- **Swipe right** → the tab to the left

The order wraps at both ends, so with two or three tabs open any tab is one swipe away.

Taps are untouched. A touch only counts as a swipe when it moves at least 40 px horizontally *and* moves further horizontally than vertically. Everything below that threshold passes straight through, so the navigation bar buttons keep working exactly as before.

A row of dots sits at the lower edge of the navigation bar: one dot per open tab, with the current one highlighted. It stays there, so you can see where you are at a glance rather than only in the moment after a swipe — which matters because the order wraps.

The dots track the workspace, not this plugin. Switch tabs from Obsidian's own tab list, follow a link into a new tab, or close one, and the dots follow. They hide themselves when fewer than two tabs are open, since a lone dot says nothing.

Desktop is unaffected — the plugin registers nothing there.

## Install

Not in the community plugin browser yet. Install with [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1. Install and enable BRAT from Settings → Community plugins.
2. In BRAT settings, choose **Add Beta plugin**.
3. Paste `vizance/obsidian-tab-swipe` and confirm.
4. Enable **Tab Swipe** in Settings → Community plugins.

Manual install: download `main.js`, `manifest.json` and `styles.css` from [Releases](https://github.com/vizance/obsidian-tab-swipe/releases) into `.obsidian/plugins/obsidian-tab-swipe/`.

## Known limitations

**It hooks Obsidian's internal navigation bar.** The gesture area is found through the `.mobile-navbar` CSS class, which is Obsidian's internal DOM rather than a documented API. If a future Obsidian release renames it, this plugin stops working. It fails silently by design: no error, no notice, the navigation bar simply behaves as it always did. The selector lives in one constant, so fixing it is a one-line change.

**Split panes are treated as one flat list.** Tab order comes from Obsidian's main-area leaf iteration. If you split the root workspace into panes holding A, B and C, D, swiping forward from B moves to C — the order is the flat sequence A, B, C, D with no grouping by pane. Sidebar notes are never part of the cycle.

**No settings.** The 40 px threshold is a constant. If it does not suit your thumb, change `SWIPE_THRESHOLD_PX` in `src/gesture/navbar-swipe.ts` and rebuild.

## Restyling the indicator

Every selector is namespaced with a `tab-swipe` prefix, so a CSS snippet can override the dots without touching the plugin:

```css
.tab-swipe-indicator { gap: 10px; bottom: 4px; }
.tab-swipe-indicator__dot { width: 6px; height: 6px; }
.tab-swipe-indicator__dot.is-current { background-color: var(--color-orange); }
```

## Development

```sh
npm install
npm run dev    # watch mode
npm run build  # type-check, then bundle to main.js
npm test       # vitest
```

The gesture layer (`src/gesture/`) has no Obsidian imports at all — it turns touch coordinates into a direction and nothing else. The cycling layer (`src/tabs/`) receives a direction and never learns a gesture produced it. Both are unit tested without an Obsidian runtime; a guard test fails if that boundary is ever crossed.

## License

[MIT](LICENSE)
