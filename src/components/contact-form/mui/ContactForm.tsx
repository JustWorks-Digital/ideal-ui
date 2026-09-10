import { Alert, Button, Stack, TextField } from '@mui/material'
import { useState, type FormEvent } from 'react'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactForm() {
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const next: { name?: string; email?: string } = {}

    if (!name) {
      next.name = 'Enter your name.'
    }

    if (!email) {
      next.email = 'Enter your email address.'
    } else if (!emailPattern.test(email)) {
      next.email = 'Enter a valid email address.'
    }

    if (next.name || next.email) {
      setErrors(next)
      setSuccess(false)
      setSubmitError(undefined)
      return
    }

    setErrors({})
    setPending(true)
    setSubmitError(undefined)
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: data,
      })
      if (!response.ok) {
        throw new Error('Could not send the message.')
      }
      form.reset()
      setSuccess(true)
    } catch (error) {
      console.error(error)
      setSubmitError('Could not send the message.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Stack component="form" noValidate spacing={2} onSubmit={handleSubmit}>
      {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      {success ? (
        <Alert severity="success">Thanks — your message was sent.</Alert>
      ) : null}
      <TextField
        name="name"
        label="Name"
        autoComplete="name"
        required
        fullWidth
        error={Boolean(errors.name)}
        helperText={errors.name}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email}
      />
      <TextField
        name="message"
        label="Message"
        multiline
        rows={5}
        fullWidth
      />
      <Button type="submit" variant="contained" loading={pending}>
        Submit
      </Button>
    </Stack>
  )
}

