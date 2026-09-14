# geoaeo Design Guide

## Overview

geoaeo uses a quiet, technical interface that makes audits and generated
artifacts easy to scan. The site demonstrates the same direct, answer-first
practice that the package recommends. Use existing semantic tokens and shared
UI primitives before adding styles or components.

## Colors

Use the semantic tokens in `apps/website/app/globals.css`. The neutral scale is
a flat Swiss palette of black, white, and grays. Do not use raw gray utilities.
Red is reserved for the `destructive`/`error` families; it is not a button
color. Primary buttons stay foreground-on-background (black on white in light
mode, white on black in dark mode).

Core light tokens:

- Background: `#ffffff`.
- Foreground: `#111111`.
- Card: `#f2f2f2`.
- Primary: `#111111`.
- Muted: `#f2f2f2` (muted foreground `#5c5555`).
- Border: `#d8d4d4`.
- Destructive/error: `#c8102e`.

Core dark tokens:

- Background: `#0a0a0a`.
- Foreground: `#f2f2f2`.
- Card: `#161616`.
- Primary: `#f2f2f2`.
- Muted: `#161616` (muted foreground `#a09a9a`).
- Border: `#282424`.
- Destructive/error: `#ff4438`.

Use the `success`, `warning`, `error`, and `info` families only for their named
states. Check contrast in light and dark themes.

## Typography

Use Archivo for interface and prose. Use Roboto Mono for commands, code,
scores, and the `geoaeo` wordmark. Both load at weights 400, 500, 600, and 700.
In code, disable ligatures and use a slashed zero. Use tabular numbers for
scores and structured data.

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

Use borders and surface tokens for depth, not shadows. `shadow-subtle`,
`shadow-keystone`, and `shadow-floating` all resolve to `none`; do not add new
box-shadow utilities to fake elevation.

Use 150–300 ms transitions for state changes. Honor `prefers-reduced-motion`.
Never require animation to understand status or progress.

## Shapes

The base radius is `0`. Every derived radius token (`rounded-sm` through
`rounded-4xl`) resolves to `0`; do not add a hardcoded radius to work around it.

The logo is a square with a lowercase `g`. Keep it monochrome and
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
