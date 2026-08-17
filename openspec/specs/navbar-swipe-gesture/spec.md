# navbar-swipe-gesture Specification

## Purpose

TBD - created by archiving change 'mobile-navbar-swipe-tab-switch'. Update Purpose after archive.

## Requirements

### Requirement: Gesture surface activation

The plugin SHALL attach touch listeners only to the Obsidian mobile navigation bar element, and only when the plugin is running on a mobile platform. The plugin SHALL remove every listener it attached when it is unloaded.

#### Scenario: Mobile platform with navigation bar present

- **WHEN** the plugin loads on a mobile platform and the mobile navigation bar element exists
- **THEN** the plugin attaches its touch listeners to that element

#### Scenario: Desktop platform

- **WHEN** the plugin loads on a desktop platform
- **THEN** the plugin attaches no touch listeners and performs no gesture handling

#### Scenario: Navigation bar element missing

- **WHEN** the plugin loads on a mobile platform and the mobile navigation bar element cannot be found
- **THEN** the plugin attaches no touch listeners, raises no error, and emits no user-facing notice

#### Scenario: Listener removal on unload

- **WHEN** the plugin is unloaded
- **THEN** every touch listener the plugin attached is removed from the navigation bar element

---
### Requirement: Horizontal swipe recognition

The gesture layer SHALL emit a direction of `next` or `previous` only when a single-touch interaction on the navigation bar ends with a horizontal displacement magnitude of at least 40 pixels AND a horizontal displacement magnitude strictly greater than the vertical displacement magnitude. In every other case the gesture layer SHALL emit no direction.

Leftward finger movement SHALL emit `next`. Rightward finger movement SHALL emit `previous`. The 40 pixel threshold SHALL be defined as a single named constant so that it can be tuned from one place.

#### Scenario: Leftward swipe past the threshold

- **WHEN** a single touch on the navigation bar ends with a horizontal displacement of -60 pixels and a vertical displacement of 5 pixels
- **THEN** the gesture layer emits direction `next`

#### Scenario: Rightward swipe past the threshold

- **WHEN** a single touch on the navigation bar ends with a horizontal displacement of 60 pixels and a vertical displacement of 5 pixels
- **THEN** the gesture layer emits direction `previous`

#### Scenario: Horizontal displacement below the threshold

- **WHEN** a single touch on the navigation bar ends with a horizontal displacement of -39 pixels and a vertical displacement of 2 pixels
- **THEN** the gesture layer emits no direction

#### Scenario: Vertical displacement dominates

- **WHEN** a single touch on the navigation bar ends with a horizontal displacement of -50 pixels and a vertical displacement of 70 pixels
- **THEN** the gesture layer emits no direction

#### Scenario: Multi-touch interaction

- **WHEN** a touch interaction on the navigation bar involves more than one active touch point
- **THEN** the gesture layer emits no direction

##### Example: threshold and axis boundary cases

| Horizontal delta (px) | Vertical delta (px) | Active touch points | Emitted direction |
| --------------------- | ------------------- | ------------------- | ----------------- |
| -60                   | 5                   | 1                   | next              |
| 60                    | 5                   | 1                   | previous          |
| -40                   | 2                   | 1                   | next              |
| -39                   | 2                   | 1                   | none              |
| -50                   | 70                  | 1                   | none              |
| -60                   | 5                   | 2                   | none              |

---
### Requirement: Navigation bar tap passthrough

The plugin SHALL suppress the default touch behaviour of the navigation bar only when the gesture layer emits a direction. When no direction is emitted, the plugin SHALL leave the interaction untouched so that the existing navigation bar buttons keep their normal behaviour.

#### Scenario: Tap on a navigation bar button

- **WHEN** a touch on the navigation bar ends and the gesture layer emits no direction
- **THEN** the plugin does not suppress the default behaviour and the tapped button performs its normal action

#### Scenario: Recognized swipe on a navigation bar button

- **WHEN** a touch that starts on a navigation bar button ends and the gesture layer emits a direction
- **THEN** the plugin suppresses the default behaviour and the button performs no action
