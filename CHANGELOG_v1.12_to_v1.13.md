# Changelog: v1.12 to v1.13

This document describes all changes made between version 1.12 and version 1.13 of ESP3D-WEBUI.

**Note:** Version 1.12 was the last hard-coded version number before the project switched to using `git describe` for automatic version numbering starting with commit 929aca2.

## Release Information
- **Version 1.12**: Last commit with hard-coded version (3d7457a)
- **Version 1.13**: Tagged release (be6c7d6, October 21, 2025)
- **Total commits**: 81 changes

---

## Major Features

### 1. Bounding Box and Job Visualization
- **Implemented bounding box feature** with visual display and trace functionality
- Displays the boundaries of loaded G-code jobs on the canvas
- Added "Trace Boundary" button to physically trace the job boundaries before cutting
- Fixed arc bounding box calculation to use world coordinates for accurate job bounds
- Excluded G0 rapid moves from job bounding box calculation for more accurate cutting area

### 2. Configuration File Management
- **Added YAML file selector dropdown** in preferences dialog
- Moved config filename to new "Frame definition" section at top of preferences
- Implemented dynamic config file switching with FluidNC setting updates
- Save Config/Filename setting to flash memory with $SS command
- Added "Restart FluidNC" button next to config filename in preferences
- Improved config file loading with proper wait for settings reload

### 3. Right-Click Context Menu
- **Added right-click move functionality** to G-code canvas
- Implemented context menu for quick positioning
- Fixed coordinate calculation to be consistent across all canvas views
- Allows users to right-click anywhere on canvas to move the machine to that position

### 4. Machine State Display
- **Added state info display** on Maslow tab above arrow buttons
- Implemented color-coded backgrounds for different machine states (Idle, Run, Alarm, etc.)
- Provides clear visual feedback about current machine status

### 5. Version Management System
- **Replaced hard-coded version** in tablet.js with automatic git describe version
- Fixed version numbering in shallow clones by fetching tags and unshallowing
- Added comprehensive explanation of version numbering fix
- Version now automatically reflects git repository state (e.g., "v1.13-5-g3d7457a")

---

## Bug Fixes

### G-Code Viewer & Processing
- Fixed G91 relative positioning in G-code viewer - updated movement functions
- Fixed coordinate calculation for context menu - now consistent across all views
- Fixed arc bounding box calculation to use world coordinates for job bounds

### UI Stability & Error Handling
- Fixed Object.keys error on undefined preferences list
- Fixed Object.keys error with calibrationResults during calibration
- Fixed SVG path error by handling undefined icon names
- Fixed undefined language property error in applypreferenceslist
- Prevented 404 errors by checking file existence before loading
- Fixed JSHint linting errors: missing semicolon and trailing comma

### Upload & File Operations
- Fixed upload logging and added delete operation ping disable
- Added upload progress logging to Serial Messages
- Added ping disable during GCode preview loading
- Implemented ping monitoring disable during uploads

### UI Layout & Styling
- Fixed arrow button sizing consistency in Maslow tab
- Removed extra whitespace from state indicator and Upload/Delete GCode buttons
- Removed padding/margin from state indicator
- Removed blue background from Trace Boundary button to match other button styling
- Matched Trace Boundary button styling with other buttons in the same row
- Fixed aspect ratio for controls area

### Jogging & Movement
- Fixed decimal precision in unit conversion and improved jog logging
- Implemented units synchronization for safe jogging operations
- Simplified jogWithUnitsSafeguard to eliminate callback parsing issues

### Build & CI/CD
- Fixed MaslowBot build detection to match exact triggers
- Fixed version numbering in shallow clones by fetching tags and unshallowing

---

## Improvements

### Calibration System
- Added improved rectangular approximation initial guess system
- Improved conditional for rectangular optimization during calibration
- Better starting points for calibration process

### Code Quality
- Added .jshintrc to configure ES6 support and eliminate linting warnings
- Added comprehensive compilation and development documentation
- Improved error handling throughout the application

### User Experience
- Changed button to "Save and Restart" with integrated save functionality
- Wait for settings reload before closing preferences dialog
- Config file switching now properly updates FluidNC setting when changed

### Documentation
- Added comprehensive compilation and development documentation
- Discouraged local testing and emphasized hardware testing for reliability
- Added comprehensive explanation of version numbering fix

---

## Development & Infrastructure

### Build System
- Added .jshintrc configuration for ES6/ES8 support
- Configured JSHint to eliminate false-positive linting warnings
- Improved build process reliability

### Documentation
- Created comprehensive compilation and development documentation
- Added guidelines for testing on hardware vs. local simulation
- Documented version numbering system change

---

## Commit Statistics

- **Total commits between v1.12 and v1.13**: 81
- **Date range**: October 2025 to October 21, 2025
- **Major pull requests merged**: 15+
- **Key contributors**: BarbourSmith, MaslowCNC, copilot-swe-agent

---

## Breaking Changes

None. This release maintains backward compatibility with v1.12.

---

## Migration Notes

If upgrading from v1.12:
1. The version number is now automatically generated from git - no manual updates needed
2. New YAML config file selector requires no user action but provides new functionality
3. All bug fixes and improvements are automatically applied
4. No configuration file changes required

---

## Known Issues

None specific to v1.13. See GitHub issues for any ongoing items.

---

For more detailed information about specific commits, see:
```bash
git log 3d7457a..v1.13
```

Where `3d7457a` represents the last commit with v1.12 hard-coded version.
