import Form from '@rjsf/core'
import {
  englishStringTranslator,
  TranslatableString,
  type ErrorListProps,
  type RJSFSchema,
  type RJSFValidationError,
  type UiSchema,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { useMemo, useRef, useState, type ComponentProps, type ElementType } from 'react'
import './rjsf.css'

type FormContext = {
  hideSummary: boolean
  onDismiss: () => void
}

const fieldMessages: Record<string, { required?: string; format?: string }> = {
  name: { required: 'Enter your name.' },
  email: {
    required: 'Enter your email address.',
    format: 'Enter a valid email address.',
  },
}

function transformErrors(errors: RJSFValidationError[]) {
  return errors.map((error) => {
    const field = error.property?.replace(/^\./, '')
    const messages = field ? fieldMessages[field] : undefined
    const message =
      error.name === 'required'
        ? messages?.required
        : error.name === 'format'
          ? messages?.format
          : undefined

    if (!message) {
      return error
    }

    return { ...error, message, stack: message }
  })
}

function translateString(
  stringToTranslate: TranslatableString,
  params?: string[],
) {
  if (stringToTranslate === TranslatableString.ErrorsLabel) {
    return 'Fix the following:'
  }

  return englishStringTranslator(stringToTranslate, params)
}

const schema: RJSFSchema = {
  title: 'Contact',
  description: 'Required fields are marked with an asterisk (*).',
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: {
      type: 'string',
      title: 'Name',
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
    },
    message: {
      type: 'string',
      title: 'Message',
    },
  },
}

const uiSchema: UiSchema = {
  name: {
    'ui:autocomplete': 'name',
  },
  email: {
    'ui:autocomplete': 'email',
  },
  message: {
    'ui:widget': 'textarea',
    'ui:options': { rows: 5 },
  },
}

function FormTag({
  children,
  as,
  ...props
}: ComponentProps<'form'> & { as?: ElementType }) {
  const Tag = as ?? 'form'
  return (
    <Tag tabIndex={-1} {...props}>
      {children}
    </Tag>
  )
}

export function ContactForm() {
  const formRef = useRef<Form>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [hideSummary, setHideSummary] = useState(false)
  const pendingRef = useRef(false)
  const templates = useMemo(() => ({ ErrorListTemplate }), [])

  function dismissMessages() {
    formRef.current?.formElement.current?.focus()
    setHideSummary(true)
    setSubmitted(false)
  }

  return (
    <div className="grid gap-4">
      {pending ? (
        <p className="sr-only" role="status">
          Sending…
        </p>
      ) : submitted ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-ok-bg p-4 font-semibold text-ok">
          <p className="m-0" role="status">
            Thanks — your message was sent.
          </p>
          <DismissButton onClick={dismissMessages} />
        </div>
      ) : null}
      <Form
        ref={formRef}
        className="rjsf"
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        noHtml5Validate
        readonly={pending}
        showErrorList={hideSummary ? false : 'top'}
        transformErrors={transformErrors}
        translateString={translateString}
        templates={templates}
        formContext={{ hideSummary, onDismiss: dismissMessages } satisfies FormContext}
        _internalFormWrapper={FormTag}
        onError={() => setHideSummary(false)}
        onSubmit={({ formData }) => {
          if (pendingRef.current) {
            return
          }

          pendingRef.current = true
          setPending(true)
          setSubmitted(false)

          void (async () => {
            try {
              const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              })
              if (!response.ok) {
                throw new Error('Could not send the message.')
              }
              formRef.current?.reset()
              setSubmitted(true)
            } finally {
              pendingRef.current = false
              setPending(false)
            }
          })()
        }}
      >
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Submit'}
        </button>
      </Form>
    </div>
  )
}

function ErrorListTemplate({ errors, registry }: ErrorListProps) {
  const { hideSummary, onDismiss } = registry.formContext as FormContext
  const { translateString } = registry

  if (hideSummary || errors.length === 0) {
    return null
  }

  return (
    <div className="panel panel-danger errors">
      <div className="min-w-0">
        <div className="panel-heading">
          <h3 className="panel-title">
            {translateString(TranslatableString.ErrorsLabel)}
          </h3>
        </div>
        <ul className="list-group">
          {errors.map((error, index) => (
            <li key={error.property ?? index} className="list-group-item text-danger">
              {error.stack}
            </li>
          ))}
        </ul>
      </div>
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
