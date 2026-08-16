## ADDED Requirements

### Requirement: Neighbour tab selection

The tab cycling layer SHALL determine the target tab from the root workspace tab order together with the currently active tab. Direction `next` SHALL select the tab at the following position in that order. Direction `previous` SHALL select the tab at the preceding position. The layer SHALL then make the selected tab the active tab and return it.

#### Scenario: Moving to the next tab from the middle

- **WHEN** three tabs are open in the order A, B, C, the active tab is B, and direction `next` is received
- **THEN** C becomes the active tab and C is returned

#### Scenario: Moving to the previous tab from the middle

- **WHEN** three tabs are open in the order A, B, C, the active tab is B, and direction `previous` is received
- **THEN** A becomes the active tab and A is returned

##### Example: three-tab traversal

| Tab order | Active tab | Direction | Resulting active tab |
| --------- | ---------- | --------- | -------------------- |
| A, B, C   | A          | next      | B                    |
| A, B, C   | B          | next      | C                    |
| A, B, C   | C          | previous  | B                    |
| A, B, C   | B          | previous  | A                    |

### Requirement: Wrap-around at both ends

The tab cycling layer SHALL wrap around when the target position falls outside the tab order. Direction `next` from the last tab SHALL select the first tab. Direction `previous` from the first tab SHALL select the last tab.

#### Scenario: Next from the last tab

- **WHEN** three tabs are open in the order A, B, C, the active tab is C, and direction `next` is received
- **THEN** A becomes the active tab and A is returned

#### Scenario: Previous from the first tab

- **WHEN** three tabs are open in the order A, B, C, the active tab is A, and direction `previous` is received
- **THEN** C becomes the active tab and C is returned

##### Example: wrap-around boundaries

| Tab order | Active tab | Direction | Resulting active tab |
| --------- | ---------- | --------- | -------------------- |
| A, B, C   | C          | next      | A                    |
| A, B, C   | A          | previous  | C                    |
| A, B      | B          | next      | A                    |
| A, B      | A          | previous  | B                    |

### Requirement: No action with fewer than two tabs

The tab cycling layer SHALL make no change and SHALL return an empty result when the root workspace contains fewer than two tabs, regardless of the direction received.

#### Scenario: Exactly one tab is open

- **WHEN** one tab is open, that tab is active, and any direction is received
- **THEN** the active tab is unchanged and an empty result is returned

#### Scenario: No tab is open

- **WHEN** no tab is open and any direction is received
- **THEN** no tab is activated and an empty result is returned

### Requirement: Tab order source and split view limitation

The tab order SHALL be derived from the leaves of the root workspace in their existing iteration order. Leaves belonging to the left or right sidebar SHALL be excluded from the order. When the root workspace is arranged into split panes, the order SHALL follow that same flat iteration order without additional grouping by pane. This flat ordering is a documented limitation of this version and SHALL be stated in the project README.

#### Scenario: Sidebar leaves are excluded

- **WHEN** two tabs are open in the root workspace and one note is open in a sidebar
- **THEN** the tab order contains exactly the two root workspace tabs and cycling never activates the sidebar leaf

#### Scenario: Root workspace arranged into split panes

- **WHEN** the root workspace is split into two panes holding tabs A, B and tabs C, D, the active tab is B, and direction `next` is received
- **THEN** C becomes the active tab, because the order is the flat sequence A, B, C, D
