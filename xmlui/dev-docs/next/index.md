# XMLUI Developer's Guide

Welcome to the XMLUI developer's guide. This documentation covers the technical architecture, build processes, and development workflows for the entire XMLUI monorepo ecosystem.

This guide is specifically for developers working on the XMLUI framework, its extensions, and related tools. For user-facing documentation and component guides, visit the main XMLUI documentation website.

## Getting Started

**Prerequisites:**
- **Node.js**: Version 18.12.0 or higher
- **npm**: Version 10.9.2 or higher (comes with Node.js)
- **Git**: For version control

1. **Fork and Clone the Repository**
   ```bash
   # Fork the repository on GitHub first, then clone your fork
   git clone https://github.com/YOUR_USERNAME/xmlui.git
   cd xmlui
   ```

2. **Install Dependencies**
   ```bash
   # Install all workspace dependencies
   npm install
   ```

3. **Build Documentation**
   ```bash
   # Build documentation site
   npm run build-docs
   ```

4. **Build the Framework**
   ```bash
   # Build core framework and all extension packages
   npm run build-xmlui
   ```

5. **Run Tests** (Optional)
   ```bash
   # Run the complete test suite
   npm run test-xmlui
   
   # Or run just smoke tests for faster feedback
   npm run test-xmlui-smoke
   ```

6. **Start Development**
   ```bash
   # Start the documentation site with live reload
   cd docs
   npm start
   ```

## Project Artifacts

XMLUI is organized as a monorepo containing **12+ buildable artifacts** across multiple workspaces. Each workspace has its own `package.json` and produces specific build outputs:

### Core Framework
- **`xmlui`** (`xmlui/`) - Main framework library with components, parsers, and CLI tools

### Extension Packages (7 packages)
- **`xmlui-animations`** (`packages/xmlui-animations/`) - Animation components with React Spring integration
- **`xmlui-devtools`** (`packages/xmlui-devtools/`) - Developer tools and debugging utilities  
- **`xmlui-os-frames`** (`packages/xmlui-os-frames/`) - OS-specific window frames and chrome
- **`xmlui-pdf`** (`packages/xmlui-pdf/`) - PDF generation and display components
- **`xmlui-playground`** (`packages/xmlui-playground/`) - Interactive code playground and editor
- **`xmlui-search`** (`packages/xmlui-search/`) - Search and filtering components
- **`xmlui-spreadsheet`** (`packages/xmlui-spreadsheet/`) - Spreadsheet and data grid components

### Applications & Tools
- **`xmlui-e2e`** (`tests/`) - End-to-end test suite and test bed application
- **`create-xmlui-app`** (`tools/create-app/`) - CLI tool for scaffolding new projects
- **`xmlui-vscode`** (`tools/vscode/`) - VS Code extension for language support

### Documentation
- **`xmlui-docs`** (`docs/`) - User documentation website with interactive playground

## Documentation Structure

- [**Project Structure**](./project-structure.md) - Developer documentation for monorepo structure and build artifacts
- [**Working with Code**](./working-with-code.md) - Development workflow and common tasks for contributing to XMLUI
- [**Project Build**](./project-build.md) - Build system documentation using Turborepo for monorepo orchestration
- [**Generate Component Reference Documentation**](./generating-component-reference.md) - How to generate and maintain component reference documentation
