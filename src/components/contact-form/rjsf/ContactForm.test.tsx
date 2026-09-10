import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm.tsx'

describe('ContactForm', () => {
  it('renders the schema fields', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument()
  })

  it('shows schema validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Fix the following:')).toBeInTheDocument()
    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Enter your email address.').length,
    ).toBeGreaterThan(0)
  })

  it('uses the field invalid message for a bad email', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email')
    await user.type(screen.getByLabelText(/^Message/), 'Hello from Ideal.')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(
      screen.getAllByText('Enter a valid email address.').length,
    ).toBeGreaterThan(0)
  })

  it('posts formData and shows success', async () => {
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
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello from Ideal.',
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Thanks — your message was sent.',
    )
    expect(screen.getByLabelText(/^Name/)).toHaveValue('')
    expect(screen.getByLabelText(/^Email/)).toHaveValue('')
    expect(screen.getByLabelText(/^Message/)).toHaveValue('')

    fetchMock.mockRestore()
  })

  it('locks the form while the request is pending', async () => {
    const user = userEvent.setup()
    let finish!: (value: Response) => void
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve
        }),
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Sending…')

    finish(new Response('{}', { status: 200 }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Thanks — your message was sent.',
      )
    })
    expect(screen.getByLabelText(/^Name/)).not.toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()

    fetchMock.mockRestore()
  })

  it('dismisses the error summary', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByText('Fix the following:')).not.toBeInTheDocument()
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
  })

  it('dismisses the success message', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Thanks — your message was sent.',
      )
    })
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
  })
})
