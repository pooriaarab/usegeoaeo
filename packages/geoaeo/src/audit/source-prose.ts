/**
 * Approximate the words a reader would see in a JSX/TSX source file.
 *
 * A directory audit has no rendered DOM, so the source path cannot copy the
 * HTML path (cheerio on visible text). This strips the tokens that are not
 * prose — import/export statements, JSX attribute values, and tag names —
 * then counts what is left. Interpolated `{children}` still count their
 * identifier, and leftover `export default function` keywords still count.
 * Missing runtime text is the safe direction: a false FAIL sends someone to
 * look at the page; a false PASS ships a stub.
 */
export function extractSourceProse(source: string): string {
  const withoutModules = stripImportExportStatements(source);
  const withoutQuotedAttrs = stripQuotedAttributeValues(withoutModules);
  const withoutBraceAttrs = stripAttributeBraceValues(withoutQuotedAttrs);
  return stripJsxTags(withoutBraceAttrs);
}

/** Line-level `import ...` and `export { ... }` / `export * from`. Leaves `export default function` bodies intact. */
function stripImportExportStatements(source: string): string {
  return source
    .replaceAll(
      /^[ \t]*import(?:\s+type)?\s*(?:[\s\S]*?\sfrom\s*)?['"][^'"]+['"]\s*;?[ \t]*$/gm,
      " ",
    )
    .replaceAll(
      /^[ \t]*export\s+(?:\*(?:\s+as\s+\w+)?\s+from\s+['"][^'"]+['"]|\{[^}]*\}\s*(?:from\s+['"][^'"]+['"])?)\s*;?[ \t]*$/gm,
      " ",
    );
}

/** `className="..."`, `href='...'`, and other quoted JSX attribute values. */
function stripQuotedAttributeValues(source: string): string {
  return source.replaceAll(/(\s+[A-Za-z_:][\w:-]*\s*=\s*)(?:"[^"]*"|'[^']*'|`[^`]*`)/g, "$1");
}

function skipQuoted(source: string, start: number): number {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === "\\") {
      index += 2;
      continue;
    }
    if (source[index] === quote) return index + 1;
    index += 1;
  }
  return source.length;
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let index = openIndex;
  while (index < source.length) {
    const char = source[index];
    if (char === '"' || char === "'" || char === "`") {
      index = skipQuoted(source, index);
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
}

/** `className={...}`, `href={...}`, `onClick={...}` — only values that follow `attr=`. */
function stripAttributeBraceValues(source: string): string {
  const attrEquals = /\s+[A-Za-z_:][\w:-]*\s*=\s*/g;
  let result = "";
  let last = 0;
  let match = attrEquals.exec(source);
  while (match) {
    const valueIndex = match.index + match[0].length;
    if (source[valueIndex] !== "{") {
      attrEquals.lastIndex = valueIndex;
      match = attrEquals.exec(source);
      continue;
    }
    const close = findMatchingBrace(source, valueIndex);
    if (close === -1) break;
    result += source.slice(last, valueIndex);
    last = close + 1;
    attrEquals.lastIndex = last;
    match = attrEquals.exec(source);
  }
  return result + source.slice(last);
}

/** Opening, closing, and self-closing JSX/HTML tags, including leftover empty attributes. */
function stripJsxTags(source: string): string {
  return source.replaceAll(/<\/?[A-Za-z][\w.-]*[^>]*>/g, " ");
}
