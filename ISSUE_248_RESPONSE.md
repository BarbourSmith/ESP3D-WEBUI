# Changes Between v1.12 and v1.13 - Response to Issue #248

## Executive Summary

I've analyzed the complete git history and created comprehensive documentation describing all changes between version 1.12 and version 1.13 of ESP3D-WEBUI.

**Key Findings:**
- **81 commits** separate v1.12 from v1.13
- **28 files changed** with 1,727 additions and 81 deletions
- **5 major features** added
- **30+ bug fixes** implemented
- **Multiple improvements** to calibration, UI, and code quality

## Understanding the Versions

**v1.12** was the last hard-coded version number in the file `www/js/tablet.js` (commit `3d7457a`, October 2, 2025).

**v1.13** is the first official tagged release after switching to automatic git-based versioning (commit `be6c7d6`, October 21, 2025).

## Documentation Created

I've created four comprehensive documents to answer your question:

### 1. 📚 CHANGELOG_v1.12_to_v1.13.md
**Purpose:** Technical changelog for developers  
**Size:** 164 lines, 6.2KB  
**Contains:**
- All 81 commits categorized by type (Features, Bug Fixes, Improvements)
- Detailed descriptions of each change
- Breaking changes analysis (none found)
- Migration notes
- Commit statistics

**Best for:** Developers who need technical details

### 2. 📄 RELEASE_NOTES_v1.13.md
**Purpose:** User-friendly release announcement  
**Size:** 121 lines, 3.1KB  
**Contains:**
- Highlighted new features with emojis
- User-facing improvements
- Upgrade guide
- Statistics by the numbers
- Acknowledgments

**Best for:** Users and release announcements

### 3. 📋 SUMMARY_v1.12_to_v1.13.md
**Purpose:** Quick reference guide  
**Size:** 85 lines, 2.5KB  
**Contains:**
- Top 5 new features
- Notable bug fixes at a glance
- Code statistics
- Quick commands for developers
- Links to detailed docs

**Best for:** Quick answers and issue responses

### 4. 📖 VERSION_DOCS_README.md
**Purpose:** Navigation and context  
**Size:** 105 lines, 2.8KB  
**Contains:**
- Guide to all documentation
- Timeline of versions
- Key changes summary
- How to use each document
- Quick links

**Best for:** Understanding the documentation structure

## Top 5 New Features in v1.13

1. **Bounding Box Visualization** 🎯
   - See job boundaries before cutting
   - "Trace Boundary" button to physically trace the area
   - Accurate calculations for all G-code types

2. **YAML Config File Selector** ⚙️
   - Dropdown to switch between machine configurations
   - No manual editing required
   - Settings saved to flash memory
   - Quick "Restart FluidNC" button

3. **Right-Click Canvas Menu** 🖱️
   - Context menu for quick positioning
   - Click anywhere to move machine
   - Consistent coordinate calculations

4. **Machine State Display** 🚦
   - Color-coded status indicators
   - Shows Idle, Run, Alarm, etc.
   - Clear visual feedback

5. **Automatic Versioning** 🏷️
   - Git-based version numbers
   - No manual updates needed
   - Matches FluidNC format

## Notable Bug Fixes

✅ Fixed G91 relative positioning in G-code viewer  
✅ Fixed arc bounding box calculations  
✅ Fixed multiple Object.keys errors on undefined objects  
✅ Fixed SVG path rendering issues  
✅ Fixed coordinate calculations  
✅ Fixed arrow button sizing  
✅ Fixed config file loading  
✅ Fixed upload progress tracking  
✅ Fixed version numbering in CI/CD  

## Code Changes

- **28 files** modified across the codebase
- **1,727 lines added** (new features and improvements)
- **81 lines removed** (cleanup and optimization)
- **Net gain:** +1,646 lines

**Most changed files:**
1. `www/js/toolpath-displayer.js` - Bounding box & right-click (+373 lines)
2. `www/js/calculatesCalibrationStuff.js` - Better calibration (+229 lines)
3. `www/js/preferencesdlg.js` - YAML selector (+189 lines)
4. New documentation files (+400+ lines)

## Where to Find Details

All documentation is in the repository root:

- `CHANGELOG_v1.12_to_v1.13.md` - Full technical changelog
- `RELEASE_NOTES_v1.13.md` - User-friendly release notes  
- `SUMMARY_v1.12_to_v1.13.md` - Quick reference
- `VERSION_DOCS_README.md` - Documentation guide

## For Git Users

```bash
# View all commits between versions
git log 3d7457a..v1.13

# See what files changed
git diff --stat 3d7457a..v1.13

# View detailed changes
git diff 3d7457a..v1.13
```

## Conclusion

Version 1.13 represents a significant improvement over v1.12 with:
- Major new features for job visualization and configuration management
- Numerous bug fixes for stability
- Better user experience throughout
- Improved calibration algorithms
- No breaking changes - fully backward compatible

The documentation I've created provides multiple views of these changes to serve different audiences - from casual users to core developers.

---

**Issue:** #248  
**Created:** November 5, 2025  
**Documentation by:** GitHub Copilot  
**Repository:** [MaslowCNC/ESP3D-WEBUI](https://github.com/MaslowCNC/ESP3D-WEBUI)
