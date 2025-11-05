# Version History Documentation

This directory contains comprehensive documentation about version changes in ESP3D-WEBUI.

## Available Documents

### For Users

📄 **[RELEASE_NOTES_v1.13.md](./RELEASE_NOTES_v1.13.md)**
- User-friendly overview of what's new in v1.13
- Highlighted features and improvements
- Upgrade guide
- Perfect for release announcements

📋 **[SUMMARY_v1.12_to_v1.13.md](./SUMMARY_v1.12_to_v1.13.md)**
- Quick reference guide
- Top 5 features at a glance
- Code statistics
- Both user and developer friendly

### For Developers

📚 **[CHANGELOG_v1.12_to_v1.13.md](./CHANGELOG_v1.12_to_v1.13.md)**
- Complete technical changelog
- All 81 commits categorized by type
- Detailed descriptions of changes
- Breaking changes and migration notes

## Version Information

### What is v1.12 and v1.13?

- **v1.12**: The last version with a hard-coded version number in `www/js/tablet.js` (commit `3d7457a`)
- **v1.13**: The first official tagged release after switching to automatic git-based versioning (commit `be6c7d6`)

### Timeline

- **October 2, 2025**: v1.12 era ended, switched to automatic versioning
- **October 21, 2025**: v1.13 officially tagged and released
- **Duration**: ~19 days of development
- **Commits**: 81 commits with significant improvements

### Key Changes Between Versions

- 28 files changed
- 1,727 lines added
- 81 lines removed
- Net gain: +1,646 lines of code

## Quick Links

### Major Features Added
1. Bounding box visualization with trace functionality
2. YAML configuration file selector
3. Right-click context menu for canvas
4. Machine state display with color coding
5. Automatic git-based version numbering

### Top Bug Fixes
1. G91 relative positioning in G-code viewer
2. Arc bounding box calculations
3. Multiple undefined object errors
4. Upload progress tracking
5. Coordinate calculations

## Using These Documents

### For GitHub Releases
Use **RELEASE_NOTES_v1.13.md** as the release description

### For Issue Responses
Link to **SUMMARY_v1.12_to_v1.13.md** for quick answers

### For Development Review
Reference **CHANGELOG_v1.12_to_v1.13.md** for complete details

### For Marketing/Announcements
Extract highlights from any document as needed

## Generating Similar Documentation

To document changes between any two versions:

```bash
# Find the commit range
git log --oneline <old-version>..<new-version>

# Get statistics
git diff --stat <old-version>..<new-version>

# View detailed changes
git diff <old-version>..<new-version>
```

## Questions?

If you have questions about these changes, please:
1. Check the relevant document above
2. Open an issue on GitHub
3. Contact the maintainers

---

**Last Updated**: November 5, 2025  
**Repository**: [MaslowCNC/ESP3D-WEBUI](https://github.com/MaslowCNC/ESP3D-WEBUI)
