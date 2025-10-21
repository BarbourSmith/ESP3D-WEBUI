# GitHub Actions Automation

This repository uses GitHub Actions to automate various tasks for issue management and build workflows. These automations help streamline the development process by automatically assigning issues to Copilot and relaying comments to the appropriate handlers.

## Automation Features

### 1. Auto-assign Issues to Copilot (`assign-copilot.yml`)

**Workflow:** `.github/workflows/assign-copilot.yml`

**Trigger:** When a new issue is opened

**What it does:**
- Automatically assigns the issue to `@copilot-swe-agent` for processing
- Skips issues created by `BarbourSmith` (repository owner)

**How it works:**
- Uses GitHub's built-in `GITHUB_TOKEN` with `issues: write` permission
- Runs the GitHub CLI (`gh`) command to add the assignee
- Executes immediately when a new issue is created

**Permissions required:**
- `issues: write` - To modify issue assignments
- `contents: read` - To access repository content

### 2. Relay Comments to Copilot (`relay-comments-to-copilot.yml`)

**Workflow:** `.github/workflows/relay-comments-to-copilot.yml`

**Trigger:** When a comment is created on an issue or pull request

**What it does:**
- Monitors comments for mentions of `@MaslowBot` or `@maslowbot`
- Creates a new comment that mentions `@copilot-swe-agent` with the original request
- Skips comments that already mention `@copilot-swe-agent` to avoid duplication
- Ignores build trigger comments (handled by `compile-webui.yml`)

**How it works:**
- Uses GitHub's built-in `GITHUB_TOKEN` with `issues: write` and `pull-requests: write` permissions
- Uses `actions/github-script@v7` to process and relay comments
- Formats relayed comments with clear attribution and dividers
- Includes safety checks to prevent infinite loops and unnecessary relays

**Permissions required:**
- `issues: write` - To create comments on issues
- `pull-requests: write` - To create comments on pull requests
- `contents: read` - To access repository content

**Example workflow:**
1. User comments: "@MaslowBot can you help with this issue?"
2. Workflow detects the mention
3. Creates a new comment: "@copilot-swe-agent User @username mentioned @MaslowBot with the following request: [original comment]"
4. Copilot responds to the relayed request

### 3. Compile WebUI on Review Request (`compile-webui.yml`)

**Workflow:** `.github/workflows/compile-webui.yml`

**Trigger:** 
- When `@MaslowBot` is requested as a reviewer on a PR
- When someone comments "please build" or "/build" on a PR

**What it does:**
- Compiles the ESP3D WebUI for English language
- Uploads the compiled artifact for download
- Comments on the PR with build details and download instructions

**How it works:**
- Installs Node.js dependencies
- Runs `gulp package --lang en` to build the WebUI
- Creates an artifact with the compiled `index.html.gz` file
- Posts a comment with build information and download link

## Migration Notes (Repository Move)

When this repository was moved from a personal account to the `MaslowCNC` organization, the automation workflows were updated to work properly in the organization context:

### Changes Made:
1. **Token Update**: Changed from `secrets.USER_GITHUB_TOKEN` to `secrets.GITHUB_TOKEN`
   - The built-in `GITHUB_TOKEN` is automatically available and properly scoped
   - No manual secret configuration required
   
2. **Permission Grants**: Added explicit `permissions:` blocks to workflows
   - Makes security requirements clear and follows GitHub best practices
   - Ensures workflows have exactly the permissions they need
   
3. **Organization Compatibility**: Workflows now work seamlessly in the organization context
   - No dependency on personal access tokens
   - Proper integration with organization-level security policies

### Why These Changes Were Needed:
- Personal Access Tokens (`USER_GITHUB_TOKEN`) are tied to individual users
- When a repository moves to an organization, these tokens don't automatically transfer
- The built-in `GITHUB_TOKEN` is organization-aware and automatically available
- Explicit permissions improve security and make the workflow intentions clear

## Using the Automation

### For Users:
- **Create an issue**: It will automatically be assigned to Copilot
- **Need Copilot's help?**: Mention `@MaslowBot` in any comment
- **Need a build?**: Request `@MaslowBot` as a reviewer or comment "please build"

### For Maintainers:
- All workflows use the built-in `GITHUB_TOKEN` - no secret configuration needed
- Workflows follow the principle of least privilege with explicit permissions
- Check the Actions tab for workflow run history and logs

## Troubleshooting

### Issue Assignment Not Working:
1. Check that the workflow has `issues: write` permission
2. Verify the issue was created by someone other than `BarbourSmith`
3. Check the Actions tab for workflow execution logs

### Comment Relaying Not Working:
1. Ensure the comment includes `@MaslowBot` or `@maslowbot`
2. Check that the comment is long enough (>10 characters)
3. Verify the workflow has `issues: write` and `pull-requests: write` permissions
4. Check the Actions tab for workflow execution logs

### Build Not Triggering:
1. Verify `@MaslowBot` was added as a reviewer (for review-based triggers)
2. Check that the comment includes "please build" or "/build" (for comment-based triggers)
3. Ensure the comment is on a pull request (not a regular issue)
4. Check the Actions tab for workflow execution logs

## Security

All workflows use GitHub's built-in `GITHUB_TOKEN` which:
- Is automatically provided by GitHub Actions
- Has appropriate permissions scoped to the repository
- Expires after the workflow run completes
- Follows organization security policies
- Cannot be leaked or misused outside the workflow context

The workflows follow security best practices:
- Explicit permission grants (principle of least privilege)
- Input validation and safety checks
- No exposure of sensitive data
- Proper error handling

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Token Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
