import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm, type FieldDefinition } from './ContactForm.tsx'

const fields = [
  {
    id: 'contact-name',
    name: 'name',
    label: 'Name',
    type: 'text',
    autoComplete: 'name',
    required: true,
    messages: { required: 'Enter your name.' },
  },
  {
    id: 'contact-email',
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    required: true,
    messages: {
      required: 'Enter your email address.',
      invalid: 'Enter a valid email address.',
    },
  },
  {
    id: 'contact-message',
    name: 'message',
    label: 'Message',
    rows: 5,
  },
] as const satisfies readonly FieldDefinition[]

async function fillValid(
  user: ReturnType<typeof userEvent.setup>,
  message = 'Hello from Ideal.',
) {
  await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
  await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
  await user.type(screen.getByLabelText(/^Message/), message)
}

describe('ContactForm', () => {
  it('shows errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Enter your name.')
    expect(alert).toHaveTextContent('Enter your email address.')
  })

  it('uses the field invalid message for a bad email', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid email address.',
    )
  })

  it('shows a success message after a valid submit', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Thanks — your message was sent.',
    )
  })

  it('renders fields provided by the caller', () => {
    render(
      <ContactForm
        fields={[
          {
            id: 'contact-subject',
            name: 'subject',
            label: 'Subject',
            required: true,
            messages: { required: 'Enter a subject.' },
          },
        ]}
      />,
    )

    expect(screen.getByLabelText(/^Subject/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Name/)).not.toBeInTheDocument()
  })

  it('uses the caller-provided submit label', () => {
    render(<ContactForm fields={fields} submitLabel="Send message" />)

    expect(
      screen.getByRole('button', { name: 'Send message' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Submit' }),
    ).not.toBeInTheDocument()
  })

  it('exposes action and method on the form', () => {
    render(<ContactForm fields={fields} action="/api/contact" method="post" />)

    const form = document.querySelector('form')
    expect(form).toHaveAttribute('action', '/api/contact')
    expect(form).toHaveAttribute('method', 'post')
  })

  it('calls onSubmit with the form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm fields={fields} onSubmit={onSubmit} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const data = onSubmit.mock.calls[0]?.[0] as FormData
    expect(data.get('name')).toBe('Ada Lovelace')
    expect(data.get('email')).toBe('ada@example.com')
    expect(data.get('message')).toBe('Hello from Ideal.')
  })

  it('logs when onSubmit throws', async () => {
    const user = userEvent.setup()
    const error = new Error('Could not send the message.')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ContactForm
        fields={fields}
        onSubmit={() => {
          throw error
        }}
      />,
    )

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(log).toHaveBeenCalledWith(error)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not send the message.',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    log.mockRestore()
  })

  it('locks the form while onSubmit is pending', async () => {
    const user = userEvent.setup()
    let finish!: () => void
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    render(<ContactForm fields={fields} onSubmit={onSubmit} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('readonly')
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('readonly')
    expect(screen.getByLabelText(/^Message/)).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Sending…')

    finish()

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Thanks — your message was sent.',
      )
    })
    expect(screen.getByLabelText(/^Name/)).not.toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
  })

  it('dismisses the error summary', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
  })

  it('dismisses the success message', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('marks required fields with an asterisk and a key', () => {
    render(<ContactForm fields={fields} />)

    expect(
      screen.getByText(/Required fields are marked with an asterisk/),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Contact' })).toBeInTheDocument()
  })

  it('clears a field error when the value becomes valid', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')

    expect(screen.getByRole('alert')).not.toHaveTextContent('Enter your name.')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter your email address.',
    )
  })

  it('moves focus to the form when a message is dismissed', async () => {
    const user = userEvent.setup()
    render(<ContactForm fields={fields} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(document.querySelector('form')).toHaveFocus()
  })
})
