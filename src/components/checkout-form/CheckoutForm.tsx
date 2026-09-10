import { useState, type SubmitEvent } from 'react'
import { StatusMessages, type Errors, type Status } from './StatusMessages.tsx'
import {
  buttonClass,
  controlClass,
  fieldClass,
  fieldErrorClass,
  fieldRowClass,
  fieldsetClass,
  formClass,
  labelClass,
  legendClass,
} from './styles.ts'

export function CheckoutForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const email = String(data.get('email') ?? '').trim()
    const fullName = String(data.get('fullName') ?? '').trim()
    const address = String(data.get('address') ?? '').trim()
    const city = String(data.get('city') ?? '').trim()
    const postalCode = String(data.get('postalCode') ?? '').trim()
    const country = String(data.get('country') ?? '').trim()
    const cardNumber = String(data.get('cardNumber') ?? '').replaceAll(' ', '')
    const expiry = String(data.get('expiry') ?? '').trim()
    const cvc = String(data.get('cvc') ?? '').trim()

    const nextErrors: Errors = {}
    if (!email) nextErrors.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!fullName) nextErrors.fullName = 'Enter your full name.'
    if (!address) nextErrors.address = 'Enter your street address.'
    if (!city) nextErrors.city = 'Enter your city.'
    if (!postalCode) nextErrors.postalCode = 'Enter your postal code.'
    if (!country) nextErrors.country = 'Select a country.'
    if (!cardNumber) nextErrors.cardNumber = 'Enter a card number.'
    else if (!/^\d{13,19}$/.test(cardNumber)) {
      nextErrors.cardNumber = 'Enter a card number with 13 to 19 digits.'
    }
    if (!expiry) nextErrors.expiry = 'Enter the expiry date.'
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      nextErrors.expiry = 'Enter expiry as MM/YY.'
    }
    if (!cvc) nextErrors.cvc = 'Enter the security code.'
    else if (!/^\d{3,4}$/.test(cvc)) {
      nextErrors.cvc = 'Enter a 3 or 4 digit security code.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error')
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setStatus('success')
    form.reset()
  }

  return (
    <form className={formClass} onSubmit={handleSubmit} noValidate>
      <StatusMessages status={status} errors={errors} />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Contact</legend>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="checkout-email">
            Email
          </label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            className={controlClass}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'checkout-email-error' : undefined}
          />
          {errors.email ? (
            <p id="checkout-email-error" className={fieldErrorClass}>
              {errors.email}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Shipping</legend>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="checkout-name">
            Full name
          </label>
          <input
            id="checkout-name"
            name="fullName"
            type="text"
            autoComplete="shipping name"
            className={controlClass}
            required
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={
              errors.fullName ? 'checkout-name-error' : undefined
            }
          />
          {errors.fullName ? (
            <p id="checkout-name-error" className={fieldErrorClass}>
              {errors.fullName}
            </p>
          ) : null}
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="checkout-address">
            Address
          </label>
          <input
            id="checkout-address"
            name="address"
            type="text"
            autoComplete="shipping street-address"
            className={controlClass}
            required
            aria-invalid={errors.address ? true : undefined}
            aria-describedby={
              errors.address ? 'checkout-address-error' : undefined
            }
          />
          {errors.address ? (
            <p id="checkout-address-error" className={fieldErrorClass}>
              {errors.address}
            </p>
          ) : null}
        </div>
        <div className={fieldRowClass}>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="checkout-city">
              City
            </label>
            <input
              id="checkout-city"
              name="city"
              type="text"
              autoComplete="shipping address-level2"
              className={controlClass}
              required
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? 'checkout-city-error' : undefined}
            />
            {errors.city ? (
              <p id="checkout-city-error" className={fieldErrorClass}>
                {errors.city}
              </p>
            ) : null}
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="checkout-postal">
              Postal code
            </label>
            <input
              id="checkout-postal"
              name="postalCode"
              type="text"
              autoComplete="shipping postal-code"
              className={controlClass}
              required
              aria-invalid={errors.postalCode ? true : undefined}
              aria-describedby={
                errors.postalCode ? 'checkout-postal-error' : undefined
              }
            />
            {errors.postalCode ? (
              <p id="checkout-postal-error" className={fieldErrorClass}>
                {errors.postalCode}
              </p>
            ) : null}
          </div>
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="checkout-country">
            Country
          </label>
          <select
            id="checkout-country"
            name="country"
            autoComplete="shipping country"
            className={controlClass}
            required
            defaultValue=""
            aria-invalid={errors.country ? true : undefined}
            aria-describedby={
              errors.country ? 'checkout-country-error' : undefined
            }
          >
            <option value="" disabled>
              Select a country
            </option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
          {errors.country ? (
            <p id="checkout-country-error" className={fieldErrorClass}>
              {errors.country}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Payment</legend>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="checkout-card">
            Card number
          </label>
          <input
            id="checkout-card"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            className={controlClass}
            required
            aria-invalid={errors.cardNumber ? true : undefined}
            aria-describedby={errors.cardNumber ? 'checkout-card-error' : undefined}
          />
          {errors.cardNumber ? (
            <p id="checkout-card-error" className={fieldErrorClass}>
              {errors.cardNumber}
            </p>
          ) : null}
        </div>
        <div className={fieldRowClass}>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="checkout-expiry">
              Expiry (MM/YY)
            </label>
            <input
              id="checkout-expiry"
              name="expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              className={controlClass}
              required
              aria-invalid={errors.expiry ? true : undefined}
              aria-describedby={
                errors.expiry ? 'checkout-expiry-error' : undefined
              }
            />
            {errors.expiry ? (
              <p id="checkout-expiry-error" className={fieldErrorClass}>
                {errors.expiry}
              </p>
            ) : null}
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="checkout-cvc">
              Security code
            </label>
            <input
              id="checkout-cvc"
              name="cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              className={controlClass}
              required
              aria-invalid={errors.cvc ? true : undefined}
              aria-describedby={errors.cvc ? 'checkout-cvc-error' : undefined}
            />
            {errors.cvc ? (
              <p id="checkout-cvc-error" className={fieldErrorClass}>
                {errors.cvc}
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <button className={buttonClass} type="submit">
        Place order
      </button>
    </form>
  )
}
