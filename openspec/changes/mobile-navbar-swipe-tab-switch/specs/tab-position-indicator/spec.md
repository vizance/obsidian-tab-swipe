## ADDED Requirements

### Requirement: Position indicator on a completed switch

The plugin SHALL show a row of position dots at the lower edge of the mobile navigation bar whenever a swipe completes a tab switch. The row SHALL contain exactly one dot per open tab, and the dot at the newly active position SHALL be marked as current while every other dot SHALL be marked as inactive.

#### Scenario: Switching among three tabs

- **WHEN** three tabs are open and a swipe activates the second tab
- **THEN** the indicator shows three dots and the second dot is marked as current

#### Scenario: Wrapping to the first tab

- **WHEN** three tabs are open, the third tab is active, and a swipe forward wraps to the first tab
- **THEN** the indicator shows three dots and the first dot is marked as current

##### Example: dot row contents

| Open tabs | Newly active position | Dot count | Current dot |
| --------- | --------------------- | --------- | ----------- |
| 3         | 2                     | 3         | 2           |
| 3         | 1                     | 3         | 1           |
| 2         | 2                     | 2         | 2           |
| 5         | 4                     | 5         | 4           |

### Requirement: Indicator fades out on its own

The indicator SHALL disappear 300 milliseconds after the switch without any user action. A further switch during that window SHALL reuse the existing indicator element and restart the timer rather than adding a second element.

#### Scenario: Indicator disappears after the delay

- **WHEN** a swipe completes a tab switch and 300 milliseconds pass with no further swipe
- **THEN** the indicator is no longer visible

#### Scenario: Two swipes in quick succession

- **WHEN** a second swipe completes 100 milliseconds after the first
- **THEN** exactly one indicator element exists, its dots reflect the second switch, and the fade-out timer restarts from the second switch

### Requirement: No indicator when no switch happened

The plugin SHALL NOT create or show the indicator when a swipe produced no tab change.

#### Scenario: Swipe with a single tab open

- **WHEN** one tab is open and a swipe is recognized
- **THEN** no indicator element is created and nothing appears on screen

#### Scenario: Swipe while focus sits outside the main area

- **WHEN** focus sits in a sidebar so no tab change occurs and a swipe is recognized
- **THEN** no indicator element is created

### Requirement: Indicator placement and cleanup

The indicator SHALL be a single container element owned by the plugin, placed within the bounds of the navigation bar at its lower edge so that it never overlaps the operating system home indicator. The plugin SHALL use its own class prefix for the container and the dots so that theme styles do not collide with it. On unload the plugin SHALL remove the container and cancel any pending fade-out timer.

#### Scenario: Container is reused across switches

- **WHEN** three separate swipes each complete a tab switch
- **THEN** exactly one indicator container has been created and it was updated in place each time

#### Scenario: Cleanup on unload

- **WHEN** the plugin is unloaded after at least one switch
- **THEN** the indicator container is removed from the navigation bar and no fade-out timer remains pending
