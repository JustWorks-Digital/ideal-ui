import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CheckoutForm } from './CheckoutForm.tsx'

describe('CheckoutForm', () => {
  it('groups contact, shipping, and payment fields', () => {
    render(<CheckoutForm />)

    expect(screen.getByRole('group', { name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Shipping' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Payment' })).toBeInTheDocument()
  })

  it('shows errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm />)

    await user.click(screen.getByRole('button', { name: 'Place order' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Enter your email address.')
    expect(alert).toHaveTextContent('Enter your full name.')
    expect(alert).toHaveTextContent('Select a country.')
  })

  it('shows a demo success message after a valid submit', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Address'), '1 Analytical Engine Rd')
    await user.type(screen.getByLabelText('City'), 'London')
    await user.type(screen.getByLabelText('Postal code'), 'SW1A 1AA')
    await user.selectOptions(screen.getByLabelText('Country'), 'GB')
    await user.type(screen.getByLabelText('Card number'), '4111111111111111')
    await user.type(screen.getByLabelText('Expiry (MM/YY)'), '12/30')
    await user.type(screen.getByLabelText('Security code'), '123')
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Order placed. This is a demo — nothing was charged.',
    )
  })
})
