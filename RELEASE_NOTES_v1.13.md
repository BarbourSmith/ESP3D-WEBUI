# Release Notes - ESP3D-WEBUI v1.13

**Release Date:** October 21, 2025  
**Tag:** v1.13  
**Previous Version:** 1.12

---

## 🎉 What's New in v1.13

### Major Features

#### Bounding Box & Job Preview
- Visualize G-code job boundaries before cutting
- New "Trace Boundary" button to physically trace cut area
- Accurate bounding box calculations for all G-code types

#### Configuration Management
- YAML config file selector in preferences
- Quick restart FluidNC button
- Dynamic config switching without manual edits
- Persistent config settings saved to flash

#### Enhanced User Interface
- Right-click context menu for quick positioning on canvas
- Color-coded machine state indicators (Idle, Run, Alarm)
- Improved button layouts and consistent styling
- Better visual feedback throughout the UI

#### Automatic Versioning
- Version numbers now auto-generated from git tags
- No more manual version updates needed
- Consistent versioning across builds

### Improvements

#### Calibration
- Better initial guess for rectangular calibration
- Optimized calibration algorithms
- Faster, more accurate calibration results

#### Upload & File Handling
- Progress indicators for file uploads
- Better logging for debugging
- Improved ping management during operations
- Prevented timeouts during large file operations

#### Jogging & Movement
- Unit synchronization for safe jogging
- Better decimal precision in movements
- Improved coordinate handling

### Bug Fixes

✅ Fixed G91 relative positioning in viewer  
✅ Fixed arc bounding box calculations  
✅ Fixed multiple Object.keys errors on undefined objects  
✅ Fixed SVG path rendering issues  
✅ Fixed coordinate calculations in context menu  
✅ Fixed arrow button sizing inconsistencies  
✅ Fixed config file loading and switching  
✅ Fixed upload logging and delete operations  
✅ Fixed version numbering in CI/CD builds  

### Code Quality

- Added JSHint configuration for modern JavaScript
- Comprehensive development documentation
- Better error handling throughout
- Eliminated linting warnings

---

## 📊 By the Numbers

- **81 commits** between v1.12 and v1.13
- **15+ pull requests** merged
- **38 bug fixes** and improvements
- **5 major features** added

---

## 🔄 Upgrade Guide

**No breaking changes!** Simply update to v1.13:

1. Download the latest `index.html.gz` from the releases page
2. Upload to your ESP32 device
3. Refresh your browser
4. Enjoy new features!

All previous configurations and settings are preserved.

---

## 📝 Detailed Changelog

For a comprehensive list of all changes, see [CHANGELOG_v1.12_to_v1.13.md](./CHANGELOG_v1.12_to_v1.13.md)

---

## 🙏 Acknowledgments

Thanks to all contributors who made this release possible:
- @BarbourSmith
- MaslowCNC team
- Community testers and bug reporters

---

## 🐛 Reporting Issues

Found a bug? Please report it on our [GitHub Issues](https://github.com/MaslowCNC/ESP3D-WEBUI/issues) page.

---

## 📚 Resources

- [Compilation Guide](./COMPILATION.md)
- [Local Testing Guide](./HOWTO-Test-Locally.md)
- [GitHub Repository](https://github.com/MaslowCNC/ESP3D-WEBUI)
