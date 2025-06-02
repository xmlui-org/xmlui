# Contributing to xmlui

Welcome to **xmlui**! We're thrilled to have you contribute to our project. This document outlines the guidelines for contributing, ensuring a smooth and collaborative experience for everyone.

**xmlui** is a modern web UI framework designed to empower desktop developers to effortlessly create web applications without requiring deep knowledge of HTML, CSS, or JavaScript. 

Your contributions are valuable and help us improve and grow the project.

## Code of Conduct

We expect all contributors to act respectfully and professionally, maintaining a positive and inclusive environment for everyone in our community.

## Getting Started

Before you begin contributing, please ensure you have:

1. **Node.js** (version 16 or higher) installed on your system
2. **npm** or **yarn** package manager
3. A **GitHub account** for submitting pull requests
4. **Git** installed and configured

### Setting Up the Development Environment

1. **Fork the Repository**: Fork the xmlui repository to your GitHub account
2. **Clone Your Fork**: 
   ```bash
   git clone https://github.com/your-username/xmlui.git
   cd xmlui
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

## How to Contribute

There are several ways you can contribute to **xmlui**:

- **Reporting Bugs**: If you find a bug, please report it using our [issue tracker](https://github.com/xmlui-com/xmlui/issues/new?template=bug_report.md)
- **Suggesting Features**: Have a feature request? Open a [feature request issue](https://github.com/xmlui-com/xmlui/issues/new?template=feature_request.md)
- **Writing Code**: If you'd like to contribute code, follow the guidelines below
- **Improving Documentation**: Help us improve our documentation by fixing typos, adding missing reference information, creating tutorials, and developing how-to sections

### Reporting Bugs

When reporting bugs, please follow these steps:

1. **Check Existing Issues**: Before reporting, search existing issues to avoid duplicates
2. **Use the Bug Report Template**: Open a new issue using the bug report template
3. **Provide Detailed Information**: Include:
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Browser and OS information
   - Screenshots or code snippets when applicable
   - Error messages or console logs

### Suggesting Features

To suggest new features:

1. **Search Existing Requests**: Check if your suggestion has already been proposed
2. **Use the Feature Request Template**: Open a new feature request issue
3. **Provide Clear Details**: Include:
   - A clear description of the proposed feature
   - Use cases and benefits
   - Potential implementation considerations
   - Examples or mockups if applicable

### Writing Code

To contribute code to xmlui:

1. **Fork the Repository**: Fork the repository to your GitHub account
2. **Clone Your Fork**: Clone your fork locally
3. **Create a Feature Branch**: Create a new branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b bugfix/issue-description
   ```
4. **Make Your Changes**: Implement your feature or bug fix
5. **Follow Code Standards**: Ensure your code follows our coding standards (see below)
6. **Write Tests**: Add or update tests for your changes
7. **Test Your Changes**: Run the test suite to ensure everything works
8. **Commit Your Changes**: Use clear and descriptive commit messages
9. **Push to Your Fork**: Push your branch to your forked repository
10. **Open a Pull Request**: Create a pull request from your branch to the main repository

#### Code Standards

- Follow TypeScript/JavaScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Maintain consistent indentation (2 spaces)
- Follow the existing code style in the project
- Ensure your code is properly formatted (use Prettier if configured)

### Improving Documentation

You can help improve our documentation in the following ways:

- **Fixing Typos and Grammar**: Correct spelling and grammatical errors
- **Adding Missing Reference Information**: Complete API documentation and add missing details
- **Creating Tutorials**: Develop step-by-step tutorials for common use cases
- **Writing How-To Guides**: Create guides for specific tasks and workflows
- **Improving Examples**: Add or enhance code examples and demonstrations

To contribute to documentation:

1. **Identify Areas for Improvement**: Look for outdated, incomplete, or unclear documentation
2. **Make Your Changes**: Edit the relevant documentation files (usually `.md` files)
3. **Test Your Changes**: Preview your changes to ensure proper formatting
4. **Submit a Pull Request**: Follow the same process as code contributions

## Development Workflow

### Project Structure

Understanding the project structure will help you navigate and contribute effectively:

- `/src/` - Main source code
- `/src/components/` - UI components
- `/tests/` - Test files
- `/docs/` - Documentation files
- `/tools/` - Development tools and utilities
- `/examples/` - Example applications

### Branching Strategy

We use a Git flow-inspired branching strategy:

- **main**: The main branch contains stable, production-ready code and is protected
- **feature/[feature-name]**: For developing new features
- **bugfix/[issue-description]**: For fixing bugs
- **docs/[doc-update]**: For documentation updates
- **refactor/[refactor-description]**: For code refactoring

### Running Tests

Before submitting any changes, ensure all tests pass:

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode during development
npm run test:watch
# or
yarn test:watch

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

### Code Reviews

All submissions require code review before merging:

1. **Automated Checks**: Your pull request will run automated tests and linting
2. **Peer Review**: A project maintainer will review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your changes will be merged

### Testing Guidelines

When contributing code, please ensure:

- **Write Tests**: Add tests for new functionality
- **Update Existing Tests**: Modify tests when changing existing functionality
- **Test Coverage**: Maintain or improve test coverage
- **Test Types**:
  - Unit tests for individual functions/components
  - Integration tests for component interactions
  - End-to-end tests for complete user workflows

### Commit Message Guidelines

Write clear and descriptive commit messages following conventional commit format:

- `feat: add new DatePicker component with min/max value support`
- `fix: resolve memory leak in component cleanup`
- `docs: update API documentation for Button component`
- `refactor: optimize rendering performance in ListView`
- `test: add unit tests for form validation`
- `build: update webpack configuration for production builds`
- `chore: update dependencies to latest versions`

**Commit Message Structure:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: A code change that improves code quality, structure, or readability without fixing bugs or adding features
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

## Pull Request Guidelines

When submitting a pull request:

1. **Use a Clear Title**: Describe what your PR does in the title
2. **Fill Out the Template**: Complete the pull request template
3. **Link Related Issues**: Reference any related issues using `#issue-number`
4. **Describe Your Changes**: Explain what you changed and why
5. **Add Screenshots**: For UI changes, include before/after screenshots
6. **Keep It Focused**: One feature or fix per pull request
7. **Update Documentation**: Update relevant documentation for your changes

## Community and Support

### Getting Help

If you need help while contributing:

- **GitHub Discussions**: Use GitHub Discussions for questions and community support
- **Issue Tracker**: Report bugs and request features through GitHub Issues
- **Documentation**: Check our documentation for guides and API references

### Communication Guidelines

- Be respectful and inclusive in all interactions
- Provide constructive feedback when reviewing code
- Ask questions if something is unclear
- Help others when you can
- Follow our Code of Conduct at all times

## Recognition

We value all contributions to xmlui! Contributors will be:

- Listed in our `CONTRIBUTORS.md` file
- Mentioned in release notes for significant contributions
- Eligible for special contributor badges and recognition

## Licensing

By contributing to **xmlui**, you agree that your contributions will be licensed under the [MIT License](https://github.com/xmlui-com/xmlui/blob/main/LICENSE).

## Questions?

If you have any questions about contributing, please:

- Check our [FAQ](https://github.com/xmlui-com/xmlui/wiki/FAQ) 
- Open a [discussion](https://github.com/xmlui-com/xmlui/discussions)
- Reach out to the maintainers

## Acknowledgements

Thank you for considering contributing to **xmlui**! Your contributions are greatly appreciated and make a significant impact on the project's success. Every contribution, no matter how small, helps make xmlui better for everyone.
