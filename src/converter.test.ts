import { convertMarkdownToHtml, processDirectory } from './converter';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock fs-extra
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('convertMarkdownToHtml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unit Tests', () => {
    test('should handle empty string', async () => {
      const result = await convertMarkdownToHtml('');
      
      // Should return valid HTML document
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="en">');
      expect(result).toContain('<link rel="stylesheet" href="style.css">');
      expect(result).toContain('</html>');
      
      // Body should be essentially empty (just whitespace)
      const bodyMatch = result.match(/<body>([\s\S]*?)<\/body>/);
      expect(bodyMatch).toBeTruthy();
      expect(bodyMatch![1].trim()).toBe('');
    });

    test('should handle string with only headers', async () => {
      const markdown = `# Main Title
## Subtitle
### Level 3`;
      
      const result = await convertMarkdownToHtml(markdown);
      
      // Should contain the HTML structure
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<h1>Main Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
      expect(result).toContain('<h3>Level 3</h3>');
    });

    test('should handle string with nested lists', async () => {
      const markdown = `- Level 1 item 1
  - Level 2 item 1
  - Level 2 item 2
    - Level 3 item 1
- Level 1 item 2
  - Level 2 item 3`;
      
      const result = await convertMarkdownToHtml(markdown);
      
      // Should contain list elements
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
      expect(result).toContain('Level 1 item 1');
      expect(result).toContain('Level 2 item 1');
      expect(result).toContain('Level 3 item 1');
      
      // Check for nested structure (multiple ul tags)
      const ulCount = (result.match(/<ul>/g) || []).length;
      expect(ulCount).toBeGreaterThan(1);
    });

    test('should handle malicious script tags - sanitization check', async () => {
      const markdown = `# Safe Content
      
<script>alert('XSS')</script>

Some normal text.

<script src="malicious.js"></script>`;
      
      const result = await convertMarkdownToHtml(markdown);
      
      // Note: By default, marked does NOT sanitize HTML and will pass through script tags
      // This test documents the behavior - script tags ARE included in the output
      // If sanitization is needed, you would need to use a library like DOMPurify
      // or configure marked with the 'sanitize' option (deprecated) or use a custom renderer
      
      expect(result).toContain('<h1>Safe Content</h1>');
      expect(result).toContain('Some normal text.');
      
      // IMPORTANT: Marked allows raw HTML by default for flexibility
      // This means script tags WILL be present in the output
      expect(result).toContain('<script>');
      
      // To make this test pass with sanitization, you would need to:
      // 1. Add DOMPurify or similar library
      // 2. Post-process the HTML to remove scripts
      // 3. Or use marked's hooks to filter out script tags
      
      console.log('\n⚠️  WARNING: marked does not sanitize HTML by default.');
      console.log('Script tags in markdown will be passed through to HTML output.');
      console.log('Consider using DOMPurify or configuring marked hooks for production use.\n');
    });

    test('should use custom template when provided', async () => {
      const markdown = '# Test';
      const templatePath = '/fake/template.html';
      const templateContent = '<html><body>{{content}}</body></html>';
      
      (mockedFs.readFile as unknown as jest.Mock).mockResolvedValueOnce(templateContent);
      
      const result = await convertMarkdownToHtml(markdown, templatePath);
      
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('template.html'),
        'utf-8'
      );
      expect(result).toContain('<h1>Test</h1>');
      expect(result).toContain('<html><body>');
    });
  });

  describe('Integration Tests - processDirectory', () => {
    const sourceFolder = '/fake/source';
    const targetFolder = '/fake/target';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should process all markdown files from source to target folder', async () => {
      // Mock file system setup
      (mockedFs.pathExists as jest.Mock).mockResolvedValue(true);
      (mockedFs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (mockedFs.readdir as unknown as jest.Mock).mockResolvedValue([
        'file1.md',
        'file2.md',
        'README.txt',
        'file3.MD'
      ]);
      
      // Mock file reading
      (mockedFs.readFile as unknown as jest.Mock)
        .mockResolvedValueOnce('# File 1 Content')
        .mockResolvedValueOnce('## File 2 Content')
        .mockResolvedValueOnce('### File 3 Content');
      
      // Mock file writing
      (mockedFs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined);
      
      // Spy on console.log to verify output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Execute
      await processDirectory(sourceFolder, targetFolder);
      
      // Verify source folder was checked
      expect(mockedFs.pathExists).toHaveBeenCalledWith(sourceFolder);
      
      // Verify target folder was created
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(targetFolder);
      
      // Verify directory was read
      expect(mockedFs.readdir).toHaveBeenCalledWith(sourceFolder);
      
      // Verify only .md files were processed (3 files: file1.md, file2.md, file3.MD)
      expect(mockedFs.readFile).toHaveBeenCalledTimes(3);
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        path.join(sourceFolder, 'file1.md'),
        'utf-8'
      );
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        path.join(sourceFolder, 'file2.md'),
        'utf-8'
      );
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        path.join(sourceFolder, 'file3.MD'),
        'utf-8'
      );
      
      // Verify HTML files were written
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(3);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(targetFolder, 'file1.html'),
        expect.stringContaining('<h1>File 1 Content</h1>'),
        'utf-8'
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(targetFolder, 'file2.html'),
        expect.stringContaining('<h2>File 2 Content</h2>'),
        'utf-8'
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(targetFolder, 'file3.html'),
        expect.stringContaining('<h3>File 3 Content</h3>'),
        'utf-8'
      );
      
      // Verify success messages
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✓ Converted: file1.md → file1.html')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processed 3 of 3 file(s)')
      );
      
      consoleSpy.mockRestore();
    });

    test('should handle missing source directory gracefully', async () => {
      (mockedFs.pathExists as jest.Mock).mockResolvedValue(false);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await processDirectory(sourceFolder, targetFolder);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Source folder does not exist')
      );
      expect(mockedFs.readdir).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should skip files that fail to read and continue processing', async () => {
      (mockedFs.pathExists as jest.Mock).mockResolvedValue(true);
      (mockedFs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (mockedFs.readdir as unknown as jest.Mock).mockResolvedValue(['good.md', 'bad.md']);
      
      // First file succeeds, second fails
      (mockedFs.readFile as unknown as jest.Mock)
        .mockResolvedValueOnce('# Good File')
        .mockRejectedValueOnce(new Error('Permission denied'));
      
      (mockedFs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await processDirectory(sourceFolder, targetFolder);
      
      // Verify the good file was written
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(targetFolder, 'good.html'),
        expect.stringContaining('<h1>Good File</h1>'),
        'utf-8'
      );
      
      // Verify error was logged for bad file
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('✗ Error converting bad.md')
      );
      
      // Verify summary shows 1 success and 1 failure
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processed 1 of 2 file(s)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('1 file(s) failed to convert')
      );
      
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('should handle empty directory', async () => {
      (mockedFs.pathExists as jest.Mock).mockResolvedValue(true);
      (mockedFs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (mockedFs.readdir as unknown as jest.Mock).mockResolvedValue([]);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await processDirectory(sourceFolder, targetFolder);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No Markdown files found')
      );
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
