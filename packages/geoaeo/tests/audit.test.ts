import { describe, expect, it } from 'vitest';
import { analyzePage, scoreAuditChecks, type AuditCheck } from '../src/audit.js';

function check(passed: boolean, weight: number): AuditCheck {
  return { id: String(weight), label: 'check', passed, weight, details: '' };
}

describe('answerability signals', () => {
  it('detects direct answer, question framing, freshness, author, and heading order', () => {
    const html =
      '<html><head><title>X</title><meta name="author" content="Ada"></head><body>' +
      '<h1>What is X?</h1>' +
      '<p>X is a small tool that makes any site quotable by AI answer engines, fast.</p>' +
      '<h2>How does it work?</h2><time>2026-01-01</time></body></html>';
    const signals = analyzePage(html, true);
    expect(signals.directAnswer).toBe(true);
    expect(signals.questionHeadings).toBe(true);
    expect(signals.author).toBe(true);
    expect(signals.freshness).toBe(true);
    expect(signals.headingOrder).toBe(true);
  });

  it('flags a bare page as unanswerable', () => {
    const signals = analyzePage('<html><body><div>hi</div></body></html>', true);
    expect(signals.directAnswer).toBe(false);
    expect(signals.questionHeadings).toBe(false);
    expect(signals.author).toBe(false);
  });

  it('reads @type from a @graph-wrapped JSON-LD block', () => {
    const graph = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: "X" },
        { "@type": "WebSite", name: "X" },
      ],
    });
    const signals = analyzePage(
      `<html><head><script type="application/ld+json">${graph}</script></head><body><h1>Hi</h1></body></html>`,
      true
    );
    expect(signals.jsonLd).toBe(true);
    expect(signals.jsonLdTypes).toContain("Organization");
    expect(signals.jsonLdTypes).toContain("WebSite");
  });
});

describe('audit scorer', () => {
  it('returns zero for no checks', () => {
    expect(scoreAuditChecks([])).toBe(0);
  });

  it('uses weighted pass scores', () => {
    expect(scoreAuditChecks([check(true, 80), check(false, 20)])).toBe(80);
  });

  it('rounds partial scores to the nearest integer', () => {
    expect(scoreAuditChecks([check(true, 1), check(false, 2)])).toBe(33);
  });
});

