import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Link,
  TextField,
  Typography,
  type TextFieldProps,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  useForm,
  type FieldError,
  type FieldErrors,
  type RegisterOptions,
  type UseFormRegisterReturn,
} from 'react-hook-form'

export type FieldDefinition = {
  id: string
  name: string
  label: string
  required?: boolean
  type?: TextFieldProps['type']
  autoComplete?: string
  rows?: number
  messages?: {
    required?: string
    invalid?: string
  }
}

type Status = 'idle' | 'error' | 'success'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0b57d0' },
        error: { main: '#b3261e' },
        success: { main: '#0c6b38' },
        background: { default: '#f7f7f5', paper: '#ffffff' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#8ab4f8' },
        error: { main: '#f2b8b5' },
        success: { main: '#7dca9a' },
        background: { default: '#161616', paper: '#222222' },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#767672',
          '.dark &': {
            borderColor: '#8a8a86',
          },
        },
      },
    },
  },
})

function rulesFor(field: FieldDefinition): RegisterOptions {
  return {
    required: field.required ? field.messages?.required : false,
    pattern:
      field.type === 'email' && field.messages?.invalid
        ? { value: emailPattern, message: field.messages.invalid }
        : undefined,
    setValueAs: (value) => String(value).trim(),
  }
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
  const [submitError, setSubmitError] = useState<string>()
  const [alertFocusKey, setAlertFocusKey] = useState(0)
  const [pending, setPending] = useState(false)
  const hasRequired = fields.some((field) => field.required)

  const { register, handleSubmit, reset, formState } = useForm({
    shouldFocusError: false,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: Object.fromEntries(fields.map((field) => [field.name, ''])),
  })

  const { errors, submitCount } = formState
  const hasFieldErrors = fields.some((field) => errors[field.name])
  const prevSubmitCount = useRef(0)

  useEffect(() => {
    if (submitCount > prevSubmitCount.current) {
      prevSubmitCount.current = submitCount
      if (hasFieldErrors) {
        setSubmitError(undefined)
        setStatus('error')
        setAlertFocusKey((key) => key + 1)
      }
      return
    }

    if (status === 'error' && !submitError && !hasFieldErrors) {
      setStatus('idle')
    }
  }, [hasFieldErrors, status, submitCount, submitError])

  function dismissMessages() {
    formRef.current?.focus()
    setStatus('idle')
    setSubmitError(undefined)
  }

  async function onValid(values: Record<string, string>) {
    const data = new FormData()
    for (const field of fields) {
      data.append(field.name, values[field.name] ?? '')
    }

    if (onSubmit) {
      setPending(true)
      try {
        await onSubmit(data)
        reset()
        setStatus('success')
      } catch (error) {
        console.error(error)
        setStatus('error')
        setSubmitError('Could not send the message.')
        setAlertFocusKey((key) => key + 1)
      } finally {
        setPending(false)
      }
      return
    }

    if (!action) {
      reset()
      setStatus('success')
    }
  }

  return (
    <Box
      component="form"
      ref={formRef}
      sx={{ display: 'grid', gap: 2, outline: 'none' }}
      action={action}
      method={method}
      onSubmit={handleSubmit(onValid)}
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

      <Box
        component="fieldset"
        sx={{ m: 0, display: 'grid', gap: 2, border: 0, p: 0 }}
      >
        <Typography component="legend" sx={{ p: 0, fontWeight: 600 }}>
          Contact
        </Typography>
        {hasRequired ? (
          <Typography color="text.secondary">
            Required fields are marked with an asterisk (
            <Box component="span" aria-hidden="true">
              *
            </Box>
            ).
          </Typography>
        ) : null}

        {fields.map((field) => (
          <Field
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            autoComplete={field.autoComplete}
            required={field.required}
            multiline={Boolean(field.rows)}
            rows={field.rows}
            readOnly={pending}
            fieldError={errors[field.name]}
            registration={register(field.name, rulesFor(field))}
          />
        ))}
      </Box>

      <Button
        type="submit"
        variant="contained"
        disabled={pending}
        loading={pending}
        sx={{ justifySelf: 'start' }}
      >
        {pending ? 'Sending…' : submitLabel}
      </Button>
    </Box>
  )
}

function Field({
  fieldError,
  readOnly,
  registration,
  ...props
}: Omit<TextFieldProps, 'error'> & {
  readOnly?: boolean
  fieldError?: FieldError
  registration: UseFormRegisterReturn
}) {
  return (
    <TextField
      {...props}
      error={Boolean(fieldError)}
      helperText={fieldError?.message}
      inputRef={registration.ref}
      name={registration.name}
      onChange={registration.onChange}
      onBlur={registration.onBlur}
      slotProps={{ htmlInput: { readOnly } }}
    />
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
  errors: FieldErrors
  fields: readonly FieldDefinition[]
  pending?: boolean
  submitError?: string
  alertFocusKey?: number
  onDismiss: () => void
}) {
  if (pending) {
    return (
      <Typography role="status" sx={visuallyHidden}>
        Sending…
      </Typography>
    )
  }

  if (status === 'success') {
    return (
      <Alert severity="success" role="status" onClose={onDismiss}>
        Thanks — your message was sent.
      </Alert>
    )
  }

  if (status === 'error' && submitError) {
    return (
      <FocusAlert focusKey={alertFocusKey} onClose={onDismiss}>
        {submitError}
      </FocusAlert>
    )
  }

  if (status === 'error') {
    const summary = fields.flatMap((field) => {
      const message = errors[field.name]?.message
      return typeof message === 'string'
        ? [{ href: `#${field.id}`, message }]
        : []
    })

    return (
      <FocusAlert focusKey={alertFocusKey} onClose={onDismiss}>
        <AlertTitle>Fix the following:</AlertTitle>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {summary.map((error) => (
            <li key={error.href}>
              <Link href={error.href} color="inherit">
                {error.message}
              </Link>
            </li>
          ))}
        </Box>
      </FocusAlert>
    )
  }

  return null
}

function FocusAlert({
  children,
  focusKey,
  onClose,
}: {
  children: ReactNode
  focusKey: unknown
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [focusKey])

  return (
    <Alert
      ref={ref}
      severity="error"
      role="alert"
      tabIndex={-1}
      onClose={onClose}
    >
      {children}
    </Alert>
  )
}

export function MuiProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
