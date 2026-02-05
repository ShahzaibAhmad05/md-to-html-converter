# Markdown to HTML Converter

A simple CLI tool to convert Markdown files to HTML using TypeScript.

## Features

- Convert Markdown files to HTML
- GitHub Flavored Markdown support
- Custom HTML templates
- Clean, styled default output
- TypeScript-based

## Installation

```bash
npm install
npm run build
```

## Usage

### Convert a Markdown file:

```bash
npm run dev convert input.md
```

### Specify output file:

```bash
npm run dev convert input.md -o output.html
```

### Use a custom template:

```bash
npm run dev convert input.md -t template.html
```

## Template Format

Custom templates should include a `{{content}}` placeholder where the converted HTML will be inserted:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Custom Template</title>
</head>
<body>
  {{content}}
</body>
</html>
```

## Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the CLI tool with ts-node
- `npm run watch` - Watch for changes and recompile
- `npm run clean` - Remove build output

## Dependencies

- **marked** - Fast Markdown parser
- **fs-extra** - Enhanced file system operations
- **commander** - Command-line interface framework
