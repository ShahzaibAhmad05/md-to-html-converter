#!/usr/bin/env node

import { Command } from 'commander';
import { convertMarkdownToHtml } from './converter';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

program
  .name('md-to-html')
  .description('CLI tool to convert Markdown files to HTML')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a Markdown file to HTML')
  .argument('<input>', 'Input Markdown file path')
  .option('-o, --output <path>', 'Output HTML file path')
  .option('-t, --template <path>', 'HTML template file path')
  .action(async (input: string, options: { output?: string; template?: string }) => {
    try {
      const inputPath = path.resolve(input);
      
      // Check if input file exists
      if (!await fs.pathExists(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
      }

      // Determine output path
      const outputPath = options.output 
        ? path.resolve(options.output)
        : inputPath.replace(/\.md$/i, '.html');

      // Read markdown content
      const markdown = await fs.readFile(inputPath, 'utf-8');

      // Convert to HTML
      const html = await convertMarkdownToHtml(markdown, options.template);

      // Write HTML output
      await fs.writeFile(outputPath, html, 'utf-8');

      console.log(`✓ Successfully converted: ${inputPath} → ${outputPath}`);
    } catch (error) {
      console.error('Error during conversion:', error);
      process.exit(1);
    }
  });

program.parse();
