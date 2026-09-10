import { useEffect, useRef, type ReactNode } from 'react'
import { errorSummaryClass, successClass } from './styles.ts'

export type Status = 'idle' | 'error' | 'success'

export type Errors = Record<string, string | undefined>

export function StatusMessages({
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
      <SuccessMessage onDismiss={onDismiss}>
        Thanks — your message was sent.
      </SuccessMessage>
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
      <ErrorSummary
        onDismiss={onDismiss}
        alertFocusKey={alertFocusKey}
        errors={fields.flatMap((field) => {
          const message = errors[field.name]
          return message ? [{ href: `#${field.id}`, message }] : []
        })}
      />
    )
  }

  return null
}

function ErrorSummary({
  errors,
  onDismiss,
  alertFocusKey,
}: {
  errors: { href: string; message: string }[]
  onDismiss: () => void
  alertFocusKey?: number
}) {
  return (
    <Alert focusKey={alertFocusKey} onDismiss={onDismiss}>
      <p className="mt-0 mb-1.5">Fix the following:</p>
      <ul className="m-0 list-disc pl-5">
        {errors.map((error) => (
          <li key={error.href}>
            <a className="text-danger" href={error.href}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  )
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
      className={`${errorSummaryClass} flex items-center justify-between gap-3`}
      role="alert"
      tabIndex={-1}
    >
      <div className="min-w-0">{children}</div>
      <DismissButton onClick={onDismiss} />
    </div>
  )
}

function SuccessMessage({
  children,
  onDismiss,
}: {
  children: string
  onDismiss: () => void
}) {
  return (
    <div className={`${successClass} flex items-center justify-between gap-3`}>
      <p className="m-0" role="status">
        {children}
      </p>
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
