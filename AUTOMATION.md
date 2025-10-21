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
- Uses the `USER_GITHUB_TOKEN` Personal Access Token for authentication
- Uses GitHub's CLI (`gh`) command to add the assignee
- Executes immediately when a new issue is created

**Permissions required:**
- The `USER_GITHUB_TOKEN` Personal Access Token must have:
  - `repo` scope - Full control of private repositories
  - `workflow` scope - Update GitHub Action workflows

### 2. Relay Comments to Copilot (`relay-comments-to-copilot.yml`)

**Workflow:** `.github/workflows/relay-comments-to-copilot.yml`

**Trigger:** When a comment is created on an issue or pull request

**What it does:**
- Monitors comments for mentions of `@MaslowBot` or `@maslowbot`
- Creates a new comment that mentions `@copilot-swe-agent` with the original request
- Skips comments that already mention `@copilot-swe-agent` to avoid duplication
- Ignores build trigger comments (handled by `compile-webui.yml`)

**How it works:**
- Uses the `USER_GITHUB_TOKEN` Personal Access Token for authentication
- Uses `actions/github-script@v7` to process and relay comments
- Formats relayed comments with clear attribution and dividers
- Includes safety checks to prevent infinite loops and unnecessary relays

**Permissions required:**
- The `USER_GITHUB_TOKEN` Personal Access Token must have:
  - `repo` scope - Full control of private repositories  
  - `workflow` scope - Update GitHub Action workflows

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

When this repository was moved from a personal account to the `MaslowCNC` organization, the automation workflows continued to use the existing `USER_GITHUB_TOKEN` secret that was already configured.

### Current Configuration:
- **Token Used**: `secrets.USER_GITHUB_TOKEN` (Personal Access Token)
- **Configuration**: Must be set in repository or organization secrets
- **Permissions**: The PAT must have appropriate permissions for:
  - Reading repository contents
  - Writing to issues (creating, editing, assigning)
  - Writing to pull requests (commenting)

### How to Configure USER_GITHUB_TOKEN:
1. Create a Personal Access Token with the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
2. Add the token to repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Create a new secret named `USER_GITHUB_TOKEN`
   - Paste the Personal Access Token value

The token is already configured in this repository and the workflows are functioning properly.

## Using the Automation

### For Users:
- **Create an issue**: It will automatically be assigned to Copilot
- **Need Copilot's help?**: Mention `@MaslowBot` in any comment
- **Need a build?**: Request `@MaslowBot` as a reviewer or comment "please build"

### For Maintainers:
- All workflows use the `USER_GITHUB_TOKEN` secret - ensure it's properly configured
- The token should have `repo` and `workflow` scopes
- Check the Actions tab for workflow run history and logs
- Rotate the token periodically for security

## Troubleshooting

### Issue Assignment Not Working:
1. Check that the `USER_GITHUB_TOKEN` secret is properly configured
2. Verify the token has `repo` and `workflow` scopes
3. Verify the issue was created by someone other than `BarbourSmith`
4. Check the Actions tab for workflow execution logs

### Comment Relaying Not Working:
1. Check that the `USER_GITHUB_TOKEN` secret is properly configured
2. Verify the token has `repo` and `workflow` scopes
3. Ensure the comment includes `@MaslowBot` or `@maslowbot`
4. Check that the comment is long enough (>10 characters)
5. Check the Actions tab for workflow execution logs

### Build Not Triggering:
1. Verify `@MaslowBot` was added as a reviewer (for review-based triggers)
2. Check that the comment includes "please build" or "/build" (for comment-based triggers)
3. Ensure the comment is on a pull request (not a regular issue)
4. Check the Actions tab for workflow execution logs

## Security

All workflows use the `USER_GITHUB_TOKEN` Personal Access Token which:
- Must be created with appropriate scopes (`repo` and `workflow`)
- Is stored as an encrypted secret in the repository
- Is only accessible to workflow runs in this repository
- Should be rotated periodically for security
- Must be kept confidential and never exposed in logs

The workflows follow security best practices:
- Input validation and safety checks
- No exposure of sensitive data
- Proper error handling
- Minimal required permissions

### Token Security Best Practices:
1. Use a dedicated bot account or service account for the PAT
2. Rotate the token regularly (recommended: every 90 days)
3. Monitor the token's usage in the account's security log
4. Revoke and regenerate if compromised
5. Never commit the token value to the repository

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Token Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
