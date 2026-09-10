# Basic contact form

Started this project with no AI instruction files — no `AGENTS.md`, no Cursor rules, no skill docs — to see how the model behaved from prompts alone.

The first ask was just a local environment. Setup went further than I expected: it also built working form examples. Useful as a starting point, but I had not asked for that yet.

The first form implementation coupled status messages and form validation into the form component. That made the file harder to read and maintain. We split the status messages into their own file in this folder. Validation is still in the form.

The submit handler used React's deprecated `FormEvent`. The current types want `SubmitEvent` instead. Easy to miss if you are not watching the deprecation warnings.

The model preferred native HTML form elements over a third-party library. That is neither good nor bad on its own. A library could give more coverage for what we want, though, and I do not think the AI naturally weighs that before it starts writing code.

I had to ask for an ADA / WCAG review. Until then the model treated the form as “accessible enough” because it had labels, an error summary, and an axe-clean idle page. What it had not done:

- Failed `onSubmit` only logged to the console. No error in the UI, so a failed send was invisible.
- The sending state was a disabled button label and `aria-busy`. That is not a status message, so many screen readers would not announce that the form was processing.
- Input borders were under 3:1 contrast (WCAG 1.4.11). axe does not catch that.
- The error summary was focused in JS, but focus styles used `:focus-visible`, which often does not apply to programmatic focus, so the focus move could be invisible.
- Required was on the control (and announced by many AT) but not in the visible label. Sighted users only learned a field was required after a failed submit.

Page title was also only “Ideal” on every route. We skipped that on purpose.
