import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ContactFormPage } from './ContactFormPage.tsx'

describe('ContactFormPage', () => {
  it('links to the basic variation', () => {
    render(
      <MemoryRouter>
        <ContactFormPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Basic' })).toHaveAttribute(
      'href',
      '/contact-form/basic',
    )
  })
})
