import { CircleAlert, CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert, AlertTitle } from './ui/alert.tsx'
import { Button } from './ui/button.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { Textarea } from './ui/textarea.tsx'

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
    <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
      {submitError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{submitError}</AlertTitle>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>Thanks — your message was sent.</AlertTitle>
        </Alert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name) || undefined}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email) || undefined}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} />
      </div>
      <Button type="submit" disabled={pending}>
        Submit
      </Button>
    </form>
  )
}
