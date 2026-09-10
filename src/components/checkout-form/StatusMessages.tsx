import { useEffect, useRef } from 'react'
import { errorSummaryClass, successClass } from './styles.ts'

export type Status = 'idle' | 'error' | 'success'

export type Errors = {
  email?: string
  fullName?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  cardNumber?: string
  expiry?: string
  cvc?: string
}

const fields: { key: keyof Errors; href: string }[] = [
  { key: 'email', href: '#checkout-email' },
  { key: 'fullName', href: '#checkout-name' },
  { key: 'address', href: '#checkout-address' },
  { key: 'city', href: '#checkout-city' },
  { key: 'postalCode', href: '#checkout-postal' },
  { key: 'country', href: '#checkout-country' },
  { key: 'cardNumber', href: '#checkout-card' },
  { key: 'expiry', href: '#checkout-expiry' },
  { key: 'cvc', href: '#checkout-cvc' },
]

export function StatusMessages({
  status,
  errors,
}: {
  status: Status
  errors: Errors
}) {
  if (status === 'success') {
    return (
      <SuccessMessage>
        Order placed. This is a demo — nothing was charged.
      </SuccessMessage>
    )
  }

  if (status === 'error') {
    return (
      <ErrorSummary
        errors={fields.flatMap(({ key, href }) => {
          const message = errors[key]
          return message ? [{ href, message }] : []
        })}
      />
    )
  }

  return null
}

function ErrorSummary({
  errors,
}: {
  errors: { href: string; message: string }[]
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [errors])

  return (
    <div ref={ref} className={errorSummaryClass} role="alert" tabIndex={-1}>
      <p className="mt-0 mb-1.5">Fix the following:</p>
      <ul className="m-0 list-disc pl-5">
        {errors.map((error) => (
          <li key={error.href}>
            <a className="text-danger" href={error.href}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SuccessMessage({ children }: { children: string }) {
  return (
    <p className={successClass} role="status">
      {children}
    </p>
  )
}
