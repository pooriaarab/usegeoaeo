import { describe, expect, it } from "vitest";
import { humanizeText } from "../src/humanize.js";

describe("humanizeText", () => {
  it("replaces em dash ranges and punctuation", () => {
    expect(humanizeText("Read 1—3 pages — then decide.").text).toBe(
      "Read 1 to 3 pages, then decide.",
    );
  });

  it("replaces curly quotes and contractions stay intact", () => {
    expect(humanizeText("“It’s useful,” she said.").text).toBe('"It\'s useful," she said.');
  });

  it("replaces AI vocabulary", () => {
    expect(humanizeText("Use a seamless, robust workflow to leverage the tool.").text).toBe(
      "Use a simple, strong workflow to use the tool.",
    );
  });

  it("replaces copula avoidance", () => {
    expect(humanizeText("The page serves as a guide and boasts clear examples.").text).toBe(
      "The page is a guide and has clear examples.",
    );
  });

  it("removes filler and negative parallelism", () => {
    expect(
      humanizeText(
        "In order to help, it's not just fast, it's reliable. At the end of the day, it works.",
      ).text,
    ).toBe("To help, reliable. it works.");
  });

  it("removes fake depth tails and three-word padding", () => {
    expect(
      humanizeText("It is innovative, intuitive, and powerful, highlighting a seamless experience.")
        .text,
    ).toBe("It is innovative and intuitive.");
  });

  it("uses sentence case headings and removes hype closers", () => {
    expect(
      humanizeText("## A Better Product Experience\n\nThe future looks bright for the tool.").text,
    ).toBe("## A better product experience\n\n");
  });

  it("does not edit code blocks, tags, or JSX expressions", () => {
    const source = '<p className="robust">A robust tool</p> {value}';
    expect(humanizeText(source).text).toBe('<p className="robust">A strong tool</p> {value}');
  });
});
