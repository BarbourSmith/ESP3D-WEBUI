# Release Notes - Version 1.15

## Release Date
November 19, 2025

## Overview
Version 1.15 is a maintenance release that removes unnecessary version compatibility checking logic, streamlining the user experience and reducing the application's footprint.

## Changes Since Version 1.14

### 🐛 Bug Fixes

#### Removed Version Compatibility Check (#263)
- **PR**: [#263 - Remove version compatibility check entirely](https://github.com/MaslowCNC/ESP3D-WEBUI/pull/263)
- **Fixes**: Issue #262
- **Impact**: Improves user experience by removing redundant version checking

**What Changed:**
- Removed automatic version compatibility check on page load
- Eliminated popup warning dialogs for version mismatches
- Removed `checkVersionCompatibility()` function call from connection success handler
- Removed `checkVersionCompatibility()`, `extractVersionInfo()`, and `areVersionsCompatible()` helper functions from `www/js/connectdlg.js`
- Test button functionality remains unchanged (displays version information as before)

**Benefits:**
- **Cleaner User Experience**: No more intrusive popup dialogs on page load
- **Reduced Build Size**: From 131.40 kB to 130.74 kB (saved ~0.7 kB or 0.5%)
- **Simplified Codebase**: Removed 179 lines of redundant code
- **Streamlined Output**: Version numbers are still displayed but without unnecessary warnings

**Technical Details:**
- The application already displays version information through existing mechanisms, making the separate version compatibility check redundant
- Test button now only prints the `Index.html Version: [version]` as originally designed
- No breaking changes to existing functionality

## Files Modified
- `www/js/connectdlg.js` - Removed version checking functions (179 lines deleted)

## Migration Notes
No migration required. This is a backward-compatible change that only removes functionality. Users will notice:
- No more version compatibility popup on page load
- No version warnings in console or Serial Messages area
- Version information still available through Test button

## Upgrade Instructions
Simply replace the existing `index.html.gz` file with the new version. No configuration changes required.

## Known Issues
None

## Contributors
- @Copilot (GitHub Copilot)
- @BarbourSmith

---

## Previous Release - Version 1.14
Released: November 7, 2025

For changes in version 1.14 and earlier, please see the [git commit history](https://github.com/MaslowCNC/ESP3D-WEBUI/commits/v1.14).
