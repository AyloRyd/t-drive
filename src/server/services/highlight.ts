import "server-only";

import { bundledLanguages, bundledLanguagesAlias, codeToHtml } from "shiki";

const THEME = "github-dark";

/**
 * Highlighting is quadratic-ish on pathological input, so very large files are
 * rendered as plain text instead of being tokenized.
 */
const HIGHLIGHT_LIMIT_BYTES = 300 * 1024;

function resolveLanguage(language: string): string {
  if (language in bundledLanguages || language in bundledLanguagesAlias) {
    return language;
  }
  return "text";
}

/** Returns Shiki-rendered HTML, or null when the file should render as plain text. */
export async function highlightCode(
  code: string,
  language: string,
): Promise<string | null> {
  if (code.length > HIGHLIGHT_LIMIT_BYTES) return null;

  try {
    return await codeToHtml(code, {
      lang: resolveLanguage(language),
      theme: THEME,
    });
  } catch (error) {
    console.error("Highlighting failed:", error);
    return null;
  }
}
