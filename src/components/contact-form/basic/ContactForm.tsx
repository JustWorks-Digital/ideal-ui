import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { errorForValue, type FieldDefinition } from './field.ts'
import { Field } from './Field.tsx'
import { StatusMessages, type Errors, type Status } from './StatusMessages.tsx'

export type { FieldDefinition, FieldMessages, FieldType } from './field.ts'

export function ContactForm({
  fields,
  submitLabel = 'Submit',
  action,
  method = 'post',
  onSubmit,
}: {
  fields: readonly FieldDefinition[]
  submitLabel?: string
  action?: string
  method?: 'get' | 'post'
  onSubmit?: (data: FormData) => void | Promise<void>
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [alertFocusKey, setAlertFocusKey] = useState(0)
  const pendingRef = useRef(false)
  const hasRequired = fields.some((field) => field.required)

  useEffect(() => {
    if (status === 'error' && !submitError && Object.keys(errors).length === 0) {
      setStatus('idle')
    }
  }, [errors, status, submitError])

  function dismissMessages() {
    formRef.current?.focus()
    setStatus('idle')
    setSubmitError(undefined)
  }

  function handleValueChange(name: string, value: string) {
    const field = fields.find((item) => item.name === name)
    if (!field) {
      return
    }

    setErrors((prev) => {
      if (!prev[name]) {
        return prev
      }

      const error = errorForValue(value.trim(), field)
      if (error) {
        return { ...prev, [name]: error }
      }

      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (pendingRef.current) {
      event.preventDefault()
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)
    const nextErrors: Errors = {}

    for (const field of fields) {
      const value = String(data.get(field.name) ?? '').trim()
      const error = errorForValue(value, field)
      if (error) {
        nextErrors[field.name] = error
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault()
      setSubmitError(undefined)
      setStatus('error')
      setErrors(nextErrors)
      setAlertFocusKey((key) => key + 1)
      return
    }

    if (onSubmit) {
      event.preventDefault()
      pendingRef.current = true
      setPending(true)
      setSubmitError(undefined)
      try {
        await onSubmit(data)
        setErrors({})
        setStatus('success')
        form.reset()
      } catch (error) {
        console.error(error)
        setStatus('error')
        setSubmitError('Could not send the message.')
        setAlertFocusKey((key) => key + 1)
      } finally {
        pendingRef.current = false
        setPending(false)
      }
      return
    }

    if (!action) {
      event.preventDefault()
      setErrors({})
      setStatus('success')
      form.reset()
    }
  }

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      action={action}
      method={method}
      onSubmit={handleSubmit}
      aria-busy={pending || undefined}
      tabIndex={-1}
      noValidate
    >
      <StatusMessages
        status={status}
        errors={errors}
        fields={fields}
        pending={pending}
        submitError={submitError}
        alertFocusKey={alertFocusKey}
        onDismiss={dismissMessages}
      />

      <fieldset className="m-0 grid gap-4 border-0 p-0">
        <legend className="p-0 font-semibold">Contact</legend>
        {hasRequired ? (
          <p className="m-0 text-[0.95rem] text-muted">
            Required fields are marked with an asterisk (
            <span aria-hidden="true">*</span>).
          </p>
        ) : null}

        {fields.map((field) => (
          <Field
            key={field.id}
            {...field}
            error={errors[field.name]}
            readOnly={pending}
            onValueChange={handleValueChange}
          />
        ))}
      </fieldset>

      <button
        className="justify-self-start rounded-lg bg-accent px-4 py-2.5 font-semibold text-on-accent disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
