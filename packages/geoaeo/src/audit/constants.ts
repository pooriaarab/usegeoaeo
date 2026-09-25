export const SKIPPED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'coverage']);
export const PAGE_EXTENSIONS = new Set(['.html', '.htm', '.tsx', '.jsx', '.mdx']);

/**
 * Minimum visible-word count folded into the `answerability` check.
 *
 * every-app/open-seo flags an indexable page under 150 words as thin-content.
 * That floor is classic SEO: "is this a real document, or a doorway?" Answer
 * engines cite a passage, not a whole article, so the floor here is lower.
 *
 * 100 words is one quote-length block (about 40–60 words) plus a short
 * supporting paragraph. A valid opening `<p>` is 40–200 characters in the
 * common case — roughly 8–35 words — so a heading plus that lede and almost
 * no body still fails, which is the case this check is named for. A
 * 600-character opening (~100 words) is the upper bound of "concise" and
 * may pass on its own because that opening is already a passage an engine
 * can quote.
 */
export const ANSWERABILITY_WORD_FLOOR = 100;
