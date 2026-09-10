# Contact form

For a basic contact form, the ideal component is custom-made, with full ADA coverage, using Tailwind CSS for styles.

Borders have to meet accessibility contrast (WCAG 1.4.11). When alerts or other messages appear, focus should move to a place that makes it easy to tab into the intended input.

Libraries can help if you are integrating other complex components. For a simple form they tend not to simplify anything. Even React Aria mostly helped with syntax — nesting related items — and did not really save code.

Still undecided whether a theme should come from a third-party library like MUI or shadcn/ui. Right now the signs point to writing your own UI component library.

## ADA suite

Shared checks in `ContactForm.a11y.test.tsx`. Inapplicable checks (no Close, no error summary, no asterisk) are skipped. Basic and React Aria passed every applicable check.

| Variation | Check | WCAG | Severity |
|---|---|---|---|
| MUI | Required asterisks are not explained | 3.3.2 | Low |
| shadcn/ui | Field errors are not the accessible description | 1.3.1 / 4.1.2 | High |
| RJSF | `aria-describedby` points at missing ids when idle | 1.3.1 / 4.1.2 | High |
| RJSF | Invalid fields are not marked `aria-invalid` | 4.1.2 | High |
| RJSF | `aria-describedby` still points at missing ids after a failed submit | 1.3.1 / 4.1.2 | High |
| RJSF | Error summary is not exposed as an alert | 3.3.1 / 4.1.2 | High |
| RJSF | Focus does not move to the error summary | 3.3.1 | Medium |

## Contrast

Not in the shared suite. Axe 1.4.3 (text) is clean in light mode for every variation. In dark, MUI fails: labels 1.91:1 and the Submit button 1.82:1. Axe does not check 1.4.11 (control borders).

| Variation | Text (1.4.3) | Borders (1.4.11) | Severity |
|---|---|---|---|
| Basic | Pass | Pass (~4.3:1) | — |
| React Aria | Pass | Pass (~4.3:1) | — |
| RJSF | Pass | Pass (same `--color-line`) | — |
| MUI | Fail in dark | Fail (~1.7:1 default outline) | High |
| shadcn/ui | Pass | Fail (~1.2:1 default input) | High |
