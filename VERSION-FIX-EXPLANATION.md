# Version Numbering Fix Explanation

## The Problem

When the ESP3D WebUI was compiled locally from a git tree, the version showed the expected format:
```
v2.1-886-g62f0bb9
```

But when Copilot built it, the version showed only:
```
62f0bb9
```

This indicates just the commit hash without tag information.

## Root Cause

The issue was caused by **shallow git clones without tag information**. Here's what was happening:

### 1. Shallow Clone Without Tags
When Copilot clones a repository for building, it performs a **shallow clone** with limited history:
- Only fetches the specific branch being worked on
- Does not fetch tags from the remote repository
- Creates a "grafted" repository with incomplete history

You can verify this with:
```bash
git rev-parse --is-shallow-repository  # Returns: true
git tag -l                              # Returns: empty (no tags)
```

### 2. How `git describe` Works
The `git describe --tags --always --dirty` command generates version strings by:
1. Finding the nearest tag in the commit history
2. Counting commits since that tag
3. Appending the current commit hash
4. Adding `-dirty` if there are uncommitted changes

Expected format: `<tag>-<count>-g<hash>[-dirty]`
Example: `v2.1-886-g62f0bb9`

### 3. The Fallback Behavior
When `git describe --tags` cannot find any tags (because they weren't fetched), the `--always` flag causes it to fall back to showing just the commit hash.

## The Solution

The fix modifies the `replaceVersion()` function in `gulpfile.js` to:

1. **Fetch tags from remote** before running `git describe`
2. **Unshallow the repository** if it's a shallow clone

Here's the code added:

```javascript
function replaceVersion() {
  // Fetch tags and unshallow the repository to ensure proper version numbering
  try {
    // First, fetch tags from remote
    execSync('git fetch --tags --force', { stdio: 'ignore' })
    
    // If this is a shallow repository, unshallow it to get full history
    const isShallow = execSync('git rev-parse --is-shallow-repository').toString().trim()
    if (isShallow === 'true') {
      execSync('git fetch --unshallow', { stdio: 'ignore' })
    }
  } catch (e) {
    console.log('Warning: Could not fetch tags or unshallow repository, version may be incomplete')
  }
  
  // Now git describe will work properly
  var version = execSync('git describe --tags --always --dirty')
    .toString()
    .replace(/\r?\n|\r/g, '')
  
  // ... rest of the function
}
```

## Why This Works

1. **`git fetch --tags --force`**: Downloads all tags from the remote repository to the local clone
2. **`git fetch --unshallow`**: Converts the shallow clone to a full clone with complete history
3. **Error handling**: Gracefully handles failures (e.g., if already unshallowed or network issues)

After these steps, `git describe` has access to:
- All tags in the repository
- Complete commit history to calculate distances
- Proper ancestry information

## Verification

Before the fix:
```bash
$ git describe --tags --always --dirty
62f0bb9
```

After the fix:
```bash
$ git describe --tags --always --dirty
v2.1-886-g62f0bb9
```

The version now correctly shows:
- `v2.1` - the nearest tag
- `886` - number of commits since that tag
- `g62f0bb9` - current commit hash (with 'g' prefix for git)

## Impact on Build Time

The unshallow operation adds approximately 1-3 seconds to the build time, which is acceptable for proper version tracking.

## Why Normal Users Didn't See This Issue

When users clone the repository normally with:
```bash
git clone https://github.com/BarbourSmith/ESP3D-WEBUI.git
```

They get:
- A full clone (not shallow)
- All tags automatically
- Complete history

So `git describe` works correctly without any modifications.

The issue only affected automated build environments (like Copilot) that use shallow clones for efficiency.
