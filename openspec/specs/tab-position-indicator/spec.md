# tab-position-indicator Specification

## Purpose

TBD - created by archiving change 'mobile-navbar-swipe-tab-switch'. Update Purpose after archive.

## Requirements

### Requirement: Indicator reflects the active tab

The plugin SHALL show a row of position dots at the lower edge of the mobile navigation bar. The row SHALL contain exactly one dot per open tab, and the dot at the active position SHALL be marked as current while every other dot SHALL be marked as inactive.

#### Scenario: Three tabs with the second active

- **WHEN** three tabs are open and the second tab is active
- **THEN** the indicator shows three dots and the second dot is marked as current

#### Scenario: Wrapping to the first tab

- **WHEN** three tabs are open, the third tab is active, and a swipe forward wraps to the first tab
- **THEN** the indicator shows three dots and the first dot is marked as current

##### Example: dot row contents

| Open tabs | Active position | Dot count | Current dot |
| --------- | --------------- | --------- | ----------- |
| 3         | 2               | 3         | 2           |
| 3         | 1               | 3         | 1           |
| 2         | 2               | 2         | 2           |
| 5         | 4               | 5         | 4           |

---
### Requirement: Indicator stays visible

The indicator SHALL remain on screen for as long as at least two tabs are open. It SHALL NOT fade out, and it SHALL NOT require any user action to appear.

#### Scenario: Indicator is present without any gesture

- **WHEN** the plugin finishes loading on a mobile platform with three tabs open
- **THEN** the indicator is already visible and marks the active tab

#### Scenario: Indicator persists long after a switch

- **WHEN** a swipe switches tabs and one minute passes with no further interaction
- **THEN** the indicator is still visible and still marks the active tab

---
### Requirement: Indicator hidden when fewer than two tabs are open

The indicator SHALL be hidden when fewer than two tabs are open, because a single dot carries no information. It SHALL reappear as soon as a second tab is opened.

#### Scenario: Only one tab open

- **WHEN** exactly one tab is open
- **THEN** no dots are visible

#### Scenario: Second tab opened

- **WHEN** one tab is open and the user opens a second tab
- **THEN** two dots become visible and the dot for the newly active tab is marked as current

---
### Requirement: Indicator stays in sync with tab changes from any source

The indicator SHALL derive its contents from the current workspace tab state, and SHALL update whenever that state changes, regardless of what caused the change. Swiping SHALL NOT be treated as a special case.

#### Scenario: Tab changed from the built-in tab list

- **WHEN** the user switches tabs by opening Obsidian's own tab list instead of swiping
- **THEN** the indicator marks the newly active tab

#### Scenario: Tab closed

- **WHEN** three tabs are open and the user closes one of them
- **THEN** the indicator shows two dots and marks whichever tab is now active

#### Scenario: New tab opened

- **WHEN** two tabs are open and the user opens a note in a new tab
- **THEN** the indicator shows three dots and marks the newly opened tab

#### Scenario: Focus moves outside the main area

- **WHEN** focus moves to a sidebar so no main-area tab is active
- **THEN** the indicator keeps the contents it last showed rather than clearing or marking an arbitrary dot

---
### Requirement: Indicator placement and cleanup

The indicator SHALL be a single container element owned by the plugin, placed within the bounds of the navigation bar at its lower edge so that it never overlaps the operating system home indicator. The plugin SHALL use its own class prefix for the container and the dots so that theme styles do not collide with it. On unload the plugin SHALL remove the container and release its subscriptions to workspace events.

#### Scenario: Container is reused across updates

- **WHEN** the tab state changes three times
- **THEN** exactly one indicator container has been created and it was updated in place each time

#### Scenario: Cleanup on unload

- **WHEN** the plugin is unloaded
- **THEN** the indicator container is removed from the navigation bar and the navigation bar carries none of the plugin's classes
