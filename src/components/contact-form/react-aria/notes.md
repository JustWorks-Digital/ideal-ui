# React Aria contact form

React Aria is a good library to use when you want additional ADA coverage without taking on a visual design system.

It owns field-level accessibility: label/control association, `aria-invalid`, `aria-describedby`, required state, and field errors. Nest `Label`, `Input`/`TextArea`, and `FieldError` inside `TextField` and it wires those attributes through React context. You still style the DOM yourself.

That coverage matters more as the UI gets harder than a text field — select, combobox, date picker, menu, dialog, tabs. Native HTML is enough for name/email/message; React Aria does not replace the error summary, success/sending status, Close, or focus management we still write ourselves.

It is a better fit for this series than MUI. Adding it is an accessibility/behavior choice, not a “this app now looks like Material” choice.
