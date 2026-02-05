import { marked } from 'marked';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Converts Markdown content to HTML
 * @param markdown - The markdown content to convert
 * @param templatePath - Optional path to an HTML template file
 * @returns The converted HTML content
 */
export async function convertMarkdownToHtml(
  markdown: string,
  templatePath?: string
): Promise<string> {
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
  });

  // Convert markdown to HTML
  const content = await marked.parse(markdown);

  // If a template is provided, use it
  if (templatePath) {
    const template = await fs.readFile(path.resolve(templatePath), 'utf-8');
    return template.replace('{{content}}', content);
  }

  // Otherwise, return a basic HTML document
  return createDefaultHtmlDocument(content);
}

/**
 * Creates a default HTML document with the converted content
 * @param content - The converted HTML content
 * @returns A complete HTML document
 */
function createDefaultHtmlDocument(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background-color: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background-color: #f4f4f4;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin-left: 0;
      padding-left: 1rem;
      color: #666;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    table th,
    table td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    table th {
      background-color: #f4f4f4;
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
}
