/**
 * Recursively finds all README.md files within a given directory.
 * @param {string} dir - The directory to search.
 * @param {string} [lessonsDir] - An optional base directory to resolve relative paths.
 * @returns {string[]} An array of file paths to the found README.md files.
 */
export function findReadmes(dir: string, lessonsDir?: string): string[]

/**
 * Validates the structure and frontmatter of a single lesson's markdown content.
 * @param {string} rawContent - The raw markdown string to validate.
 * @param {string} [fileName] - An optional file name for error reporting context.
 * @returns {string[]} An array of validation error messages. Returns an empty array if valid.
 */
export function validateLessonContent(rawContent: string, fileName?: string): string[]

/**
 * Executes the validation suite across all lesson files in the specified directory.
 * @param {string} [lessonsDir] - The base directory containing lessons to validate. Defaults to the configured lessons path.
 * @returns {number} The total count of validation errors found. Returns 0 if all tests pass.
 */
export function runValidation(lessonsDir?: string): number
