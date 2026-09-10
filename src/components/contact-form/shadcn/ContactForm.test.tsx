import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm.tsx'

describe('ContactForm', () => {
  it('renders the contact fields', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument()
  })

  it('shows field helper text when submitted empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
  })

  it('uses the field invalid message for a bad email', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('posts form data and shows success', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await user.type(screen.getByLabelText(/^Message/), 'Hello from Ideal.')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    const body = fetchMock.mock.calls[0]?.[1]?.body as FormData
    expect(body.get('name')).toBe('Ada Lovelace')
    expect(body.get('email')).toBe('ada@example.com')
    expect(body.get('message')).toBe('Hello from Ideal.')
    expect(screen.getByText('Thanks — your message was sent.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toHaveValue('')
    expect(screen.getByLabelText(/^Email/)).toHaveValue('')
    expect(screen.getByLabelText(/^Message/)).toHaveValue('')

    fetchMock.mockRestore()
  })

  it('shows an error alert when the request fails', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 500 }),
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('Could not send the message.')).toBeInTheDocument()
    expect(
      screen.queryByText('Thanks — your message was sent.'),
    ).not.toBeInTheDocument()
    log.mockRestore()
  })
})
