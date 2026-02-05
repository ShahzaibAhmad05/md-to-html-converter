/**
 * Configuration interface for the Markdown to HTML converter project
 */
export interface ProjectConfig {
  /**
   * Path to the directory containing input Markdown files
   */
  inputDirectory: string;

  /**
   * Path to the directory where HTML files will be output
   */
  outputDirectory: string;

  /**
   * Whether to include a timestamp in the output file names
   */
  includeTimestamp: boolean;
}
