# Summary of Changes: v1.12 to v1.13

## Quick Overview

Version 1.13 represents 81 commits of improvements, new features, and bug fixes over version 1.12.

**Key Highlights:**

### 🎯 Top 5 New Features

1. **Bounding Box Visualization** - See and trace your job boundaries before cutting
2. **YAML Config Selector** - Switch between machine configurations easily
3. **Right-Click Canvas Menu** - Quick positioning with context menu
4. **Machine State Display** - Color-coded status indicators
5. **Automatic Versioning** - Git-based version numbers

### 🐛 Notable Bug Fixes

- Fixed G91 relative positioning in G-code viewer
- Fixed arc bounding box calculations
- Fixed multiple undefined object errors
- Fixed upload progress tracking
- Fixed coordinate calculations

### 📈 Improvements

- Better calibration initial guesses
- Unit synchronization for safe jogging
- Improved error handling
- Better documentation
- Code quality improvements

## Documents Created

Three comprehensive documents detail all changes:

1. **CHANGELOG_v1.12_to_v1.13.md** - Complete technical changelog with all 81 commits categorized
2. **RELEASE_NOTES_v1.13.md** - User-friendly release notes highlighting major features
3. **SUMMARY_v1.12_to_v1.13.md** - This quick reference guide

## Version Reference

- **v1.12**: Last hard-coded version (commit `3d7457a`, October 2, 2025)
- **v1.13**: Git-tagged release (commit `be6c7d6`, October 21, 2025)

## Code Statistics

- **Files changed**: 28 files
- **Lines added**: 1,727
- **Lines removed**: 81
- **Net change**: +1,646 lines

Major files modified:
- `www/js/toolpath-displayer.js` - Added bounding box and right-click functionality (+373 lines)
- `www/js/calculatesCalibrationStuff.js` - Improved calibration algorithms (+229 lines)
- `www/js/preferencesdlg.js` - Added YAML selector and config management (+189 lines)
- `VERSION-FIX-EXPLANATION.md` - New documentation for version system (+128 lines)
- `COMPILATION.md` - New comprehensive build guide (+121 lines)

## For Developers

```bash
# View all commits
git log 3d7457a..v1.13

# View detailed diff
git diff 3d7457a..v1.13

# View changed files
git diff --name-status 3d7457a..v1.13
```

## For Users

Simply update to v1.13 and enjoy:
- Better visualization tools
- Easier configuration management
- More reliable operation
- Improved user experience

No configuration changes required - all settings migrate automatically!

---

**Questions?** See the detailed documents or open an issue on GitHub.
