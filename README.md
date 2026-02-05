# Markdown to HTML Converter

A professional, TypeScript-based CLI tool for converting Markdown files to beautifully styled HTML documents. Built with modern development practices including comprehensive test coverage and robust error handling.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-29.7-green.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/md-to-html-converter.git
cd md-to-html-converter
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. (Optional) Link for global usage:
```bash
npm link
```

## Usage

### Single File Conversion

Convert a single Markdown file to HTML:

```bash
# Using npm scripts (development)
npm run dev convert example.md

# After building
node dist/index.js convert example.md

# If globally linked
md-to-html convert example.md

# You can also use demo.md for testing
```

### Specify Output File

Control where the HTML file is saved:

```bash
npm run dev convert input.md -o output.html
npm run dev convert input.md --output /path/to/output.html
```

### Custom Templates

Use your own HTML template with a `{{content}}` placeholder:

```bash
npm run dev convert input.md -t template.html
npm run dev convert input.md --template custom-template.html
```

**Template Example:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Custom Template</title>
  <link rel="stylesheet" href="custom-styles.css">
</head>
<body>
  <header>
    <h1>My Website</h1>
  </header>
  <main>
    {{content}}
  </main>
  <footer>
    <p>&copy; 2026 My Company</p>
  </footer>
</body>
</html>
```

### Batch Directory Conversion

Process multiple Markdown files at once using the `processDirectory` function:

```typescript
import { processDirectory } from './converter';

await processDirectory(
  './markdown-files',  // Source directory
  './html-output',     // Target directory
  './template.html'    // Optional template
);
```

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `npm run dev` | Run the CLI with ts-node (no build required) |
| `npm run watch` | Watch for changes and recompile automatically |
| `npm run clean` | Remove build output directory |
| `npm test` | Run the full test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

### Project Structure

```
md-to-html-converter/
├── src/
│   ├── index.ts           # CLI entry point with Commander
│   ├── converter.ts       # Core conversion and processing logic
│   ├── types.ts          # TypeScript interfaces and types
│   └── converter.test.ts # Comprehensive test suite
├── dist/                 # Compiled JavaScript (generated)
├── coverage/            # Test coverage reports (generated)
├── example.md           # Sample Markdown file
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest testing configuration
└── README.md           # This file
```

## Testing

This project includes comprehensive unit and integration tests using Jest and ts-jest.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes:

- ✅ **Unit Tests** for `convertMarkdownToHtml`:
  - Empty string handling
  - Header-only content
  - Nested list structures
  - Script tag handling (security consideration)
  - Custom template integration

- ✅ **Integration Tests** for `processDirectory`:
  - Full file system workflow with mocks
  - Error handling for missing directories
  - Individual file failure recovery
  - Empty directory handling

### Security Note

⚠️ **Important**: By default, the `marked` library does not sanitize HTML content. Script tags and other potentially dangerous HTML in Markdown files will pass through to the output. For production use with untrusted input, consider:

- Using [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize output
- Implementing custom marked hooks to filter dangerous tags
- Validating and sanitizing input sources

## API Documentation

### `convertMarkdownToHtml(markdown, templatePath?): Promise<string>`

Converts Markdown content to HTML.

**Parameters:**
- `markdown` (string): The Markdown content to convert
- `templatePath` (string, optional): Path to a custom HTML template

**Returns:** Promise resolving to HTML string

### `processDirectory(sourceFolder, targetFolder, templatePath?): Promise<void>`

Processes all `.md` files in a directory and converts them to HTML.

**Parameters:**
- `sourceFolder` (string): Path to directory containing Markdown files
- `targetFolder` (string): Path where HTML files will be written
- `templatePath` (string, optional): Path to a custom HTML template

**Features:**
- Automatically creates target directory if it doesn't exist
- Skips files that fail to convert and continues processing
- Provides detailed console output for each conversion
- Reports success/failure counts

## AI-Assisted Development

This project was developed with significant assistance from **GitHub Copilot**, demonstrating the power of AI-powered development tools in modern software engineering.

### File Processing Logic Refactoring

GitHub Copilot played a crucial role in refactoring the file processing logic:

- **Error Handling Enhancement**: Copilot suggested wrapping critical file operations in try-catch blocks, transforming the initial throw-based error approach into a more user-friendly logging system that allows batch processing to continue even when individual files fail.

- **Graceful Degradation**: The AI assistant helped implement a robust error recovery system that tracks success/failure counts and provides detailed console feedback, making the tool more resilient in production environments.

- **Code Organization**: Copilot recommended separating concerns by creating dedicated functions for different operations, improving code maintainability and testability.

### Test Suite Generation

The comprehensive test suite was largely generated and refined with Copilot's assistance:

- **Test Structure**: Copilot provided the initial Jest configuration and test file structure, setting up proper mocking for the `fs-extra` library.

- **Edge Case Coverage**: The AI identified critical edge cases including empty strings, nested structures, and error scenarios that might not have been immediately obvious.

- **Mock Implementation**: Copilot generated sophisticated file system mocks that simulate real-world scenarios without touching actual files, enabling fast and reliable tests.

- **Security Testing**: The AI proactively suggested testing script tag handling and included documentation about the security implications of using marked without sanitization.

### Development Workflow Improvements

Beyond code generation, Copilot enhanced the development workflow by:

- Suggesting appropriate npm scripts for testing and development
- Recommending TypeScript configuration optimizations
- Providing inline documentation and JSDoc comments
- Identifying potential bugs before they reached testing

This project demonstrates how AI-assisted development can accelerate creation of production-ready code while maintaining high quality standards and comprehensive test coverage.

## Dependencies

### Runtime Dependencies
- **[marked](https://marked.js.org/)** (^12.0.0) - Fast, standards-compliant Markdown parser
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)** (^11.2.0) - Enhanced file system methods
- **[commander](https://github.com/tj/commander.js)** (^12.0.0) - Complete CLI solution

### Development Dependencies
- **TypeScript** (^5.3.3) - Type-safe JavaScript
- **Jest** (^29.7.0) - Testing framework
- **ts-jest** (^29.1.1) - TypeScript preprocessor for Jest
- **ts-node** (^10.9.2) - TypeScript execution engine

---
