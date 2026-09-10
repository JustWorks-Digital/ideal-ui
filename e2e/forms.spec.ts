import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual(
    [],
  )
}

test('light and dark theme can be chosen on every page', async ({ page }) => {
  for (const path of [
    '/',
    '/contact-form',
    '/contact-form/basic',
    '/contact-form/mui',
    '/contact-form/react-aria',
    '/contact-form/shadcn',
    '/contact-form/rjsf',
    '/checkout-form',
  ]) {
    await page.goto(path)
    await expect(page.getByRole('group', { name: 'Color theme' })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Light' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('home page has no obvious accessibility violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Ideal' })).toBeVisible()
  await expectNoAxeViolations(page)
})

for (const path of [
  '/contact-form/basic',
  '/contact-form/react-aria',
]) {
  test(`${path} can be completed`, async ({ page }) => {
    await page.route('/api/contact', async (route) => {
      await route.fulfill({ status: 200, body: '{}' })
    })

    await page.goto(path)
    await expectNoAxeViolations(page)

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expectNoAxeViolations(page)

    await page.getByLabel('Name').fill('Ada Lovelace')
    await page.getByLabel('Email').fill('ada@example.com')
    await page.getByLabel('Message').fill('Hello from Ideal.')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByRole('status')).toHaveText(
      'Thanks — your message was sent.',
    )
    await expectNoAxeViolations(page)
  })
}

test('/contact-form/shadcn can be completed', async ({ page }) => {
  await page.route('/api/contact', async (route) => {
    await route.fulfill({ status: 200, body: '{}' })
  })

  await page.goto('/contact-form/shadcn')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Enter your name.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()

  await page.getByLabel('Name').fill('Ada Lovelace')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Hello from Ideal.')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Thanks — your message was sent.')).toBeVisible()
})

test('/contact-form/mui can be completed', async ({ page }) => {
  await page.route('/api/contact', async (route) => {
    await route.fulfill({ status: 200, body: '{}' })
  })

  await page.goto('/contact-form/mui')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Enter your name.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()

  await page.getByLabel('Name').fill('Ada Lovelace')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Hello from Ideal.')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Thanks — your message was sent.')).toBeVisible()
})

test('/contact-form/rjsf can be completed', async ({ page }) => {
  await page.route('/api/contact', async (route) => {
    await route.fulfill({ status: 200, body: '{}' })
  })

  await page.goto('/contact-form/rjsf')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Fix the following:')).toBeVisible()
  await expect(page.getByText('Enter your name.').first()).toBeVisible()

  await page.getByLabel('Name').fill('Ada Lovelace')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Hello from Ideal.')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByRole('status')).toHaveText(
    'Thanks — your message was sent.',
  )
})

test('/contact-form/basic is ADA-complete after a failed submit', async ({
  page,
}) => {
  await page.goto('/contact-form/basic')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Fix the following:')).toBeVisible()

  await expect(page.getByRole('alert')).toHaveCount(1)
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true')
  expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe(
    'alert',
  )

  const missingIds = await page.getByLabel('Name').evaluate((field) => {
    const ids =
      field.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? []
    return ids.filter((id) => !document.getElementById(id))
  })
  expect(missingIds).toEqual([])

  await expectNoAxeViolations(page)
})

test('/contact-form/rjsf is not ADA-complete after a failed submit', async ({
  page,
}) => {
  await page.goto('/contact-form/rjsf')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Fix the following:')).toBeVisible()

  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Name')).not.toHaveAttribute(
    'aria-invalid',
    'true',
  )
  expect(
    await page.evaluate(() => document.activeElement?.textContent),
  ).not.toContain('Fix the following')

  const missingIds = await page.getByLabel('Name').evaluate((field) => {
    const ids =
      field.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? []
    return ids.filter((id) => !document.getElementById(id))
  })
  expect(missingIds.length).toBeGreaterThan(0)

  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.length,
    JSON.stringify(results.violations, null, 2),
  ).toBeGreaterThan(0)
})

test('checkout form can be completed', async ({ page }) => {
  await page.goto('/checkout-form')
  await expectNoAxeViolations(page)

  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Full name').fill('Ada Lovelace')
  await page.getByLabel('Address').fill('1 Analytical Engine Rd')
  await page.getByLabel('City').fill('London')
  await page.getByLabel('Postal code').fill('SW1A 1AA')
  await page.getByLabel('Country').selectOption('GB')
  await page.getByLabel('Card number').fill('4111111111111111')
  await page.getByLabel('Expiry (MM/YY)').fill('12/30')
  await page.getByLabel('Security code').fill('123')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.getByRole('status')).toHaveText(
    'Order placed. This is a demo — nothing was charged.',
  )
})
