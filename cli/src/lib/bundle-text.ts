/**
 * Reduces token count for **embedded** bundles (Codex / Claude / Windsurf).
 * On-disk `.md` under `layers.source` stays unchanged for humans + Cursor file reads.
 */
export function minifyMarkdownForBundle(input: string): string {
  let s = input;
  // Headings → plain lines (keep text, drop # weight)
  s = s.replace(/^#{1,6}\s+/gm, '');
  // Bold / italic (common in our layers)
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  // Horizontal rules → single newline
  s = s.replace(/^\s*---\s*$/gm, '\n');
  // Collapse excessive blank lines
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}
