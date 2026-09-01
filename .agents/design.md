# geoaeo Design Guide

## Overview

geoaeo uses a quiet, technical interface that makes audits and generated
artifacts easy to scan. The site demonstrates the same direct, answer-first
practice that the package recommends. Use existing semantic tokens and shared
UI primitives before adding styles or components.

## Colors

Use the semantic tokens in `apps/website/app/globals.css`. The neutral scale has
a subtle cool tint at OKLCH hue 250. Do not use raw gray utilities.

Core light tokens:

- Background: `oklch(0.99 0.002 250)`.
- Foreground: `oklch(0.145 0.01 250)`.
- Card: `oklch(1 0.002 250)`.
- Primary: `oklch(0.205 0.01 250)`.
- Muted: `oklch(0.97 0.005 250)`.
- Border: `oklch(0.922 0.005 250)`.

Core dark tokens:

- Background: `oklch(0.15 0.01 250)`.
- Foreground: `oklch(0.95 0.005 250)`.
- Card: `oklch(0.2 0.01 250)`.
- Primary: `oklch(0.88 0.008 250)`.
- Muted: `oklch(0.27 0.01 250)`.
- Border: `oklch(1 0.005 250 / 12%)`.

Use the `success`, `warning`, `error`, and `info` families only for their named
states. Check contrast in light and dark themes.

## Typography

Use Geist Sans for interface and prose. Use Geist Mono for commands, code,
scores, and the `geoaeo` wordmark. In code, disable ligatures and use a slashed
zero. Use tabular numbers for scores and structured data.

Use balanced wrapping for headings and natural wrapping for paragraphs. Keep
body copy short. Use fluid display sizes only where the existing utilities
provide them.

## Layout

Use a centered `max-w-6xl` shell with 20 px side padding for primary pages. Keep
hero content near `max-w-3xl` and explanatory copy near `max-w-2xl`. Use 16 px
to 24 px gaps inside compact components. Use 64 px to 96 px vertical padding on
marketing sections.

Use responsive grids for equal feature or reference cards. Stack primary and
secondary actions on narrow screens. Keep navigation and calls to action clear
without competing with the page answer.

## Elevation & Depth

Prefer borders and surface tokens. Use the three defined shadows sparingly:

- `shadow-subtle` for a small surface lift.
- `shadow-keystone` for prominent panels.
- `shadow-floating` for overlays and popovers.

Use 150–300 ms transitions for state changes. Honor `prefers-reduced-motion`.
Never require animation to understand status or progress.

## Shapes

The base radius is `0.625rem`. Use derived radius tokens. Cards typically use
`rounded-xl`; controls and the logo use smaller radii.

The logo is a rounded square with a lowercase `g`. Keep it monochrome and
high-contrast. Use Lucide icons at the existing component size. Do not invent a
second logo or decorative icon family.

## Components

Reuse primitives from `@template/ui/primitives/*` and existing website
components. The main public patterns are:

- Landing header and footer.
- Hero, feature, process, pricing, and FAQ sections.
- Buttons, badges, code samples, cards, and responsive navigation.
- Docs headers, checklist items, examples, and hosted tool forms.
- Audit scores, generated artifact output, loading, empty, and error states.

Keep library, CLI, and MCP capability claims at parity. A polished component
must not advertise behavior that the package does not ship.

## Do's and Don'ts

- Do use semantic colors, shared primitives, and the existing spacing rhythm.
- Do lead each page with a direct answer and a clear next action.
- Do show commands and generated artifacts in copyable code surfaces.
- Do preserve keyboard focus and reduced-motion behavior.
- Don't use hardcoded gray colors or decorative gradients.
- Don't add unsupported commands, tools, generators, or pricing claims.
- Don't recolor, uppercase, stretch, or shadow the logo mark.
- Don't create a component when an existing primitive owns the pattern.
