import {
  useEffect,
  useRef,
  useState,
  type InvalidEvent,
  type ReactNode,
  type SubmitEvent,
} from 'react'
import {
  Button,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from 'react-aria-components'

export type FieldType = 'text' | 'email'

export type FieldMessages = {
  required?: string
  invalid?: string
}

export type FieldDefinition = {
  id: string
  name: string
  label: string
  messages: FieldMessages
  required?: boolean
  type?: FieldType
  autoComplete?: string
  rows?: number
}

type Status = 'idle' | 'error' | 'success'
type Errors = Record<string, string | undefined>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function errorForValue(
  value: string,
  field: Pick<FieldDefinition, 'required' | 'type' | 'messages'>,
): string | undefined {
  if (field.required && value === '') {
    return field.messages.required
  }

  if (field.type === 'email' && value !== '' && !emailPattern.test(value)) {
    return field.messages.invalid
  }

  return undefined
}

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
  const invalidHandledRef = useRef(false)
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

  function collectErrors(form: HTMLFormElement): Errors {
    const data = new FormData(form)
    const nextErrors: Errors = {}

    for (const field of fields) {
      const value = String(data.get(field.name) ?? '').trim()
      const error = errorForValue(value, field)
      if (error) {
        nextErrors[field.name] = error
      }
    }

    return nextErrors
  }

  function showFieldErrors(nextErrors: Errors) {
    setSubmitError(undefined)
    setStatus('error')
    setErrors(nextErrors)
    setAlertFocusKey((key) => key + 1)
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

  function handleInvalid(event: InvalidEvent<HTMLFormElement>) {
    event.preventDefault()
    if (invalidHandledRef.current) {
      return
    }
    invalidHandledRef.current = true
    queueMicrotask(() => {
      invalidHandledRef.current = false
    })
    showFieldErrors(collectErrors(event.currentTarget))
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (pendingRef.current) {
      event.preventDefault()
      return
    }

    const form = event.currentTarget
    const nextErrors = collectErrors(form)
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault()
      showFieldErrors(nextErrors)
      return
    }

    const data = new FormData(form)

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
      onInvalid={handleInvalid}
      onSubmit={handleSubmit}
      aria-busy={pending || undefined}
      tabIndex={-1}
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
            field={field}
            readOnly={pending}
            onValueChange={handleValueChange}
          />
        ))}
      </fieldset>

      <Button
        className="justify-self-start rounded-lg bg-accent px-4 py-2.5 font-semibold text-on-accent disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        isDisabled={pending}
      >
        {pending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}

function Field({
  field,
  readOnly,
  onValueChange,
}: {
  field: FieldDefinition
  readOnly?: boolean
  onValueChange: (name: string, value: string) => void
}) {
  return (
    <TextField
      id={field.id}
      name={field.name}
      type={field.type ?? 'text'}
      autoComplete={field.autoComplete}
      isRequired={field.required}
      isReadOnly={readOnly}
      className="grid gap-1.5"
      validate={(value) => errorForValue(String(value).trim(), field) ?? true}
      onChange={(value) => onValueChange(field.name, value)}
    >
      <Label className="font-semibold">
        {field.label}
        {field.required ? (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </Label>
      {field.rows ? (
        <TextArea
          rows={field.rows}
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-fg read-only:cursor-not-allowed read-only:opacity-60 disabled:cursor-not-allowed disabled:opacity-60"
        />
      ) : (
        <Input className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-fg read-only:cursor-not-allowed read-only:opacity-60 disabled:cursor-not-allowed disabled:opacity-60" />
      )}
      <FieldError className="m-0 text-[0.95rem] font-medium text-danger" />
    </TextField>
  )
}

function StatusMessages({
  status,
  errors,
  fields,
  pending,
  submitError,
  alertFocusKey,
  onDismiss,
}: {
  status: Status
  errors: Errors
  fields: readonly { id: string; name: string }[]
  pending?: boolean
  submitError?: string
  alertFocusKey?: number
  onDismiss: () => void
}) {
  if (pending) {
    return (
      <p className="sr-only" role="status">
        Sending…
      </p>
    )
  }

  if (status === 'success') {
    return (
      <Banner className="rounded-lg bg-ok-bg p-4 font-semibold text-ok" onDismiss={onDismiss}>
        <p className="m-0" role="status">
          Thanks — your message was sent.
        </p>
      </Banner>
    )
  }

  if (status === 'error' && submitError) {
    return (
      <Alert focusKey={alertFocusKey} onDismiss={onDismiss}>
        {submitError}
      </Alert>
    )
  }

  if (status === 'error') {
    return (
      <Alert focusKey={alertFocusKey} onDismiss={onDismiss}>
        <p className="mt-0 mb-1.5">Fix the following:</p>
        <ul className="m-0 list-disc pl-5">
          {fields.flatMap((field) => {
            const message = errors[field.name]
            return message
              ? [
                  <li key={field.id}>
                    <a className="text-danger" href={`#${field.id}`}>
                      {message}
                    </a>
                  </li>,
                ]
              : []
          })}
        </ul>
      </Alert>
    )
  }

  return null
}

function Alert({
  children,
  focusKey,
  onDismiss,
}: {
  children: ReactNode
  focusKey: unknown
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [focusKey])

  return (
    <div
      ref={ref}
      className="flex items-center justify-between gap-3 rounded-lg border border-danger bg-danger-bg p-4 text-danger"
      role="alert"
      tabIndex={-1}
    >
      <div className="min-w-0">{children}</div>
      <DismissButton onClick={onDismiss} />
    </div>
  )
}

function Banner({
  children,
  className,
  onDismiss,
}: {
  children: ReactNode
  className: string
  onDismiss: () => void
}) {
  return (
    <div className={`${className} flex items-center justify-between gap-3`}>
      {children}
      <DismissButton onClick={onDismiss} />
    </div>
  )
}

function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="-m-1 shrink-0 cursor-pointer rounded-md p-1"
      type="button"
      aria-label="Close"
      onClick={onClick}
    >
      <svg
        className="size-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    </button>
  )
}
