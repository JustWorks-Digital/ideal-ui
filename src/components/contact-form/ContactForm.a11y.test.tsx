import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm as BasicContactForm } from './basic/ContactForm.tsx'
import { ContactForm as MuiContactForm } from './mui/ContactForm.tsx'
import { ContactForm as ReactAriaContactForm } from './react-aria/ContactForm.tsx'
import { ContactForm as RjsfContactForm } from './rjsf/ContactForm.tsx'
import { ContactForm as ShadcnContactForm } from './shadcn/ContactForm.tsx'

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
    messages: {},
  },
] as const

const variations = [
  { name: 'basic', render: () => <BasicContactForm fields={fields} /> },
  { name: 'mui', render: () => <MuiContactForm /> },
  { name: 'react-aria', render: () => <ReactAriaContactForm fields={fields} /> },
  { name: 'shadcn', render: () => <ShadcnContactForm /> },
  { name: 'rjsf', render: () => <RjsfContactForm /> },
]

function missingDescribedByIds(field: HTMLElement) {
  const ids =
    field.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? []
  return ids.filter((id) => !document.getElementById(id))
}

function fieldLabel(field: HTMLElement) {
  if (field.labels?.[0]) {
    return field.labels[0]
  }

  if (field.id) {
    return document.querySelector(`label[for="${field.id}"]`)
  }

  return null
}

function usesRequiredAsterisk() {
  return Boolean(fieldLabel(screen.getByLabelText(/^Name/))?.textContent?.includes('*'))
}

async function submitEmpty() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  return user
}

async function submitValid() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
  await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
  await user.type(screen.getByLabelText(/^Message/), 'Hello from Ideal.')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  return user
}

describe.each(variations)('$name ADA', ({ render: renderForm }) => {
  it('labels the name, email, and message fields (WCAG 1.3.1 / 4.1.2)', () => {
    render(renderForm())

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument()
  })

  it('marks name and email as required (WCAG 3.3.2)', () => {
    render(renderForm())

    expect(screen.getByLabelText(/^Name/)).toBeRequired()
    expect(screen.getByLabelText(/^Email/)).toBeRequired()
  })

  it('explains required asterisks when they are used (WCAG 3.3.2)', ({ skip }) => {
    render(renderForm())
    if (!usesRequiredAsterisk()) {
      skip()
    }

    expect(
      screen.getByText(/Required fields are marked with an asterisk/),
    ).toBeInTheDocument()
  })

  it('does not point aria-describedby at missing ids when idle (WCAG 1.3.1 / 4.1.2)', () => {
    render(renderForm())

    expect(missingDescribedByIds(screen.getByLabelText(/^Name/))).toEqual([])
    expect(missingDescribedByIds(screen.getByLabelText(/^Email/))).toEqual([])
    expect(missingDescribedByIds(screen.getByLabelText(/^Message/))).toEqual([])
  })

  it('shows field errors after a failed submit (WCAG 3.3.1)', async () => {
    render(renderForm())
    await submitEmpty()

    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Enter your email address.').length,
    ).toBeGreaterThan(0)
  })

  it('marks invalid fields with aria-invalid (WCAG 4.1.2)', async () => {
    render(renderForm())
    await submitEmpty()

    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('associates field errors as the accessible description (WCAG 1.3.1 / 4.1.2)', async () => {
    render(renderForm())
    await submitEmpty()

    expect(screen.getByLabelText(/^Name/)).toHaveAccessibleDescription(
      /Enter your name/,
    )
    expect(screen.getByLabelText(/^Email/)).toHaveAccessibleDescription(
      /Enter your email address/,
    )
  })

  it('points aria-describedby only at ids that exist after a failed submit (WCAG 1.3.1 / 4.1.2)', async () => {
    render(renderForm())
    await submitEmpty()

    expect(missingDescribedByIds(screen.getByLabelText(/^Name/))).toEqual([])
    expect(missingDescribedByIds(screen.getByLabelText(/^Email/))).toEqual([])
  })

  it('exposes an error summary as an alert when the form has one (WCAG 3.3.1 / 4.1.2)', async ({
    skip,
  }) => {
    render(renderForm())
    await submitEmpty()
    if (!screen.queryByText('Fix the following:')) {
      skip()
    }

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('moves focus to the error summary when the form has one (WCAG 3.3.1)', async ({
    skip,
  }) => {
    render(renderForm())
    await submitEmpty()
    if (!screen.queryByText('Fix the following:')) {
      skip()
    }

    expect(screen.getByRole('alert')).toHaveFocus()
  })

  it('keeps field errors and focuses the form when the error message is closed', async ({
    skip,
  }) => {
    const user = userEvent.setup()
    render(renderForm())
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    const close = screen.queryByRole('button', { name: 'Close' })
    if (!close) {
      skip()
    }

    await user.click(close)
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(document.querySelector('form')).toHaveFocus()
  })

  it('uses the field invalid message for a bad email (WCAG 3.3.1)', async () => {
    const user = userEvent.setup()
    render(renderForm())
    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(
      screen.getAllByText('Enter a valid email address.').length,
    ).toBeGreaterThan(0)
  })

  it('announces success after a valid submit (WCAG 4.1.3)', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    render(renderForm())
    await submitValid()

    const message = await screen.findByText('Thanks — your message was sent.')
    expect(
      message.closest('[role="status"], [role="alert"], [aria-live]'),
    ).not.toBeNull()
    fetchMock.mockRestore()
  })

  it('focuses the form when the success message is closed', async ({ skip }) => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    const user = userEvent.setup()
    render(renderForm())
    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await user.type(screen.getByLabelText(/^Message/), 'Hello from Ideal.')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await screen.findByText('Thanks — your message was sent.')
    const close = screen.queryByRole('button', { name: 'Close' })
    if (!close) {
      fetchMock.mockRestore()
      skip()
    }

    await user.click(close)
    expect(screen.queryByText('Thanks — your message was sent.')).not.toBeInTheDocument()
    expect(document.querySelector('form')).toHaveFocus()
    fetchMock.mockRestore()
  })
})
