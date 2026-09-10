import { type ChangeEvent } from 'react'
import { type FieldDefinition } from './field.ts'
import {
  controlClass,
  fieldClass,
  fieldErrorClass,
  labelClass,
} from './styles.ts'

export function Field({
  id,
  name,
  label,
  messages,
  error,
  required,
  type = 'text',
  autoComplete,
  rows,
  readOnly,
  onValueChange,
}: FieldDefinition & {
  error?: string
  readOnly?: boolean
  onValueChange?: (name: string, value: string) => void
}) {
  const errorId = `${id}-error`
  const describedBy = error ? errorId : undefined

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onValueChange?.(event.currentTarget.name, event.currentTarget.value)
  }

  return (
    <div className={fieldClass}>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          className={controlClass}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          data-message-required={messages.required}
          data-message-invalid={messages.invalid}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={controlClass}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          data-message-required={messages.required}
          data-message-invalid={messages.invalid}
          onChange={handleChange}
        />
      )}
      {error ? (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
