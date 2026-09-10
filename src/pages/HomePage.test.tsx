import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage.tsx'

describe('HomePage', () => {
  it('links to the contact and checkout form pages', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Contact form' })).toHaveAttribute(
      'href',
      '/contact-form',
    )
    expect(screen.getByRole('link', { name: 'Checkout form' })).toHaveAttribute(
      'href',
      '/checkout-form',
    )
  })
})
