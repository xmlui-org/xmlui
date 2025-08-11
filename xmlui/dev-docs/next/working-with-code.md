# Working with the Code

This document describes the most common development tasks and workflows for contributing to the XMLUI project, including adding features, fixing bugs, and maintaining code quality.

## Development Workflow

### 1. Fetch and Sync Main Branch

Before starting any new work, ensure you have the latest changes from the main repository:

#### Command Line
```bash
# Switch to main branch
git checkout main

# Fetch latest changes from upstream
git fetch origin

# Sync your local main with upstream
git pull origin main

# Clean up any local changes (if needed)
git clean -fd
```

#### VS Code
1. **Open Source Control panel** (Ctrl/Cmd + Shift + G)
2. **Switch to main branch**: Click current branch name in status bar → select "main"
3. **Fetch changes**: Click "..." in Source Control → "Fetch"
4. **Pull changes**: Click "..." → "Pull" (or use Ctrl/Cmd + Shift + P → "Git: Pull")
5. **Clean workspace**: Terminal → `git clean -fd` (if needed)

#### IntelliJ IDEA / WebStorm
1. **Switch to main branch**: Bottom right corner → click branch name → "Checkout" → "main"
2. **Fetch and pull**: VCS menu → "Git" → "Fetch" then "Pull..." 
   - Or use toolbar Git icon → "Pull"
   - Or keyboard shortcut: Ctrl/Cmd + T
3. **Clean workspace**: Terminal tool window → `git clean -fd` (if needed)

### 2. Create Your Working Branch

Create a new branch using the naming convention `<your-github-name>/<feature-or-fix-name>`:

#### Command Line
```bash
# Create and switch to new branch
git checkout -b johndoe/add-animation-components

# Examples of good branch names:
git checkout -b johndoe/fix-search-performance
git checkout -b maryjane/update-pdf-export
git checkout -b alexsmith/improve-error-handling
```

#### VS Code
1. **Create new branch**: Click branch name in status bar → "Create new branch..."
2. **Enter branch name**: Type `johndoe/add-animation-components`
3. **Switch to branch**: Branch is automatically checked out after creation

#### IntelliJ IDEA / WebStorm
1. **Create new branch**: Bottom right corner → click branch name → "New Branch"
2. **Enter branch name**: Type `johndoe/add-animation-components`
3. **Create and checkout**: Click "Create" (automatically switches to new branch)

**Branch naming guidelines:**
- Use your GitHub username as prefix
- Use descriptive names for the feature/fix
- Use kebab-case (lowercase with hyphens)
- Keep names concise but clear

### 3. Implement Your Feature or Fix

#### Development Setup

Ensure your development environment is ready:

```bash
# Install dependencies (if not done already)
npm install
```

#### Making Changes

**For Core Framework Changes:**
```bash
# Work in the core framework
cd xmlui/src/

# Make your changes to components, parsers, etc.
# Edit files in: components/, abstractions/, parsers/, etc.
```

**For Extension Package Changes:**
```bash
# Work in specific extension
cd packages/xmlui-animations/src/

# Make your changes
# Each package has its own src/ directory
```

**For Documentation Changes:**
```bash
# Work in documentation
cd docs/src/

# Update documentation content
# Edit Main.xmlui, components/, content/, etc.
```

### 4. Regular Testing

Test your changes regularly during development:

#### Command Line
```bash
# Run unit tests
cd xmlui
npm run test:unit

# Run end-to-end smoke tests (quick)
npm run test:e2e-smoke

# Run full test suite (slower)
npm run test:e2e

# Test specific package
cd packages/xmlui-animations
npm test
```

#### VS Code
1. **Open integrated terminal**: Ctrl/Cmd + ` (backtick)
2. **Run tests via terminal**: Use same npm commands as above
3. **Use Test Explorer** (if available):
   - Install Jest or other test extensions
   - View → Test Explorer
   - Run tests from sidebar
4. **NPM Scripts panel**: Explorer → NPM Scripts → click test scripts

#### IntelliJ IDEA / WebStorm
1. **Use built-in terminal**: Alt/Opt + F12 → run npm commands
2. **NPM tool window**: View → Tool Windows → NPM → double-click test scripts
3. **Run configurations**: 
   - Run → Edit Configurations → "+" → NPM
   - Set script: "test:unit", "test:e2e-smoke", etc.
   - Save and run with Ctrl/Cmd + R
4. **Test runner integration**: Right-click test files → "Run" (for Jest/Vitest)

**Manual Testing:**
- Use the documentation site to test your changes visually
- Test in different browsers if making UI changes
- Verify your changes work with different configurations

### 5. Update Documentation

If your changes affect user-facing functionality:

**Component Documentation:**
```bash
# Update component examples in docs
cd docs/content/components/
# Edit relevant .md files
```

**API Documentation:**
```bash
# Update API documentation
cd docs/content/api/
# Add or update API descriptions
```

**Developer Documentation:**
```bash
# Update developer guides if needed
cd xmlui/dev-docs/next/
# Edit relevant .md files
```

**Code Comments:**
- Add JSDoc comments for new functions/components
- Update existing comments if behavior changes
- Include usage examples in complex functions

### 6. Add Changesets

Document your changes using changesets for proper versioning:

#### Command Line
```bash
# Add a changeset
npm run changeset:add

# Follow the interactive prompts:
# 1. Select which packages your change affects
# 2. Choose change type: patch (bug fix), minor (feature), major (breaking)
# 3. Write a clear description of your change
```

#### VS Code
1. **Open integrated terminal**: Ctrl/Cmd + `
2. **Run changeset command**: `npm run changeset:add`
3. **Use terminal prompts**: Navigate with arrow keys, select with space, enter to continue
4. **Alternative - NPM Scripts**: Explorer → NPM Scripts → "changeset:add"

#### IntelliJ IDEA / WebStorm
1. **Open terminal**: Alt/Opt + F12
2. **Run changeset command**: `npm run changeset:add`
3. **Use interactive prompts**: Follow terminal instructions
4. **Alternative - NPM tool**: View → Tool Windows → NPM → double-click "changeset:add"

**Changeset Guidelines:**
- **Patch**: Bug fixes, small improvements
- **Minor**: New features, new components
- **Major**: Breaking changes, API changes

**Example changeset descriptions:**
```markdown
Add new animation components for smooth transitions

Fix search performance issue with large datasets

Update PDF export to support custom page sizes
```

### 7. Final Testing

Before creating a pull request, run comprehensive tests from the **root folder**:

#### Command Line
```bash
# Run complete test suite (development mode)
npm run test-xmlui

# OR run complete test suite (CI mode - faster, production-like)
npm run test-xmlui:ci

# Verify changesets
npm run changeset:version
```

**Test Command Differences:**
- **`test-xmlui`**: Full test suite with development optimizations and detailed output
- **`test-xmlui:ci`**: Same tests but with `CI=true` environment variable for:
  - Faster execution (no watch mode)
  - Production-like environment
  - Better suited for automated testing
  - Less verbose output

#### VS Code
1. **Open terminal**: Ctrl/Cmd + `
2. **Navigate to root**: Ensure you're in the root folder (not in subpackages)
3. **Run test commands**: Use same npm commands as above
4. **Use NPM Scripts panel**: 
   - Explorer → NPM Scripts (root level)
   - Click "test-xmlui" or "test-xmlui:ci"
5. **Tasks**: Ctrl/Cmd + Shift + P → "Tasks: Run Task" → select test tasks

#### IntelliJ IDEA / WebStorm
1. **Navigate to root**: Ensure project root is selected in Project tool window
2. **NPM tool window**: View → Tool Windows → NPM (shows root package.json scripts)
3. **Run scripts**: Double-click "test-xmlui" or "test-xmlui:ci"
4. **Terminal alternative**: Alt/Opt + F12 → run npm commands from root
5. **Run configurations**: 
   - Create NPM run configs for frequently used commands
   - Run → Edit Configurations → "+" → NPM
   - Set Package: (root package.json)

**Pre-commit Checklist:**
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changesets added
- [ ] Code formatted properly
- [ ] No console errors in development

### 8. Create and Merge Pull Request

#### Commit Your Changes

#### Command Line
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add animation components with spring physics

- Implement bounce, fade, and slide animations
- Add comprehensive test coverage
- Update documentation with examples
- Add changeset for minor version bump"

# Push to your branch
git push origin johndoe/add-animation-components
```

#### VS Code
1. **Stage changes**: Source Control panel (Ctrl/Cmd + Shift + G) → "+" next to files or "Stage All Changes"
2. **Write commit message**: Enter message in text box at top
3. **Commit**: Click "✓ Commit" button or Ctrl/Cmd + Enter
4. **Push**: Click "..." → "Push" or sync icon in status bar

#### IntelliJ IDEA / WebStorm
1. **Open commit window**: Ctrl/Cmd + K or VCS → "Commit"
2. **Select files**: Check files to include in commit
3. **Write commit message**: Enter in message field
4. **Commit**: Click "Commit" button
5. **Push**: VCS → "Git" → "Push" or Ctrl/Cmd + Shift + K

#### Create Pull Request

1. **Go to GitHub** and create a pull request from your branch
2. **Use descriptive title**: Same as your commit message headline
3. **Fill out PR template** with:
   - Description of changes
   - Testing performed
   - Screenshots (if UI changes)
   - Breaking changes (if any)

#### Pull Request Review

- **Respond to feedback** promptly
- **Make requested changes** in new commits
- **Update tests** if reviewers suggest improvements
- **Rebase if needed** to keep history clean

#### Merge Process

Once approved:

#### Command Line
```bash
# Sync with main before merging (if needed)
git checkout main
git pull origin main
git checkout johndoe/add-animation-components
git rebase main

# Push updated branch
git push origin johndoe/add-animation-components --force-with-lease
```

#### VS Code
1. **Switch to main**: Click branch name → "main"
2. **Pull latest**: Source Control → "..." → "Pull"
3. **Switch back to feature branch**: Click branch → "johndoe/add-animation-components"
4. **Rebase** (if needed): Source Control → "..." → "Branch" → "Rebase Branch..."
5. **Push**: Source Control → "..." → "Push" → "Push (Force with Lease)" if rebased

#### IntelliJ IDEA / WebStorm
1. **Switch to main**: Bottom right → "main"
2. **Pull latest**: VCS → "Git" → "Pull" or Ctrl/Cmd + T
3. **Switch to feature branch**: Bottom right → "johndoe/add-animation-components"
4. **Rebase** (if needed): VCS → "Git" → "Rebase..." → select "main"
5. **Push**: VCS → "Git" → "Push" → check "Force with lease" if rebased

- **Merge via GitHub** using "Squash and merge" (preferred)
- **Delete branch** after merging
- **Clean up locally**:

#### Command Line
```bash
git checkout main
git pull origin main
git branch -d johndoe/add-animation-components
```

#### VS Code
1. **Switch to main**: Click branch name → "main"
2. **Pull latest**: Source Control → "..." → "Pull"
3. **Delete branch**: Click branch name → find old branch → click "🗑️" delete icon

#### IntelliJ IDEA / WebStorm
1. **Switch to main**: Bottom right → "main"
2. **Pull latest**: Ctrl/Cmd + T
3. **Delete branch**: Bottom right → find old branch → "Delete"

## Common Development Tasks

### Adding a New Component

1. **Create component** in appropriate package (`packages/xmlui-*/src/`)
2. **Add tests** in same package
3. **Export component** from package index
4. **Add documentation** with examples
5. **Add changeset** (minor version)

### Fixing a Bug

1. **Write test** that reproduces the bug
2. **Fix the issue** while ensuring test passes
3. **Verify fix** doesn't break existing functionality
4. **Add changeset** (patch version)

### Updating Dependencies

1. **Update package.json** files
2. **Test thoroughly** for breaking changes
3. **Update documentation** if APIs changed
4. **Add changeset** (patch or minor depending on impact)

### Performance Improvements

1. **Benchmark current performance**
2. **Implement improvements**
3. **Verify performance gains**
4. **Add performance tests** if possible
5. **Document improvements**

This workflow ensures code quality, proper testing, and coordinated releases across the entire XMLUI monorepo.

## Using Development Branch in XMLUI Apps

When developing new features or fixing bugs in the XMLUI framework, you often need to test your changes in a real application before releasing a new version. This section describes how to link your local XMLUI development repository directly to your application, allowing you to test framework modifications immediately without publishing packages.

### Why Use Local Development Linking

- **Instant Testing**: Test your XMLUI framework changes in real applications without waiting for releases
- **Faster Development**: Iterate quickly on framework features while seeing immediate results in your app
- **Bug Verification**: Confirm that bug fixes work correctly in actual use cases
- **Feature Validation**: Ensure new framework features integrate properly with existing applications

### Setting Up npm Link

To use the current development branch of XMLUI (main or your feature/fix branch) in your application, you need to create an npm link from your local XMLUI repository to your app.

> **Note**: npm link creates symbolic links between packages, allowing you to use a local development version of a package instead of the published version from the npm registry. When you run `npm link` in a package directory, it creates a global symbolic link to that package. Then, when you run `npm link <package-name>` in another project, it creates a local symbolic link from your project's `node_modules` to the global link.
>
> This approach bypasses the normal npm installation process and directly connects your application to your local development code. Any changes you make to the linked package (after building) will be immediately available to your application, enabling rapid development and testing cycles.

#### Step 1: Create the Link in XMLUI Repository

Navigate to the XMLUI core framework directory and create a global npm link:

```bash
# Navigate to the XMLUI core framework
cd /path/to/xmlui-repo/xmlui

# Create a global npm link for the xmlui package
npm link
```

**IDE Tip**: In VS Code or IntelliJ IDEA/WebStorm, you can right-click on the `xmlui` folder in the project explorer and select "Open in Terminal" (VS Code) or "Open Terminal Here" (IntelliJ/WebStorm) to open a terminal directly in the xmlui directory, eliminating the need for the `cd` command.

**Example XMLUI Application package.json**:
```json
{
  "name": "my-xmlui-app",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "start": "xmlui start",
    "build": "xmlui build",
    "preview": "xmlui preview",
    "build-prod": "npm run build -- --prod",
    "release-ci": "npm run build-prod && xmlui zip-dist",
    "release-prod": "npm run build-prod && xmlui zip-dist"
  },
  "dependencies": {
    "xmlui": "*"
  }
}
```

#### Step 2: Link in Your Application

Your application's package.json should reference the XMLUI framework like in this sample:

```json
{
  "name": "my-xmlui-app",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "start": "xmlui start",
    "build": "xmlui build",
    "preview": "xmlui preview",
    "build-prod": "npm run build -- --prod",
    "release-ci": "npm run build-prod && xmlui zip-dist",
    "release-prod": "npm run build-prod && xmlui zip-dist"
  },
  "dependencies": {
    "xmlui": "*"
  }
}
```

In your XMLUI application directory, link to your local development version:

```bash
# Navigate to your XMLUI application
cd /path/to/your-xmlui-app

# Link to your local XMLUI development version
npm link xmlui
```

> **Important**: If you modify the dependencies in your application's package.json and run `npm install`, you'll need to run `npm link xmlui` again to restore the link to your local development version.

> **Note**: In some cases (it's an npm feature or bug), you may need to use `npm link xmlui react react-dom`. If running the app after `npm link xmlui` gives an error about react or react-dom, this is the resolution.

#### Step 3: Test Your Application

Your application now uses your local XMLUI development version. The Vite development server automatically uses the freshest framework code without requiring a build step:

```bash
# In your application directory
npm start

# Your app now runs with your local XMLUI modifications
# Vite ensures you're using the latest framework code for fast iteration
```

> **Note**: Sometimes Vite hot module reloading may face situations when reloading your app after an XMLUI change does not work as expected (because the reloading did not detect the effect of changes correctly). In this case, stop the running app and start again with `npm start`.
