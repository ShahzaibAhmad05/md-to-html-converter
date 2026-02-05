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
  <link rel="stylesheet" href="style.css">
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

/**
 * Processes all Markdown files in a directory and converts them to HTML
 * @param sourceFolder - Path to the folder containing .md files
 * @param targetFolder - Path to the folder where HTML files will be written
 * @param templatePath - Optional path to an HTML template file
 * @returns Promise that resolves when all files are processed
 */
export async function processDirectory(
  sourceFolder: string,
  targetFolder: string,
  templatePath?: string
): Promise<void> {
  // Ensure source folder exists
  if (!await fs.pathExists(sourceFolder)) {
    console.error(`Error: Source folder does not exist: ${sourceFolder}`);
    return;
  }

  // Create target folder if it doesn't exist
  try {
    await fs.ensureDir(targetFolder);
  } catch (error) {
    console.error(`Error: Could not create target folder: ${targetFolder}`);
    console.error(error instanceof Error ? error.message : String(error));
    return;
  }

  // Read all files in the source folder
  let files: string[];
  try {
    files = await fs.readdir(sourceFolder);
  } catch (error) {
    console.error(`Error: Could not read source folder: ${sourceFolder}`);
    console.error(error instanceof Error ? error.message : String(error));
    return;
  }

  // Filter for .md files
  const markdownFiles = files.filter(file => file.toLowerCase().endsWith('.md'));

  if (markdownFiles.length === 0) {
    console.log(`No Markdown files found in ${sourceFolder}`);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  // Process each markdown file
  for (const file of markdownFiles) {
    const inputPath = path.join(sourceFolder, file);
    const outputFileName = file.replace(/\.md$/i, '.html');
    const outputPath = path.join(targetFolder, outputFileName);

    try {
      // Read markdown content
      const markdown = await fs.readFile(inputPath, 'utf-8');

      // Convert to HTML
      const html = await convertMarkdownToHtml(markdown, templatePath);

      // Write HTML output
      await fs.writeFile(outputPath, html, 'utf-8');

      console.log(`✓ Converted: ${file} → ${outputFileName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error converting ${file}:`);
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log(`\nProcessed ${successCount} of ${markdownFiles.length} file(s) from ${sourceFolder} to ${targetFolder}`);
  if (errorCount > 0) {
    console.log(`${errorCount} file(s) failed to convert`);
  }
}
